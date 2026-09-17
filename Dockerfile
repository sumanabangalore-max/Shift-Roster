# Multi-stage Dockerfile for TeamOff & Shift Roster Manager

# -------------------------------------------------------------
# Stage 1: Base & Dependency Installation
# -------------------------------------------------------------
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json ./
RUN npm install

# -------------------------------------------------------------
# Stage 2: Development (Optional target for containerized dev)
# -------------------------------------------------------------
FROM base AS development
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# -------------------------------------------------------------
# Stage 3: Production Build
# -------------------------------------------------------------
FROM base AS builder
COPY . .
RUN npm run build

# -------------------------------------------------------------
# Stage 4: Production Web Server (Ultra-lightweight Nginx)
# -------------------------------------------------------------
FROM nginx:alpine AS runner

# Remove default nginx configs
RUN rm -rf /etc/nginx/conf.d/*

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Container runs on port 3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/healthz || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
