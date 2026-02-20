# rustlegacy.online — пошаговая настройка на mainnet (Autori)

## Шаг 1. Подготовка на твоём сервере

### 1.1. Клонируй/загрузи проект

```bash
cd /path/to/rustlegacyonline
```

### 1.2. Создай .env

```bash
cd deploy
cp .env.example .env
nano .env
```

**Обязательно задай:**
- `DB_PASSWORD` — надёжный пароль для PostgreSQL
- `JWT_SECRET` — случайная строка для админки

### 1.3. Запусти контейнеры в mainnet

```bash
./deploy.sh mainnet
```

Проверь, что контейнеры поднялись:
```bash
docker ps
```

Должны быть: rustlegacy-postgres, rustlegacy-backend, rustlegacy-frontend, rustlegacy-adminer.

---

## Шаг 2. Что нужно от Autori

Передай Autori:

### 2.1. Конфиг для SWAG

Файл: **rustlegacy.subdomain.conf**  
Путь: `/config/nginx/proxy-confs/rustlegacy.subdomain.conf`

Содержимое (скопируй из `deploy/swag-proxy-confs/rustlegacy-mainnet.subdomain.conf.sample`):

```nginx
server {
    listen 443 ssl;

    server_name rustlegacy.online www.rustlegacy.online;

    include /config/nginx/ssl.conf;

    client_max_body_size 0;

    location / {
        include /config/nginx/proxy.conf;
        include /config/nginx/resolver.conf;
        set $upstream_app web.local;
        set $upstream_port 80;
        set $upstream_proto http;
        proxy_pass $upstream_proto://$upstream_app:$upstream_port;
    }
}
```

### 2.2. Чеклист для Autori

- [ ] SWAG-контейнер подключён к сети **mainnet**
- [ ] В SWAG есть сертификат для rustlegacy.online (`URL=rustlegacy.online` или `EXTRA_DOMAINS=rustlegacy.online,www.rustlegacy.online`)
- [ ] DNS: A-записи `rustlegacy.online` и `www.rustlegacy.online` указывают на IP сервера

**Примечание:** Порт 80 на хосте не используется — SWAG подключается к web.local по внутренней сети mainnet.
- [ ] После добавления конфига — `docker restart swag`

---

## Шаг 3. Проверка

1. Дождись, пока Autori добавит конфиг и перезапустит SWAG.
2. Открой в браузере: **https://rustlegacy.online**
3. Если не открывается — проверь логи: `./deploy.sh logs`

---

## Шаг 4. Полезные команды

| Команда | Описание |
|---------|----------|
| `./deploy.sh mainnet` | Запуск/пересборка |
| `./deploy.sh restart` | Перезапуск контейнеров |
| `./deploy.sh stop` | Остановка |
| `./deploy.sh logs` | Логи |

---

## Если что-то не работает

**Сайт не открывается:**
- Убедись, что контейнеры запущены: `docker ps`
- Проверь, что rustlegacy-frontend имеет hostname `web.local`: `docker inspect rustlegacy-frontend | grep -A 2 Hostname`
- Проверь, что rustlegacy-frontend в сети mainnet: `docker network inspect mainnet`

**502 Bad Gateway:**
- SWAG не видит web.local — проверь, что SWAG в сети mainnet
- Контейнер rustlegacy-frontend не запущен

**Сертификат невалидный:**
- Autori должен добавить rustlegacy.online в SWAG (URL или EXTRA_DOMAINS)
