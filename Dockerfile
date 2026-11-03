# ========================================================
# Stage 1: Build Spring Boot Backend (Java 21 + Maven)
# ========================================================
FROM maven:3.9.9-eclipse-temurin-21 AS backend-builder
WORKDIR /app/backend

# Copy backend pom and resolve dependencies
COPY backend/pom.xml ./
RUN mvn dependency:go-offline -B || true

# Copy backend source code and build fat JAR
COPY backend/src ./src
RUN mvn clean package -DskipTests

# ========================================================
# Stage 2: Build Frontend (TanStack Start + Node.js 20)
# ========================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy package manifests and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy frontend source files
COPY . ./

# Build frontend SSR server with node-server Nitro preset
ENV NITRO_PRESET=node-server
RUN npm run build

# ========================================================
# Stage 3: Production Runtime (Java 21 JRE + Node 20 + Nginx)
# ========================================================
FROM eclipse-temurin:21-jre-jammy AS runner

# Install Node.js 20, Nginx, and essential tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    nginx \
    procps \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create persistent database directory and application folders
RUN mkdir -p /app/data /app/backend /app/frontend

# Copy backend JAR from Stage 1
COPY --from=backend-builder /app/backend/target/codeduel-backend-1.0.0.jar /app/backend/codeduel-backend.jar

# Copy frontend built server and public assets from Stage 2
COPY --from=frontend-builder /app/frontend/.output /app/frontend/.output
COPY --from=frontend-builder /app/frontend/node_modules /app/frontend/node_modules
COPY --from=frontend-builder /app/frontend/package.json /app/frontend/package.json

# Copy Nginx configuration and entrypoint script
COPY nginx.conf /etc/nginx/nginx.conf
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Environment defaults
ENV DATA_DIR=/app/data
ENV PORT=80
ENV BACKEND_PORT=8088
ENV NODE_ENV=production
ENV JUDGE0_API_URL=http://54.196.209.169:2358

# Expose HTTP port 80
EXPOSE 80

# Declare persistent volume for H2 database
VOLUME ["/app/data"]

# Run unified launcher
ENTRYPOINT ["/app/docker-entrypoint.sh"]

