#!/bin/bash
# Deploy rustlegacy.online - build and run on server
# Usage: ./deploy.sh [init|build|ssl|swag|mainnet|restart]
# Run from project root or deploy/

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

COMPOSE_FILE="docker-compose.production.yml"
SWAG_COMPOSE="docker-compose.swag.yml"
MAINNET_COMPOSE="docker-compose.mainnet.yml"

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
    [ ! -f .env ] && { cp .env.example .env 2>/dev/null || true; echo "Created .env from example"; }
    # Ensure PayGate vars exist (append if missing)
    grep -q "^PAYGATE_MERCHANT_WALLET=" .env 2>/dev/null || echo "PAYGATE_MERCHANT_WALLET=0x42d14c5e45744d152585CDb7F75c2cA9E67776B8" >> .env
    grep -q "^SITE_URL=" .env 2>/dev/null || echo "SITE_URL=https://rustlegacy.online" >> .env
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

cmd_swag() {
    echo "=== Build and run via SWAG (host mode, port 8080) ==="
    [ ! -f .env ] && { cp .env.example .env 2>/dev/null || true; }
    grep -q "^PAYGATE_MERCHANT_WALLET=" .env 2>/dev/null || echo "PAYGATE_MERCHANT_WALLET=0x42d14c5e45744d152585CDb7F75c2cA9E67776B8" >> .env
    grep -q "^SITE_URL=" .env 2>/dev/null || echo "SITE_URL=https://rustlegacy.online" >> .env
    grep -q "^DEPLOY_MODE=swag" .env 2>/dev/null || echo "DEPLOY_MODE=swag" >> .env
    docker compose -f $SWAG_COMPOSE up -d --build
    echo ""
    echo "Rust Legacy started. Frontend: 127.0.0.1:8080"
    echo "SWAG default.conf: set \$target http://127.0.0.1:8080;"
    echo "Site: https://rustlegacy.online"
}

cmd_mainnet() {
    echo "=== Build and run on mainnet (HTTP, port 80, hostname: web.local) ==="
    [ ! -f .env ] && { cp .env.example .env 2>/dev/null || true; }
    grep -q "^PAYGATE_MERCHANT_WALLET=" .env 2>/dev/null || echo "PAYGATE_MERCHANT_WALLET=0x42d14c5e45744d152585CDb7F75c2cA9E67776B8" >> .env
    grep -q "^SITE_URL=" .env 2>/dev/null || echo "SITE_URL=https://rustlegacy.online" >> .env
    if ! docker network inspect mainnet &>/dev/null; then
        echo "Docker network 'mainnet' not found. Create it or ask infrastructure admin."
        exit 1
    fi
    grep -q "^MAINNET=" .env 2>/dev/null || echo "MAINNET=1" >> .env
    docker compose -f $MAINNET_COMPOSE up -d --build
    echo ""
    echo "Deployed! Accessible at web.local:80 (via mainnet)"
}

cmd_restart() {
    echo "=== Restarting ==="
    if [ -f .env ] && grep -q "^DEPLOY_MODE=swag" .env 2>/dev/null; then
        docker compose -f $SWAG_COMPOSE restart
    elif [ -f .env ] && grep -q "^MAINNET=" .env 2>/dev/null; then
        docker compose -f $MAINNET_COMPOSE restart
    else
        docker compose -f $COMPOSE_FILE restart
    fi
}

cmd_stop() {
    if [ -f .env ] && grep -q "^DEPLOY_MODE=swag" .env 2>/dev/null; then
        docker compose -f $SWAG_COMPOSE down
    elif [ -f .env ] && grep -q "^MAINNET=" .env 2>/dev/null; then
        docker compose -f $MAINNET_COMPOSE down
    else
        docker compose -f $COMPOSE_FILE down
    fi
}

cmd_logs() {
    if [ -f .env ] && grep -q "^DEPLOY_MODE=swag" .env 2>/dev/null; then
        docker compose -f $SWAG_COMPOSE logs -f
    elif [ -f .env ] && grep -q "^MAINNET=" .env 2>/dev/null; then
        docker compose -f $MAINNET_COMPOSE logs -f
    else
        docker compose -f $COMPOSE_FILE logs -f
    fi
}

case "${1:-build}" in
    init)   cmd_init ;;
    build)  cmd_build ;;
    ssl)    cmd_ssl ;;
    swag)   cmd_swag ;;
    mainnet) cmd_mainnet ;;
    restart) cmd_restart ;;
    stop)   cmd_stop ;;
    logs)   cmd_logs ;;
    *)      echo "Usage: $0 {init|build|ssl|swag|mainnet|restart|stop|logs}"; exit 1 ;;
esac
