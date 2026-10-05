FROM node:20-alpine AS build
WORKDIR /app

# Defaults = the NEW 2026 deployment (backend on database easyjackets2026, new storefront).
# Never the live site. Override as Coolify build-time variables when the domains change.
ARG REACT_APP_API_URL=https://rpgwwda661mpz7dpxm7hst69.145.223.75.247.sslip.io/api/v1
ARG REACT_APP_FRONTEND_URL=https://hlfhuuaoepy4uvcbysh4xlk6.145.223.75.247.sslip.io
ARG REACT_APP_STOREFRONT_URL=https://hlfhuuaoepy4uvcbysh4xlk6.145.223.75.247.sslip.io
ARG REACT_APP_CUSTOM_URL=https://custom.145.223.75.247.sslip.io

ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_FRONTEND_URL=$REACT_APP_FRONTEND_URL
ENV REACT_APP_STOREFRONT_URL=$REACT_APP_STOREFRONT_URL
ENV REACT_APP_CUSTOM_URL=$REACT_APP_CUSTOM_URL
ENV CI=true
ENV GENERATE_SOURCEMAP=false

COPY package.json package-lock.json* ./
RUN npm ci || npm install

COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
# `deploy-status start|finish`: Coolify's pre- and post-deployment commands report this deployment, so the
# sites show their "under construction" screen meanwhile (deploy-status.sh; DEPLOY_STATUS_API = the backend)
RUN apk add --no-cache curl
COPY deploy-status.sh /usr/local/bin/deploy-status
RUN sed -i 's/\r$//' /usr/local/bin/deploy-status && chmod +x /usr/local/bin/deploy-status
ENV DEPLOY_SERVICE=admin-easyjacket
ENV DEPLOY_STATUS_API=https://rpgwwda661mpz7dpxm7hst69.145.223.75.247.sslip.io
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
