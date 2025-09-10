# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies using lockfile
COPY frontend/package*.json ./
RUN npm ci

# Copy source and build
COPY frontend/ ./
ENV NODE_ENV=production
RUN npm run build

# Runtime stage
FROM nginx:1.27-alpine
# Install curl for HEALTHCHECK
RUN apk add --no-cache curl

# Copy nginx config
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

# Container-level healthcheck for ECS to observe (in addition to ALB TG)
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD curl -fsS http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]

