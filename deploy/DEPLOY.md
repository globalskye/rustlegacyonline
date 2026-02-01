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

## Проблемы

**Порт 80 занят**
```bash
sudo lsof -i :80
# Останови конфликтующий процесс (nginx, apache)
```

**Certbot не может получить сертификат**
- Проверь, что домен указывает на сервер
- Убедись, что порт 80 открыт (firewall: `sudo ufw allow 80`)

**БД не поднимается**
- Проверь DB_PASSWORD в .env
- Полный перезапуск: `./deploy.sh stop` → `./deploy.sh build`
