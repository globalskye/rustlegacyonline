# База данных PostgreSQL — подключение и безопасность

**Все пароли задаются в `.env`** (см. `.env.example` в корне и `deploy/.env.example` для прода).

## Локальная разработка (docker-compose)

### Настройка
```bash
cp .env.example .env
# Отредактируй .env — там DB_USER, DB_PASSWORD, DB_NAME
```

### Параметры подключения (из .env)
| Параметр | Переменная | По умолчанию |
|----------|------------|--------------|
| **Host** | — | `localhost` |
| **Port** | `DB_PORT` | `5432` |
| **Database** | `DB_NAME` | `rustlegacy` |
| **User** | `DB_USER` | `rustlegacy` |
| **Password** | `DB_PASSWORD` | `rustlegacy_password` |

### Adminer (в браузере)
1. Запустить: `docker-compose up -d`
2. Открыть: **http://localhost:8081**
3. Система: **PostgreSQL**
4. Сервер: **postgres**
5. Пользователь: **из .env → DB_USER**
6. Пароль: **из .env → DB_PASSWORD**
7. База: **из .env → DB_NAME**

---

## Production (сервер)

**Все пароли в `deploy/.env`** (скопируй из `deploy/.env.example` и задай `DB_PASSWORD`):

| Переменная | Описание |
|------------|----------|
| `DB_HOST` | Хост (обычно `postgres` внутри Docker) |
| `DB_PORT` | Порт (5432) |
| `DB_USER` | Пользователь |
| `DB_PASSWORD` | **Обязательно сменить!** |
| `DB_NAME` | Имя базы (rustlegacy) |

### Подключение к production-БД с вашего компьютера

1. **SSH-туннель:**
   ```bash
   ssh -L 5432:localhost:5432 user@62.122.214.201
   ```
2. Подключайтесь к `localhost:5432` с учётными данными из `.env`.

Или откройте порт 5432 в файрволе (не рекомендуется — БД будет доступна извне).

### Adminer в production

- URL: **http://62.122.214.201:8081** (если порт открыт)
- Лучше ограничить доступ файрволом или прокси с авторизацией.

---

## Безопасность

1. **Смените пароль** в production в `.env`: `DB_PASSWORD=очень_сложный_пароль`.

2. **Не открывайте порт 5432** в интернет. Подключайтесь только через:
   - SSH-туннель;
   - внутреннюю Docker-сеть.

3. **Adminer (порт 8081):**
   - Закройте в файрволе для production;
   - или настройте доступ только с вашего IP.

4. **Регулярные бэкапы:**
   ```bash
   docker exec rust-legacy-postgres pg_dump -U rustlegacy rustlegacy > backup_$(date +%Y%m%d).sql
   ```

---

## Обновление иконок платёжных систем

Если иконки не отображаются (остались старые placeholder URL), выполните в Adminer или psql:

```sql
UPDATE payment_methods SET image_url = '/payments/visa.svg' WHERE name ILIKE '%visa%';
UPDATE payment_methods SET image_url = '/payments/mastercard.svg' WHERE name ILIKE '%mastercard%';
UPDATE payment_methods SET image_url = '/payments/paypal.svg' WHERE name ILIKE '%paypal%';
UPDATE payment_methods SET image_url = '/payments/mir.svg' WHERE name ILIKE '%mir%';
```

Или измените вручную в админке → Payment Methods.
