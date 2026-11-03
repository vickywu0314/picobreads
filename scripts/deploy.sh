#!/usr/bin/env bash
# Update the site on this server: pull the latest code, build, then publish.
# The live folder is only replaced after a successful build, so a failed build never breaks the site.
# Usage (on the server):  ~/picobreads/scripts/deploy.sh
set -euo pipefail

SITE_DIR="${SITE_DIR:-/var/www/picobreads}"
cd "$(dirname "$0")/.."

echo "==> Pulling latest code"
# GitHub can be slow or stall from mainland China: give up on a stalled transfer after 20 s
# (instead of waiting forever) and retry up to 3 times.
pulled=0
for attempt in 1 2 3; do
  if timeout 180 git -c http.lowSpeedLimit=1000 -c http.lowSpeedTime=20 pull --ff-only; then
    pulled=1
    break
  fi
  echo "    pull failed or stalled (attempt $attempt/3), retrying..."
  sleep 3
done
if [ "$pulled" != 1 ]; then
  echo "!! Could not reach GitHub. The site was NOT changed. Try again later." >&2
  exit 1
fi

echo "==> Installing dependencies"
pnpm install --frozen-lockfile

echo "==> Building"
pnpm build

echo "==> Publishing to $SITE_DIR"
sudo mkdir -p "$SITE_DIR"
sudo rsync -a --delete apps/web/out/ "$SITE_DIR/"

echo "==> Done: $(git log -1 --format='%h %s')"
