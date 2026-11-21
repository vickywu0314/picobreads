#!/usr/bin/env bash
# Set the WeChat mini program AppID / AppSecret for the BeadSpark API and restart it.
#   Usage on the server:  sudo bash ~/beadspark-deploy/set-wxmp.sh
# The secret is only written to /etc/beadspark/api.env on this server.
set -euo pipefail
ENV_FILE=/etc/beadspark/api.env
[ "$(id -u)" = 0 ] || { echo "请用 sudo 运行：sudo bash $0" >&2; exit 1; }
[ -f "$ENV_FILE" ] || { echo "找不到 $ENV_FILE，先运行 setup-api.sh" >&2; exit 1; }

read -r -p "小程序 AppID [wxad095cfa10de6ecd]: " appid
appid=${appid:-wxad095cfa10de6ecd}
read -r -s -p "小程序 AppSecret（小程序后台 → 开发管理 → 开发设置；输入时不显示）: " secret; echo
[ -n "$secret" ] || { echo "AppSecret 不能为空" >&2; exit 1; }
read -r -p "海报上的小程序码打开哪个版本？trial=体验版 / release=正式版 [trial]: " env
env=${env:-trial}

set_kv() { # key value: replace the line if present, otherwise append
  local k="$1" v="$2" tmp
  tmp=$(mktemp)
  grep -v "^$k=" "$ENV_FILE" > "$tmp" || true
  printf '%s=%s\n' "$k" "$v" >> "$tmp"
  cat "$tmp" > "$ENV_FILE"
  rm -f "$tmp"
}
set_kv WXMP_APP_ID "$appid"
set_kv WXMP_APP_SECRET "$secret"
set_kv WXMP_ENV "$env"

systemctl restart beadspark-api
sleep 2
if curl -fsS http://127.0.0.1:8787/api/health >/dev/null; then
  echo "✓ 已保存并重启。小程序里的微信登录、存草稿、分享现在可以用了。"
else
  journalctl -u beadspark-api -n 20 --no-pager
  echo "✗ 后端没起来，把上面的日志发给 Claude" >&2
  exit 1
fi
