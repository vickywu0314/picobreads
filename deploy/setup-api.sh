#!/usr/bin/env bash
# One-time (and re-runnable) setup of the BeadSpark API on the server.
# GitHub Actions uploads this folder (with server.js) to ~/beadspark-deploy on every deploy.
#   Usage on the server:  sudo bash ~/beadspark-deploy/setup-api.sh
# It: installs Node 22 if needed, creates folders, writes /etc/beadspark/api.env (asks for the
# sender email + authorization code), installs the systemd service, lets the deploy user restart
# it, adds /api/ to Nginx (with a backup and a config test), then checks that everything answers.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
APP_USER="${SUDO_USER:-ubuntu}"
API_DIR=/opt/beadspark-api
DATA_DIR=/var/lib/beadspark
ENV_FILE=/etc/beadspark/api.env
NGINX_SITE="${NGINX_SITE:-/etc/nginx/sites-available/picobreads}"

say() { printf '\n\033[1;35m==> %s\033[0m\n' "$*"; }
die() { printf '\n\033[1;31m!! %s\033[0m\n' "$*" >&2; exit 1; }
[ "$(id -u)" = 0 ] || die "请用 sudo 运行：sudo bash $0"
[ -f "$HERE/server.js" ] || die "找不到 $HERE/server.js —— 先等 GitHub 上的「Deploy to server」跑完一次。"

# --- 1. Node 22.13+ ------------------------------------------------------------
node_ok() { command -v node >/dev/null && node -e 'const [a,b]=process.versions.node.split(".").map(Number);process.exit(a>22||(a===22&&b>=13)?0:1)'; }
if node_ok; then
  say "Node $(node -v) 已安装"
else
  say "安装 Node 22（国内镜像 npmmirror）"
  case "$(uname -m)" in x86_64) ARCH=x64 ;; aarch64|arm64) ARCH=arm64 ;; *) die "不支持的 CPU：$(uname -m)" ;; esac
  BASE=https://npmmirror.com/mirrors/node/latest-v22.x
  FILE=$(curl -fsSL "$BASE/SHASUMS256.txt" | awk -v a="linux-$ARCH.tar.xz" '$2 ~ a {print $2; exit}')
  [ -n "$FILE" ] || die "取不到 Node 版本列表，检查服务器网络"
  TMP=$(mktemp -d)
  curl -fSL --retry 3 -o "$TMP/$FILE" "$BASE/$FILE"
  (cd "$TMP" && curl -fsSL "$BASE/SHASUMS256.txt" | grep " $FILE\$" | sha256sum -c -)
  tar -xJf "$TMP/$FILE" -C /usr/local --strip-components=1
  ln -sf /usr/local/bin/node /usr/bin/node
  rm -rf "$TMP"
  node_ok || die "Node 安装失败"
  say "Node $(node -v) 安装完成"
fi

# --- 2. folders + program ----------------------------------------------------------
say "目录和程序"
mkdir -p "$API_DIR" "$DATA_DIR" /etc/beadspark
chown "$APP_USER:$APP_USER" "$API_DIR" "$DATA_DIR"
install -o "$APP_USER" -g "$APP_USER" -m 644 "$HERE/server.js" "$API_DIR/server.js"

# --- 3. settings (secrets stay in this file only) -------------------------------------
write_env() {
  local site user pass
  read -r -p "网站地址（有域名后改成 https://域名）[http://49.233.85.32]: " site
  site=${site:-http://49.233.85.32}
  read -r -p "发验证码的 QQ 邮箱地址（例如 12345@qq.com）: " user
  read -r -s -p "QQ 邮箱授权码（输入时不显示）: " pass; echo
  [ -n "$user" ] && [ -n "$pass" ] || die "邮箱和授权码都要填"
  local host=smtp.qq.com
  case "$user" in *@gmail.com) host=smtp.gmail.com ;; *@163.com) host=smtp.163.com ;; esac
  umask 027
  cat > "$ENV_FILE" <<EOF
