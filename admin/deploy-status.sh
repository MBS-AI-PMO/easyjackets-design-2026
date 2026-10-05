#!/bin/sh
# Reports a Coolify deployment of this app to the backend, so the storefront, the jacket builder and the
# API show their "under construction" screen while it runs (backend controllers/siteStatusController.js).
# The same script is in all four app folders (backend, frontend, admin, custom-jacket); the Dockerfile
# installs it as `deploy-status` and sets DEPLOY_SERVICE (which app) and DEPLOY_STATUS_API (the backend).
#
#   Coolify → the app → Configuration → Advanced:
#     Pre-deployment command:   deploy-status start
#     Post-deployment command:  deploy-status finish
#   and the environment variable DEPLOYMENT_STATUS_TOKEN, the same value on all four apps.
#
# Never fails a deployment: it tries for about a minute (the backend's own "finish" runs in the new
# container, which needs a few seconds to start), then only logs. A start that is never finished clears
# itself after 30 minutes.

ACTION="${1:-start}"
case "$ACTION" in
  start|finish) ;;
  *) echo "deploy-status: use 'deploy-status start' or 'deploy-status finish'"; exit 0 ;;
esac

if [ -z "${DEPLOYMENT_STATUS_TOKEN:-}" ]; then
  echo "deploy-status: DEPLOYMENT_STATUS_TOKEN is not set on this app, nothing reported"
  exit 0
fi

API="${DEPLOY_STATUS_API%/}"
URL="$API/api/v1/features/deployment-status/$ACTION"
BODY="{\"service\":\"${DEPLOY_SERVICE}\"}"

send() {
  if command -v curl >/dev/null 2>&1; then
    curl -fsS -m 10 -X POST -H "Content-Type: application/json" -H "x-deployment-token: $DEPLOYMENT_STATUS_TOKEN" \
      -d "$BODY" "$URL" >/dev/null 2>&1
  else
    wget -q -T 10 -O /dev/null --header="Content-Type: application/json" \
      --header="x-deployment-token: $DEPLOYMENT_STATUS_TOKEN" --post-data="$BODY" "$URL" >/dev/null 2>&1
  fi
}

TRY=1
while [ "$TRY" -le 20 ]; do
  if send; then
    echo "deploy-status: $ACTION reported for $DEPLOY_SERVICE"
    exit 0
  fi
  TRY=$((TRY + 1))
  sleep 3
done

echo "deploy-status: could not report $ACTION for $DEPLOY_SERVICE to $URL"
exit 0
