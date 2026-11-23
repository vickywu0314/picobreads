#!/usr/bin/env bash
# Put the site on its domain with https (free Let's Encrypt certificate, renewed automatically),
# then point the API at the new address.
#   Usage on the server:  sudo bash ~/beadspark-deploy/setup-https.sh
#   Another domain:       sudo DOMAIN=example.com bash ~/beadspark-deploy/setup-https.sh
# Before running: the domain's DNS A record(s) must point to this server, and ports 80 and 443
# must be open in the cloud firewall (腾讯云控制台 → 防火墙).
set -euo pipefail

DOMAIN="${DOMAIN:-beadspark.top}"
NGINX_SITE="${NGINX_SITE:-/etc/nginx/sites-available/picobreads}"
ENV_FILE=/etc/beadspark/api.env

say() { printf '\n\033[1;35m==> %s\033[0m\n' "$*"; }
die() { printf '\n\033[1;31m!! %s\033[0m\n' "$*" >&2; exit 1; }
[ "$(id -u)" = 0 ] || die "请用 sudo 运行：sudo bash $0"
[ -f "$NGINX_SITE" ] || die "找不到 Nginx 站点配置 $NGINX_SITE"

# --- 1. which names point here ---------------------------------------------------
say "检查域名解析"
MYIP=$(curl -fsS -m 10 https://ifconfig.me 2>/dev/null || curl -fsS -m 10 http://ip.sb 2>/dev/null || true)
NAMES=()
for name in "$DOMAIN" "www.$DOMAIN"; do
  ip=$(getent ahostsv4 "$name" | awk '{print $1; exit}' || true)
  if [ -z "$ip" ]; then
    echo "  $name → 还没有解析"
  elif [ -n "$MYIP" ] && [ "$ip" != "$MYIP" ]; then
    echo "  $name → $ip（不是这台服务器 $MYIP，跳过）"
  else
    echo "  $name → $ip ✓"
    NAMES+=("$name")
  fi
done
[ "${NAMES[0]:-}" = "$DOMAIN" ] || die "$DOMAIN 还没有解析到这台服务器。到域名的 DNS 解析里加一条 A 记录：主机记录 @，记录值 ${MYIP:-服务器 IP}；等几分钟生效后再运行。"

# --- 2. nginx answers for the domain ---------------------------------------------
say "Nginx 站点加上域名"
if grep -qE "^\s*server_name\s+.*\b$DOMAIN\b" "$NGINX_SITE"; then
  echo "已经有了，跳过"
else
  cp "$NGINX_SITE" "$NGINX_SITE.bak.$(date +%Y%m%d%H%M%S)"
  # Keep "_" so the bare IP still works; put the real names first for certbot.
  sed -i "0,/^\(\s*\)server_name .*;/s//\1server_name ${NAMES[*]} _;/" "$NGINX_SITE"
  if ! nginx -t 2>/dev/null; then
    latest=$(ls -t "$NGINX_SITE".bak.* | head -1)
    cp "$latest" "$NGINX_SITE"
    nginx -t || true
    die "Nginx 配置检查没通过，已恢复原配置。把上面的报错发给 Claude。"
  fi
  systemctl reload nginx
fi

# --- 3. certificate ----------------------------------------------------------------
say "申请 https 证书（Let's Encrypt）"
if ! command -v certbot >/dev/null; then
  apt-get update -qq
  DEBIAN_FRONTEND=noninteractive apt-get install -y -qq certbot python3-certbot-nginx
fi
ARGS=()
for n in "${NAMES[@]}"; do ARGS+=(-d "$n"); done
read -r -p "证书到期提醒发到哪个邮箱（可直接回车跳过）: " mail
if [ -n "$mail" ]; then EMAIL=(-m "$mail"); else EMAIL=(--register-unsafely-without-email); fi
certbot --nginx "${ARGS[@]}" --agree-tos --non-interactive --redirect "${EMAIL[@]}" || die "证书没申请下来。常见原因：云防火墙没放行 80 / 443 端口，或域名解析还没生效。把上面的报错发给 Claude。"
systemctl reload nginx

# --- 4. API uses the new address -----------------------------------------------------
if [ -f "$ENV_FILE" ]; then
  say "后端改用 https://$DOMAIN"
  set_kv() {
    local k="$1" v="$2" tmp
    tmp=$(mktemp)
    grep -v "^$k=" "$ENV_FILE" > "$tmp" || true
    printf '%s=%s\n' "$k" "$v" >> "$tmp"
    cat "$tmp" > "$ENV_FILE"
    rm -f "$tmp"
  }
  set_kv SITE_URL "https://$DOMAIN"
  set_kv WXPAY_NOTIFY_URL "https://$DOMAIN/api/pay/wechat/notify"
  systemctl restart beadspark-api
  sleep 2
fi

# --- 5. checks -----------------------------------------------------------------------
say "检查"
curl -fsS -m 15 -o /dev/null "https://$DOMAIN/" && echo "✓ https://$DOMAIN/ 能打开" || echo "✗ https://$DOMAIN/ 打不开（云防火墙放行 443 了吗？）"
curl -fsS -m 15 "https://$DOMAIN/api/health" >/dev/null && echo "✓ https://$DOMAIN/api/health 正常" || echo "✗ 后端通过 https 访问失败"
certbot renew --dry-run -q && echo "✓ 证书会自动续期" || echo "✗ 自动续期测试没通过（不影响现在使用），把 sudo certbot renew --dry-run 的输出发给 Claude"

say "完成。网站：https://$DOMAIN/   订单后台：https://$DOMAIN/admin/"
echo "接下来到小程序后台（开发管理 → 开发设置 → 服务器域名）把 https://$DOMAIN 填进 request 合法域名 和 downloadFile 合法域名。"
