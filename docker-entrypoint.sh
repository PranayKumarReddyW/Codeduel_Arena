#!/bin/bash
set -e

echo "=========================================="
echo " Starting CodeDuel Arena Production Server"
echo "=========================================="

# Ensure persistent data directory exists
mkdir -p /app/data

# Ensure DATA_DIR is passed to Spring Boot
export DATA_DIR="${DATA_DIR:-/app/data}"
if [ -z "$SPRING_DATASOURCE_URL" ]; then
    export SPRING_DATASOURCE_URL="jdbc:h2:file:/app/data/codedueldb;DB_CLOSE_DELAY=-1"
    export SPRING_DATASOURCE_DRIVER_CLASS_NAME="org.h2.Driver"
    export SPRING_DATASOURCE_USERNAME="sa"
fi

# Launch Spring Boot backend in background
echo "==> [1/3] Booting Spring Boot REST API & WebSocket on port 8088..."
SERVER_PORT=8088 java -jar /app/backend/codeduel-backend.jar &
BACKEND_PID=$!

# Launch TanStack Start / Node SSR server on port 3000
echo "==> [2/3] Booting Frontend SSR engine on port 3000..."
export PORT=3000
node /app/frontend/.output/server/index.mjs &
FRONTEND_PID=$!

# Graceful termination handler
cleanup() {
    echo "==> Shutting down CodeDuel processes gracefully..."
    kill -TERM "$BACKEND_PID" 2>/dev/null || true
    kill -TERM "$FRONTEND_PID" 2>/dev/null || true
    nginx -s quit 2>/dev/null || true
    wait "$BACKEND_PID" 2>/dev/null || true
    wait "$FRONTEND_PID" 2>/dev/null || true
    exit 0
}

trap cleanup SIGTERM SIGINT

# Launch Nginx reverse proxy in foreground on port 80
echo "==> [3/3] Starting Nginx reverse proxy on port 80..."
nginx -g "daemon off;" &
NGINX_PID=$!

# Wait for any process to exit
wait -n "$BACKEND_PID" "$FRONTEND_PID" "$NGINX_PID"

