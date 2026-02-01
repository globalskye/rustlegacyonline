#!/bin/bash
# Deploy rustlegacy.online - build and run on server
# Usage: ./deploy.sh [init|build|ssl|restart]
# Run from project root or deploy/

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

COMPOSE_FILE="docker-compose.production.yml"

cmd_init() {
    echo "=== Initial setup ==="
    if [ ! -f .env ]; then
        cp .env.example .env 2>/dev/null || cp ../.env.production.example .env 2>/dev/null || true
        echo "Created .env - PLEASE EDIT and set DB_PASSWORD!"
        echo "Then run: ./deploy.sh build"
        exit 1
    fi
    mkdir -p data/certbot
    sudo mkdir -p /etc/letsencrypt 2>/dev/null || true
    echo "Done. Run: ./deploy.sh build"
}

cmd_build() {
    echo "=== Building and starting (HTTP) ==="
    [ ! -f .env ] && { echo "Run: cp .env.example .env && nano .env"; exit 1; }
    mkdir -p data/certbot
    sudo mkdir -p /etc/letsencrypt 2>/dev/null || true
    NGINX_CONFIG=http docker compose -f $COMPOSE_FILE up -d --build
    echo ""
    echo "Deployed! Site: http://rustlegacy.online"
    echo "For SSL: ./deploy.sh ssl"
}

cmd_ssl() {
    echo "=== Obtaining SSL certificate ==="
    docker compose -f $COMPOSE_FILE stop frontend 2>/dev/null || true
    sudo certbot certonly --standalone --non-interactive --agree-tos \
        -d rustlegacy.online -d www.rustlegacy.online \
        --email "${CERTBOT_EMAIL:-admin@rustlegacy.online}"
    echo "Certificate obtained. Enabling HTTPS..."
    grep -q 'NGINX_CONFIG=' .env && sed -i.bak 's/NGINX_CONFIG=.*/NGINX_CONFIG=ssl/' .env || echo "NGINX_CONFIG=ssl" >> .env
    NGINX_CONFIG=ssl docker compose -f $COMPOSE_FILE up -d
    echo "Done! Site: https://rustlegacy.online"
}

cmd_restart() {
    echo "=== Restarting ==="
    docker compose -f $COMPOSE_FILE restart
}

cmd_stop() {
    docker compose -f $COMPOSE_FILE down
}

cmd_logs() {
    docker compose -f $COMPOSE_FILE logs -f
}

case "${1:-build}" in
    init)   cmd_init ;;
    build)  cmd_build ;;
    ssl)    cmd_ssl ;;
    restart) cmd_restart ;;
    stop)   cmd_stop ;;
    logs)   cmd_logs ;;
    *)      echo "Usage: $0 {init|build|ssl|restart|stop|logs}"; exit 1 ;;
esac
