# The jacket builder (CRA) served as a static bundle by nginx.
# Coolify: Base Directory /custom-jacket, port 80 (Coolify's proxy terminates TLS).
# Node.js 22 LTS for the build (20 reached its end of life on 2026-04-30)
FROM node:22-alpine AS build
WORKDIR /app

# Where the builder talks to. Left empty, src/config/url.js uses the new 2026 deployment
# (the new backend and storefront); it never falls back to the live site.
ARG REACT_APP_API_URL=
ARG REACT_APP_FRONTEND_URL=

ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_FRONTEND_URL=$REACT_APP_FRONTEND_URL
ENV CI=true
ENV GENERATE_SOURCEMAP=false
# no inline <script> in index.html: the Content-Security-Policy allows this site's own script files only
ENV INLINE_RUNTIME_CHUNK=false

# exactly the versions in the lockfile (out of step with package.json: the build stops)
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# nginx 1.28 (stable; the 1.27 line gets no more fixes)
FROM nginx:1.28-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY security-headers.conf /etc/nginx/security-headers.conf
COPY --from=build /app/build /usr/share/nginx/html
# `deploy-status start|finish`: Coolify's pre- and post-deployment commands report this deployment, so the
# sites show their "under construction" screen meanwhile (deploy-status.sh; DEPLOY_STATUS_API = the backend)
RUN apk add --no-cache curl
COPY deploy-status.sh /usr/local/bin/deploy-status
RUN sed -i 's/\r$//' /usr/local/bin/deploy-status && chmod +x /usr/local/bin/deploy-status
ENV DEPLOY_SERVICE=custom-jacket
ENV DEPLOY_STATUS_API=https://rpgwwda661mpz7dpxm7hst69.145.223.75.247.sslip.io
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
