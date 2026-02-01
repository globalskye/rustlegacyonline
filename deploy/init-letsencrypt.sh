#!/bin/bash
# Obtain SSL certificate for rustlegacy.online
# Run on server: ./init-letsencrypt.sh
# Requires: domain pointing to server, docker running

set -e

DOMAIN="rustlegacy.online"
EMAIL="${CERTBOT_EMAIL:-admin@rustlegacy.online}"  # Set for Let's Encrypt notifications
DATA_DIR="./data"
CERTBOT_DIR="$DATA_DIR/certbot"

echo "=== Obtaining SSL certificate for $DOMAIN ==="

# Create dirs
mkdir -p "$CERTBOT_DIR/.well-known/acme-challenge"
chmod -R 755 "$DATA_DIR"

# Stop frontend to free port 80 (if using standalone)
echo "Stopping frontend container..."
docker compose -f docker-compose.production.yml stop frontend 2>/dev/null || true

# Get certificate (standalone - certbot binds to 80)
echo "Running certbot..."
sudo certbot certonly \
  --standalone \
  --non-interactive \
  --agree-tos \
  --email "$EMAIL" \
  -d "$DOMAIN" \
  -d "www.$DOMAIN" \
  --preferred-challenges http

echo "Certificate obtained!"
echo ""
echo "Now run:"
echo "  export NGINX_CONFIG=ssl"
echo "  docker compose -f docker-compose.production.yml up -d"
echo ""
echo "Or add NGINX_CONFIG=ssl to your .env file and restart."