SITE_URL=$site
PORT=8787
DB_PATH=$DATA_DIR/beadspark.db
SMTP_HOST=$host
SMTP_PORT=465
SMTP_USER=$user
SMTP_PASS=$pass
MAIL_FROM_NAME=BeadSpark
# Third-party sign-in: fill in, then: sudo systemctl restart beadspark-api
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
WECHAT_APP_ID=
WECHAT_APP_SECRET=
APPLE_CLIENT_ID=
APPLE_TEAM_ID=
APPLE_KEY_ID=
APPLE_PRIVATE_KEY=
EOF
  chown "root:$APP_USER" "$ENV_FILE"
  chmod 640 "$ENV_FILE"
}
if [ -f "$ENV_FILE" ]; then
  read -r -p "已有配置 $ENV_FILE，要重新填写吗？[y/N] " again
  [[ "$again" =~ ^[Yy]$ ]] && write_env
else
  say "填写配置（只保存在服务器的 $ENV_FILE 里）"
  write_env
fi

# --- 4. service ----------------------------------------------------------------
say "后台服务 beadspark-api"
sed "s/^User=.*/User=$APP_USER/" "$HERE/beadspark-api.service" > /etc/systemd/system/beadspark-api.service
systemctl daemon-reload
systemctl enable beadspark-api >/dev/null
systemctl restart beadspark-api
echo "$APP_USER ALL=(root) NOPASSWD: /usr/bin/systemctl restart beadspark-api, /bin/systemctl restart beadspark-api" > /etc/sudoers.d/beadspark-api
chmod 440 /etc/sudoers.d/beadspark-api
visudo -cf /etc/sudoers.d/beadspark-api >/dev/null || { rm -f /etc/sudoers.d/beadspark-api; die "sudoers 规则无效，已删除"; }

# --- 5. Nginx /api/ -----------------------------------------------------------------
say "Nginx 转发 /api/"
mkdir -p /etc/nginx/snippets
grep -v '^#' "$HERE/nginx-api.conf" > /etc/nginx/snippets/beadspark-api.conf
[ -f "$NGINX_SITE" ] || die "找不到 Nginx 站点配置 $NGINX_SITE（可用 NGINX_SITE=路径 sudo -E bash $0 指定）"
if grep -q 'snippets/beadspark-api.conf' "$NGINX_SITE"; then
  echo "已配置过，跳过"
else
  cp "$NGINX_SITE" "$NGINX_SITE.bak.$(date +%Y%m%d%H%M%S)"
  # Insert the include right after the first server_name line.
  sed -i '0,/^\s*server_name .*;/s//&\n    include snippets\/beadspark-api.conf;/' "$NGINX_SITE"
  grep -q 'snippets/beadspark-api.conf' "$NGINX_SITE" || die "没能自动修改 $NGINX_SITE，请手动在 server { } 里加一行：include snippets/beadspark-api.conf;"
fi
if nginx -t 2>/dev/null; then
  systemctl reload nginx
else
  latest=$(ls -t "$NGINX_SITE".bak.* 2>/dev/null | head -1)
  [ -n "$latest" ] && cp "$latest" "$NGINX_SITE"
  nginx -t || true
  die "Nginx 配置检查没通过，已恢复原配置。把上面的报错发给 Claude。"
fi

# --- 6. checks ---------------------------------------------------------------------
say "检查"
sleep 2
curl -fsS http://127.0.0.1:8787/api/health >/dev/null && echo "✓ 后端服务正常" || { journalctl -u beadspark-api -n 30 --no-pager; die "后端没起来，把上面的日志发给 Claude"; }
curl -fsS -H 'Host: localhost' http://127.0.0.1/api/health >/dev/null && echo "✓ Nginx 转发正常" || echo "✗ 通过 Nginx 访问 /api/health 失败，把 sudo nginx -T 的输出发给 Claude"
journalctl -u beadspark-api -n 3 --no-pager | tail -1

read -r -p "发一封测试验证码邮件到哪个邮箱？（直接回车跳过）: " to
if [ -n "$to" ]; then
  res=$(curl -sS -X POST -H 'content-type: application/json' -d "{\"email\":\"$to\",\"purpose\":\"register\"}" http://127.0.0.1:8787/api/auth/email/send-code || true)
  case "$res" in
    *'"ok":true'*) echo "✓ 已发送，去 $to 收件箱看看（也看看垃圾邮件）" ;;
    *) echo "✗ 发送失败：$res"; journalctl -u beadspark-api -n 15 --no-pager | grep -i mail || true ;;
  esac
fi
say "完成。以后每次推送代码，GitHub 会自动更新并重启后端。"
