FROM node:20-bookworm-slim

WORKDIR /app

# Native deps for sharp, bcrypt, and basic PDF/font support
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    python3 \
    make \
    g++ \
    libvips42 \
    fontconfig \
    fonts-dejavu-core \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm install --omit=dev

COPY . .

ENV NODE_ENV=production
ENV DEV_MODE=production
ENV PORT=8080
ENV CLIENT_URL=https://easyjackets.com
ENV APP_UPLOADS_DIR=/app/uploads
ENV STORAGE_DRIVER=local
ENV AWS_FILE_PATH=https://api.easyjackets.com/uploads/
ENV LEGACY_UPLOADS_URL=https://api.easyjackets.com/uploads
ENV BG_REMOVER_MODEL=birefnet-general
ENV AUTO_REMOVE_BG=true

RUN mkdir -p /app/uploads/products /app/uploads/site
VOLUME ["/app/uploads"]

EXPOSE 8080

CMD ["node", "server.mjs"]
