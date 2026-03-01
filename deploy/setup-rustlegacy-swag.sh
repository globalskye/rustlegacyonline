#!/bin/bash
# rustlegacy.online — настройка через SWAG (host mode)
# Запуск: ./setup-rustlegacy-swag.sh
# Требуется: root или docker в группе

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DEPLOY_DIR="$SCRIPT_DIR"

echo "=== rustlegacy.online + SWAG ==="

# 1. Найти путь к конфигам SWAG
echo ""
echo "[1/4] Поиск SWAG..."
SWAG_CONFIG=""
if docker inspect swag &>/dev/null; then
    # Пробуем volume
    SWAG_VOL=$(docker inspect swag --format '{{range .Mounts}}{{if eq .Destination "/config"}}{{.Source}}{{end}}{{end}}')
    if [ -n "$SWAG_VOL" ] && [ -d "$SWAG_VOL" ]; then
        SWAG_CONFIG="$SWAG_VOL"
    fi
    if [ -z "$SWAG_CONFIG" ]; then
        # Fallback: стандартный путь volume
        SWAG_CONFIG="/var/lib/docker/volumes/swag/_data"
    fi
else
    echo "Ошибка: контейнер swag не найден. Запусти SWAG и повтори."
    exit 1
fi

if [ ! -d "$SWAG_CONFIG" ]; then
    echo "Ошибка: папка SWAG не найдена: $SWAG_CONFIG"
    exit 1
fi

# site-confs или proxy-confs (у разных версий SWAG по-разному)
SWAG_CONF_DIR=""
for dir in "nginx/site-confs" "nginx/proxy-confs"; do
    if [ -d "$SWAG_CONFIG/$dir" ]; then
        SWAG_CONF_DIR="$SWAG_CONFIG/$dir"
        break
    fi
done

if [ -z "$SWAG_CONF_DIR" ]; then
    SWAG_CONF_DIR="$SWAG_CONFIG/nginx/site-confs"
    mkdir -p "$SWAG_CONF_DIR"
fi

echo "    SWAG config: $SWAG_CONFIG"
echo "    Конфиги:     $SWAG_CONF_DIR"

# 2. Скопировать конфиг rustlegacy
echo ""
echo "[2/4] Копирование конфига rustlegacy..."
RUSTLEGACY_CONF="$SWAG_CONF_DIR/rustlegacy.subdomain.conf"
cat > "$RUSTLEGACY_CONF" << 'NGINX'
server {
    listen 443 ssl;
    listen [::]:443 ssl;

    server_name rustlegacy.online www.rustlegacy.online;

    include /config/nginx/ssl.conf;

    client_max_body_size 0;

    location / {
        include /config/nginx/proxy.conf;
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX
echo "    Записано: $RUSTLEGACY_CONF"

# 3. Запуск rustlegacy
echo ""
echo "[3/4] Запуск rustlegacy..."
cd "$DEPLOY_DIR"
if [ ! -f .env ]; then
    echo "Ошибка: нет .env. Создай из .env.example и задай DB_PASSWORD."
    exit 1
fi

docker compose -f docker-compose.swag.yml up -d --build
docker compose -f docker-compose.swag.yml up -d --force-recreate frontend

# Проверка порта
sleep 2
if docker ps --format '{{.Names}} {{.Ports}}' | grep -q "rustlegacy-frontend.*8080"; then
    echo "    Frontend на порту 8080: OK"
else
    echo "    Внимание: проверь, что frontend слушает 127.0.0.1:8080"
fi

# 4. Перезапуск SWAG
echo ""
echo "[4/4] Перезапуск SWAG..."
docker restart swag

echo ""
echo "=== Готово ==="
echo "Сайт: https://rustlegacy.online"
echo ""
echo "Если не работает:"
echo "  1. Проверь DNS: rustlegacy.online -> IP сервера"
echo "  2. SWAG: EXTRA_DOMAINS=rustlegacy.online,www.rustlegacy.online"
echo "  3. docker logs swag"
echo "  4. curl -k https://127.0.0.1:8080 (должен ответить frontend)"
