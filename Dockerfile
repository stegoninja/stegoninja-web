# syntax=docker/dockerfile:1

# ---- Build stage: compile the Angular app ----
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies from the lockfile for reproducible builds.
COPY package.json package-lock.json ./
RUN npm ci

# Build the production bundle.
COPY . .
RUN npx ng build --configuration production

# ---- Runtime stage: nginx serves the SPA + proxies the API ----
FROM nginx:1.27-alpine AS runtime

# Backend the SPA's API calls are proxied to. Override at run time, e.g.
#   docker run -e API_UPSTREAM=http://stegoninja:8080 ...
# Default targets an API running on the Docker host.
ENV API_UPSTREAM=http://host.docker.internal:8080

# nginx substitutes ${API_UPSTREAM} into this template on startup.
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

# Static assets from the build stage.
COPY --from=build /app/dist/stegoninja-web/browser /usr/share/nginx/html

EXPOSE 80
