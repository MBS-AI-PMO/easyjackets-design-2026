#!/usr/bin/env bash
# Run on Coolify server (SSH) to copy ALL uploaded images from Handmade By JB -> Easyjackets API.
#
# Usage:
#   chmod +x copy-hbj-uploads-on-server.sh
#   ./copy-hbj-uploads-on-server.sh
#
# Or set container names manually:
#   HBJ_CONTAINER=abc123 EJ_CONTAINER=def456 ./copy-hbj-uploads-on-server.sh

set -euo pipefail

find_container() {
  local pattern="$1"
  docker ps --format '{{.Names}}' | grep -i "$pattern" | head -n 1 || true
}

HBJ_CONTAINER="${HBJ_CONTAINER:-$(find_container 'handmade')}"
HBJ_CONTAINER="${HBJ_CONTAINER:-$(find_container 'hbj')}"
EJ_CONTAINER="${EJ_CONTAINER:-$(find_container 'easyjackets-backend')}"
EJ_CONTAINER="${EJ_CONTAINER:-$(find_container 'easyjackets-api')}"
EJ_CONTAINER="${EJ_CONTAINER:-$(find_container 'easyjackets.*api')}"

if [[ -z "${HBJ_CONTAINER}" ]]; then
  echo "ERROR: Could not find HBJ backend container. Set HBJ_CONTAINER manually."
  docker ps --format 'table {{.Names}}\t{{.Image}}'
  exit 1
fi

if [[ -z "${EJ_CONTAINER}" ]]; then
  echo "ERROR: Could not find Easyjackets backend container. Set EJ_CONTAINER manually."
  docker ps --format 'table {{.Names}}\t{{.Image}}'
  exit 1
fi

TMP_DIR="${TMP_DIR:-/tmp/hbj-to-ej-uploads-$$}"
HBJ_UPLOADS="/app/uploads"
EJ_UPLOADS="/app/uploads"

echo "HBJ container: ${HBJ_CONTAINER}"
echo "EJ container:  ${EJ_CONTAINER}"
echo "Temp dir:      ${TMP_DIR}"

mkdir -p "${TMP_DIR}"

echo "Copying ${HBJ_UPLOADS} from HBJ..."
docker cp "${HBJ_CONTAINER}:${HBJ_UPLOADS}/." "${TMP_DIR}/"

echo "Ensuring ${EJ_UPLOADS} exists on Easyjackets API..."
docker exec "${EJ_CONTAINER}" mkdir -p "${EJ_UPLOADS}/products" "${EJ_UPLOADS}/site"

echo "Copying files into Easyjackets API ${EJ_UPLOADS}..."
docker cp "${TMP_DIR}/." "${EJ_CONTAINER}:${EJ_UPLOADS}/"

echo "File counts in Easyjackets volume:"
docker exec "${EJ_CONTAINER}" sh -c "find ${EJ_UPLOADS} -type f | wc -l"

echo "Sample files:"
docker exec "${EJ_CONTAINER}" sh -c "find ${EJ_UPLOADS} -type f | head -n 5"

rm -rf "${TMP_DIR}"

echo "Done. Next: export HBJ product image map and run apply-hbj-images.mjs on your PC."
