FROM node:20-alpine AS build
WORKDIR /app

# Defaults are placeholders for the NEW deployment; set the real values as Coolify build-time variables.
ARG REACT_APP_API_URL=https://api2.easyjackets.com/api/v1
ARG REACT_APP_FRONTEND_URL=https://new.easyjackets.com
ARG REACT_APP_STOREFRONT_URL=https://new.easyjackets.com
ARG REACT_APP_CUSTOM_URL=https://custom.easyjackets.com

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
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
