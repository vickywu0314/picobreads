#!/usr/bin/env bash
# Update the site on this server: pull the latest code, build, then publish.
# The live folder is only replaced after a successful build, so a failed build never breaks the site.
# Usage (on the server):  ~/picobreads/scripts/deploy.sh
set -euo pipefail

SITE_DIR="${SITE_DIR:-/var/www/picobreads}"
cd "$(dirname "$0")/.."

echo "==> Pulling latest code"
git pull --ff-only

echo "==> Installing dependencies"
pnpm install --frozen-lockfile

echo "==> Building"
pnpm build

echo "==> Publishing to $SITE_DIR"
sudo mkdir -p "$SITE_DIR"
sudo rsync -a --delete apps/web/out/ "$SITE_DIR/"

echo "==> Done: $(git log -1 --format='%h %s')"
