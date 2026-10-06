#!/bin/sh
# Starts the API as the unprivileged "node" user instead of root (Dockerfile ENTRYPOINT), so a flaw in the
# app or a library cannot take over the whole container. The uploads volume was written by root in older
# images: anything in it not owned by node is handed to node first (only those, so later starts are quick).
# If setpriv is missing the API starts as before, as root, with a warning, rather than not at all.
set -e

if [ "$(id -u)" = "0" ]; then
  mkdir -p /app/uploads
  find /app/uploads ! -user node -exec chown node:node {} + 2>/dev/null || true
  if command -v setpriv >/dev/null 2>&1; then
    # node's own home, not root's (which node cannot write): the background remover's numba keeps its
    # compiled cache under ~/.cache and fails to start without a writable one
    [ -d /home/node ] && export HOME=/home/node
    exec setpriv --reuid=node --regid=node --init-groups "$@"
  fi
  echo "docker-entrypoint: setpriv not found, the API runs as root" >&2
fi

exec "$@"
