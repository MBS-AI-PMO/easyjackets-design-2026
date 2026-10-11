# Builds the Vite app and serves it with the storefront server (server.mjs), which writes each page's own
# SEO tags and text into the HTML (it replaced plain nginx; same port 80, same Coolify settings).
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=80
# the server and the plain data modules it shares with the app (package.json: "type": "module")
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/server.mjs ./server.mjs
COPY --from=build /app/dist ./dist
COPY --from=build /app/server-data ./server-data
COPY --from=build /app/src/lib ./src/lib
COPY --from=build /app/src/data ./src/data
COPY --from=build /app/tools/route-table.mjs ./tools/route-table.mjs
# `deploy-status start|finish`: Coolify's pre- and post-deployment commands report this deployment, so the
# sites show their "under construction" screen meanwhile (deploy-status.sh; DEPLOY_STATUS_API = the backend)
RUN apk add --no-cache curl
COPY deploy-status.sh /usr/local/bin/deploy-status
RUN sed -i 's/\r$//' /usr/local/bin/deploy-status && chmod +x /usr/local/bin/deploy-status
ENV DEPLOY_SERVICE=easyjackets
ENV DEPLOY_STATUS_API=https://rpgwwda661mpz7dpxm7hst69.145.223.75.247.sslip.io
# hosts that may be indexed; every other host (the sslip.io staging address) is sent X-Robots-Tag: noindex
ENV INDEXABLE_HOSTS=easyjackets.com
EXPOSE 80
CMD ["node", "server.mjs"]
