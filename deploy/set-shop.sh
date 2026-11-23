#!/usr/bin/env bash
# Open the shop: WeChat Pay merchant settings + prices for the BeadSpark API, then restart it.
#   Usage on the server:  sudo bash ~/beadspark-deploy/set-shop.sh
# Everything is written only to /etc/beadspark/api.env on this server. Leave an answer empty to
# keep the current value. A form (材料包 / 成品) goes on sale once all three of its prices are set.
set -euo pipefail
ENV_FILE=/etc/beadspark/api.env
[ "$(id -u)" = 0 ] || { echo "请用 sudo 运行：sudo bash $0" >&2; exit 1; }
[ -f "$ENV_FILE" ] || { echo "找不到 $ENV_FILE，先运行 setup-api.sh" >&2; exit 1; }

cur() { grep "^$1=" "$ENV_FILE" | tail -1 | cut -d= -f2- || true; }
set_kv() {
  local k="$1" v="$2" tmp
  tmp=$(mktemp)
  grep -v "^$k=" "$ENV_FILE" > "$tmp" || true
  printf '%s=%s\n' "$k" "$v" >> "$tmp"
  cat "$tmp" > "$ENV_FILE"
  rm -f "$tmp"
}
ask() { # key, prompt, [secret]
  local k="$1" p="$2" v old
  old=$(cur "$k")
  if [ "${3:-}" = secret ]; then
    read -r -s -p "$p${old:+ [已填，回车不改]}: " v; echo
  else
    read -r -p "$p${old:+ [$old]}: " v
  fi
  [ -n "$v" ] && set_kv "$k" "$v"
  return 0
}

echo "== 微信支付商户（商户平台 pay.weixin.qq.com → 账户中心 → API安全）=="
ask WXPAY_MCH_ID "商户号"
ask WXPAY_API_V3_KEY "APIv3 密钥（32 位，输入时不显示）" secret
ask WXPAY_SERIAL_NO "商户 API 证书序列号"
ask WXPAY_PRIVATE_KEY_FILE "商户私钥文件 apiclient_key.pem 在服务器上的路径（建议放 /etc/beadspark/apiclient_key.pem）"
keyfile=$(cur WXPAY_PRIVATE_KEY_FILE)
if [ -n "$keyfile" ]; then
  if [ -f "$keyfile" ]; then
    chown root:"${SUDO_USER:-ubuntu}" "$keyfile" && chmod 640 "$keyfile"
  else
    echo "!! 找不到 $keyfile —— 先把 apiclient_key.pem 传到服务器这个位置再运行一次"
  fi
fi
site=$(cur SITE_URL)
default_notify=""
case "$site" in https://*) default_notify="$site/api/pay/wechat/notify" ;; esac
[ -z "$(cur WXPAY_NOTIFY_URL)" ] && [ -n "$default_notify" ] && set_kv WXPAY_NOTIFY_URL "$default_notify"
ask WXPAY_NOTIFY_URL "支付结果通知地址（必须是 https，例如 https://beadspark.top/api/pay/wechat/notify）"

echo
echo "== 价格（元）。按图纸大小分三档：小 = 1 个分区，中 = 2～4 个分区，大 = 更多 =="
ask PRICE_KIT_SMALL "材料包 · 小"
ask PRICE_KIT_STANDARD "材料包 · 中"
ask PRICE_KIT_LARGE "材料包 · 大"
ask PRICE_FINISHED_SMALL "成品 · 小"
ask PRICE_FINISHED_STANDARD "成品 · 中"
ask PRICE_FINISHED_LARGE "成品 · 大"
ask PRICE_SHIPPING "运费（包邮填 0）"
echo
ask ADMIN_EMAIL "新订单通知发到哪个邮箱"
echo
echo "== 物流轨迹（可选）：快递100 企业版的授权信息，api.kuaidi100.com 后台「授权参数」。不用就直接回车 =="
ask KUAIDI100_CUSTOMER "快递100 customer"
ask KUAIDI100_KEY "快递100 授权 key（输入时不显示）" secret

# Password of the order admin page (/admin/): made once, kept after that.
if [ -z "$(cur ADMIN_TOKEN)" ]; then
  set_kv ADMIN_TOKEN "$(head -c 18 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 20)"
fi

systemctl restart beadspark-api
sleep 2
if out=$(curl -fsS http://127.0.0.1:8787/api/shop); then
  echo "✓ 已保存并重启。现在的开卖情况："
  echo "  $out"
  echo "  （open:true 的形式已经可以在小程序里下单；false 说明价格或商户资料还没填全）"
  echo
  echo "订单管理后台：$(cur SITE_URL)/admin/"
  echo "管理口令：$(cur ADMIN_TOKEN)"
  echo "（口令只给管订单的人；想换口令，改 $ENV_FILE 里的 ADMIN_TOKEN 再重启）"
else
  journalctl -u beadspark-api -n 20 --no-pager
  echo "✗ 后端没起来，把上面的日志发给 Claude" >&2
  exit 1
fi
