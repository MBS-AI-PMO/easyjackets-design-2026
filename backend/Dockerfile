FROM node:20-bookworm-slim

WORKDIR /app

# Native deps for sharp, bcrypt, and basic PDF/font support; python3-venv,
# libgl1 and libglib2.0-0 for the background remover
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    python3 \
    python3-venv \
    libgl1 \
    libglib2.0-0 \
    make \
    g++ \
    libvips42 \
    fontconfig \
    fonts-dejavu-core \
  && rm -rf /var/lib/apt/lists/*

# Background remover (bg-remover/, started by the API itself): Python + rembg in
# its own virtualenv, both models downloaded at build time (BiRefNet ~900 MB,
# isnet ~170 MB) so a fresh container never fetches a gigabyte at start-up.
# Before the npm layer, so a package change does not reinstall it.
ENV BG_PYTHON=/opt/bg-remover/bin/python
ENV U2NET_HOME=/opt/bg-remover/models
COPY bg-remover/requirements.txt /tmp/bg-remover-requirements.txt
RUN python3 -m venv /opt/bg-remover \
  && /opt/bg-remover/bin/pip install --no-cache-dir -r /tmp/bg-remover-requirements.txt \
  && /opt/bg-remover/bin/python -c "from rembg import new_session; new_session('birefnet-general'); new_session('isnet-general-use')"

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm install --omit=dev

COPY . .

ENV NODE_ENV=production
ENV DEV_MODE=production
ENV PORT=8080
# the new storefront and the new jacket builder (custom-jacket/); never the live site
ENV CLIENT_URL=https://hlfhuuaoepy4uvcbysh4xlk6.145.223.75.247.sslip.io
ENV CUSTOM_JACKET_URL=https://custom.145.223.75.247.sslip.io
ENV APP_UPLOADS_DIR=/app/uploads
ENV STORAGE_DRIVER=local
# the 2026 API's own uploads; nothing is fetched from the old live server
ENV AWS_FILE_PATH=https://api2.easyjackets.com/uploads/
ENV UPLOADS_PUBLIC_BASE_URL=https://api2.easyjackets.com/uploads
ENV LEGACY_UPLOADS_URL=
ENV BG_REMOVER_MODEL=birefnet-general
ENV AUTO_REMOVE_BG=true

RUN mkdir -p /app/uploads/products /app/uploads/site
VOLUME ["/app/uploads"]

# `deploy-status start|finish`: Coolify's pre- and post-deployment commands report this deployment, so the
# sites show their "under construction" screen meanwhile (deploy-status.sh; this backend itself, locally)
RUN cp deploy-status.sh /usr/local/bin/deploy-status && sed -i 's/\r$//' /usr/local/bin/deploy-status \
  && chmod +x /usr/local/bin/deploy-status
ENV DEPLOY_SERVICE=node-backend
ENV DEPLOY_STATUS_API=http://127.0.0.1:8080

# The API runs as the "node" user, not root (docker-entrypoint.sh hands it the uploads volume first)
RUN sed -i 's/\r$//' docker-entrypoint.sh && chmod +x docker-entrypoint.sh
ENTRYPOINT ["/app/docker-entrypoint.sh"]

EXPOSE 8080

CMD ["node", "server.mjs"]
