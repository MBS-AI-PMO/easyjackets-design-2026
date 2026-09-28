#!/usr/bin/env bash
# Export HBJ product -> /uploads/... map from Postgres (run on Coolify server).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HBJ_CONTAINER="${HBJ_CONTAINER:-$(docker ps --format '{{.Names}}' | grep -iE 'handmade|hbj' | head -n 1)}"
OUTPUT="${OUTPUT:-/tmp/hbj-product-images.json}"

if [[ -z "${HBJ_CONTAINER}" ]]; then
  echo "Set HBJ_CONTAINER to your Handmade By JB backend container name."
  docker ps --format 'table {{.Names}}\t{{.Image}}'
  exit 1
fi

echo "Copying export script into ${HBJ_CONTAINER}..."
docker cp "${SCRIPT_DIR}/export-hbj-product-images.cjs" "${HBJ_CONTAINER}:/tmp/export-hbj-product-images.cjs"

echo "Exporting -> ${OUTPUT}"
docker exec "${HBJ_CONTAINER}" node /tmp/export-hbj-product-images.cjs > "${OUTPUT}"

COUNT="$(grep -c '"hbjProductId"' "${OUTPUT}" || true)"
echo "Exported ${COUNT} products to ${OUTPUT}"
echo ""
echo "Download to your PC:"
echo "  scp root@145.223.75.247:${OUTPUT} ./hbj-product-images.json"
echo ""
echo "Then on your PC:"
echo "  cd node-backend"
echo "  node scripts/apply-hbj-images.mjs --input ../hbj-product-images.json"
echo "  node scripts/apply-hbj-images.mjs --input ../hbj-product-images.json --apply"
