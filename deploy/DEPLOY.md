# Деплой rustlegacy.online на сервер

## Быстрый старт

### 1. Подготовка сервера (Linux)

```bash
# Установить Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Перелогиниться или: newgrp docker

# Установить Docker Compose (если нет)
sudo apt install docker-compose-plugin

# Установить Certbot (для SSL)
sudo apt install certbot
```

### 2. Домен

Убедись, что **rustlegacy.online** и **www.rustlegacy.online** указывают на IP твоего сервера (A-запись).

### 3. Перенос проекта на сервер

**Вариант A: Git**
```bash
# На сервере
git clone https://github.com/твой-репо/rustlegacyonline.git
cd rustlegacyonline
```

**Вариант B: Архив**
```bash
# На своём ПК
tar -czvf rustlegacy.tar.gz --exclude=node_modules --exclude=.git .

# Копируешь на сервер
scp rustlegacy.tar.gz user@server:/home/user/

# На сервере
tar -xzvf rustlegacy.tar.gz
cd rustlegacyonline
```

### 4. Деплой

```bash
cd deploy

# Создать .env
cp .env.example .env
nano .env   # Установи DB_PASSWORD (надёжный пароль!)

# Сделать скрипт исполняемым
chmod +x deploy.sh

# Собрать и запустить (HTTP)
./deploy.sh build
```

Сайт доступен на **http://rustlegacy.online**.

### 5. SSL-сертификат (HTTPS)

```bash
cd deploy

# Остановить фронт, получить сертификат, включить HTTPS
./deploy.sh ssl
```

Нужен email для уведомлений Let's Encrypt (можно задать `CERTBOT_EMAIL=твой@email.com`).

После этого сайт работает по **https://rustlegacy.online**.

---

## Команды deploy.sh

| Команда | Описание |
|---------|----------|
| `./deploy.sh init` | Подготовка (создать .env и каталоги) |
| `./deploy.sh build` | Сборка и запуск (HTTP) |
| `./deploy.sh ssl` | Получить сертификат и включить HTTPS |
| `./deploy.sh restart` | Перезапуск контейнеров |
| `./deploy.sh stop` | Остановить всё |
| `./deploy.sh logs` | Просмотр логов |

---

## Обновление

```bash
cd rustlegacyonline
git pull   # или загрузить новый архив

cd deploy
./deploy.sh build   # пересобрать и перезапустить
```

Если уже включён SSL, после обновления он сохранится (NGINX_CONFIG=ssl в .env).

---

## Структура

```
deploy/
├── docker-compose.production.yml   # Production compose
├── nginx-http.conf                 # Nginx без SSL
├── nginx-ssl.conf                  # Nginx с SSL
├── deploy.sh                       # Главный скрипт
├── init-letsencrypt.sh             # Получение сертификата
├── .env.example
└── DEPLOY.md                       # Эта инструкция
```

---

## Дополнительные настройки

### Переменные окружения бэкенда

| Переменная | Описание |
|------------|----------|
| `STATS_SYNC_ENDPOINT` | URL для POST статистики каждые 2 мин (игроки, кланы, сервер). Используй `http://IP` для Rust Legacy (TLS 1.0) |
| `RCON_HOST`, `RCON_PORT`, `RCON_PASSWORD` | RCON для выдачи товаров через магазин (команда с `*` = SteamID) |
| `JWT_SECRET` | Секрет для JWT токенов админки |

### Эндпоинты мониторинга

- `GET /api/server-status` — все серверы
- `GET /api/server-status/classic` — только classic
- `GET /api/server-status/deathmatch` — только deathmatch
- `POST /api/server-status/report` — принять онлайн от плагина TopSystem (body: `{"classic":{"currentPlayers":5}}` или `{"deathmatch":{...}}`)

### TopSystem плагин — Report Online

В `oxide/config/TopSystem.json`:
- `Report Online URL` — URL бэкенда, например `http://YOUR_SITE/api/server-status/report`
- `Server Type` — `classic` или `deathmatch` (в зависимости от сервера)

Плагин будет POSTить текущий онлайн каждые N секунд (синхронно с Sync).

### Переменные фронтенда

| Переменная | Описание |
|------------|----------|
| `REACT_APP_GOOGLE_ANALYTICS_ID` | ID Google Analytics (G-XXXXXX) |
| `REACT_APP_YANDEX_METRIKA_ID` | ID Яндекс Метрики |

### Защита админки через nginx (опционально)

В `nginx-ssl.conf` можно добавить Basic Auth для `/admin`:

```nginx
location /admin {
    auth_basic "Admin";
    auth_basic_user_file /etc/nginx/.htpasswd;
    try_files $uri $uri/ /index.html;
}
```

Создать пароль: `htpasswd -c /etc/nginx/.htpasswd admin`

---

## Проблемы

**Порт 80 занят**
```bash
sudo lsof -i :80
# Останови конфликтующий процесс (nginx, apache)
```

**Certbot не может получить сертификат**
- Проверь, что домен указывает на сервер
- Убедись, что порт 80 открыт (firewall: `sudo ufw allow 80`)

**БД: password authentication failed**
Пароль в .env должен совпадать с тем, что был при первой инициализации тома. Если менял DB_PASSWORD — сбрось:
```bash
docker exec -it rustlegacy-postgres psql -U postgres -d rustlegacy -c "ALTER USER rustlegacy WITH PASSWORD 'твой_пароль_из_env';"
```
Замени `твой_пароль_из_env` на значение DB_PASSWORD из deploy/.env. Потом `./deploy.sh restart`.

**host not found in upstream "backend"**
Исправлено: nginx использует resolver, backend резолвится при запросе. Убедись, что backend запущен (проверь пароль БД выше).

---

## База данных: подключение и безопасность

Подробная инструкция — **DATABASE.md** в корне проекта.

- **Adminer:** http://сервер:8081 (если порт открыт)
- **Параметры:** из .env (DB_USER, DB_PASSWORD, DB_NAME)
- **SSH-туннель** для доступа к PostgreSQL с локального ПК
