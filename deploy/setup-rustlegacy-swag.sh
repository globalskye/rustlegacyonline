#!/bin/bash
# rustlegacy.online — настройка через SWAG (host mode)
# Запуск: chmod +x setup-rustlegacy-swag.sh && ./setup-rustlegacy-swag.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$SCRIPT_DIR"

echo "=== rustlegacy.online + SWAG ==="

# 1. Найти путь к конфигам SWAG
echo ""
echo "[1/5] Поиск SWAG..."
SWAG_CONFIG=""
if docker inspect swag &>/dev/null; then
    SWAG_VOL=$(docker inspect swag --format '{{range .Mounts}}{{if eq .Destination "/config"}}{{.Source}}{{end}}{{end}}')
    if [ -n "$SWAG_VOL" ] && [ -d "$SWAG_VOL" ]; then
        SWAG_CONFIG="$SWAG_VOL"
    fi
    [ -z "$SWAG_CONFIG" ] && SWAG_CONFIG="/var/lib/docker/volumes/swag/_data"
else
    echo "Ошибка: контейнер swag не найден."
    exit 1
fi

SITE_CONFS="$SWAG_CONFIG/nginx/site-confs"
if [ ! -d "$SITE_CONFS" ]; then
    echo "Ошибка: $SITE_CONFS не найдена"
    exit 1
fi
echo "    Конфиги: $SITE_CONFS"

# 2. Правим default.conf — web.local -> 127.0.0.1:8080
echo ""
echo "[2/5] Обновление default.conf..."
DEFAULT_CONF="$SITE_CONFS/default.conf"
if [ ! -f "$DEFAULT_CONF" ]; then
    echo "Ошибка: default.conf не найден"
    exit 1
fi

sed -i.bak 's|set \$target http://web.local:80;|set \$target http://127.0.0.1:8080;|' "$DEFAULT_CONF"
echo "    default.conf: target -> 127.0.0.1:8080"

# 3. Удаляем дубликат rustlegacy.subdomain.conf
echo ""
echo "[3/5] Удаление дубликата..."
if [ -f "$SITE_CONFS/rustlegacy.subdomain.conf" ]; then
    rm "$SITE_CONFS/rustlegacy.subdomain.conf"
    echo "    rustlegacy.subdomain.conf удалён"
else
    echo "    (дубликата нет)"
fi

# 4. Запуск rustlegacy
echo ""
echo "[4/5] Запуск rustlegacy..."
cd "$DEPLOY_DIR"
if [ ! -f .env ]; then
    echo "Ошибка: нет .env. Скопируй: cp .env.example .env"
    exit 1
fi

docker compose -f docker-compose.swag.yml up -d --build
docker compose -f docker-compose.swag.yml up -d --force-recreate frontend

sleep 2
if docker ps --format '{{.Names}} {{.Ports}}' | grep -q "rustlegacy-frontend.*8080"; then
    echo "    Frontend на 127.0.0.1:8080: OK"
else
    echo "    Внимание: проверь docker ps | grep rustlegacy"
fi

# 5. Перезапуск SWAG
echo ""
echo "[5/5] Перезапуск SWAG..."
docker restart swag

echo ""
echo "=== Готово ==="
echo "Сайт: https://rustlegacy.online"
echo ""
echo "Если не работает: docker logs swag"
