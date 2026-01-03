# Root Dockerfile for Dokploy/Nixpacks detection
# This file ensures that even if Nixpacks fails, Docker can handle the build.
# By default, this Dockerfile can be configured to build the frontend or backend.

FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM php:8.2-fpm-alpine AS backend-runtime
WORKDIR /var/www
RUN apk add --no-cache composer libpng-dev libzip-dev zip unzip
COPY backend/composite*.json ./
# ... add more PHP/Laravel setup here if needed ...

# Standard output to let user know this is a monorepo
FROM alpine
CMD echo "This is a monorepo root. Please set the 'Base Directory' in Dokploy settings to either /frontend or /backend for specific deployment."
