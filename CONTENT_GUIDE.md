# 📋 Руководство по управлению контентом

Это руководство поможет тебе легко управлять контентом сайта через API или напрямую через базу данных.

## 🎯 Быстрые примеры

### 1️⃣ Добавить новость

**Через API:**
```bash
curl -X POST http://localhost:8080/api/news \
  -H "Content-Type: application/json" \
  -d '{
    "language": "ru",
    "title": "Запуск нового ивента!",
    "content": "В это воскресенье проходит PvP турнир с призами!",
    "imageUrl": "https://example.com/event.jpg",
    "published": true,
    "publishedAt": "2025-01-27T18:00:00Z"
  }'
```

**Через БД:**
```sql
INSERT INTO news (language, title, content, image_url, published, published_at, created_at, updated_at)
VALUES ('ru', 'Запуск нового ивента!', 'В это воскресенье проходит PvP турнир с призами!', 
        'https://example.com/event.jpg', true, NOW(), NOW(), NOW());
```

### 2️⃣ Обновить описание сервера

**Через API:**
```bash
curl -X PUT http://localhost:8080/api/server-info \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "name": "Rust Legacy RU #1",
    "maxPlayers": 200,
    "gameVersion": "Legacy 2013",
    "downloadUrl": "https://mysite.com/download-rust-legacy"
  }'
```

**Через БД:**
```sql
-- Обновить основную информацию
UPDATE server_infos SET 
  name = 'Rust Legacy RU #1',
  max_players = 200,
  game_version = 'Legacy 2013',
  download_url = 'https://mysite.com/download-rust-legacy'
WHERE id = 1;

-- Обновить описание на русском
UPDATE descriptions SET 
  content = 'Новое крутое описание сервера на русском языке!'
WHERE server_info_id = 1 AND language = 'ru';

-- Обновить описание на английском
UPDATE descriptions SET 
  content = 'New cool server description in English!'
WHERE server_info_id = 1 AND language = 'en';
```

### 3️⃣ Добавить новую особенность сервера

**Через API:**
```bash
# На русском
curl -X POST http://localhost:8080/api/features \
  -H "Content-Type: application/json" \
  -d '{
    "serverInfoId": 1,
    "language": "ru",
    "title": "Кастомные рейды",
    "description": "Уникальные рейдовые ивенты каждую неделю",
    "icon": "zap",
    "order": 5
  }'

# На английском
curl -X POST http://localhost:8080/api/features \
  -H "Content-Type: application/json" \
  -d '{
    "serverInfoId": 1,
    "language": "en",
    "title": "Custom Raids",
    "description": "Unique raid events every week",
    "icon": "zap",
    "order": 5
  }'
```

**Через БД:**
```sql
-- Добавить особенность на обоих языках
INSERT INTO features (server_info_id, language, title, description, icon, "order", created_at, updated_at)
VALUES 
  (1, 'ru', 'Кастомные рейды', 'Уникальные рейдовые ивенты каждую неделю', 'zap', 5, NOW(), NOW()),
  (1, 'en', 'Custom Raids', 'Unique raid events every week', 'zap', 5, NOW(), NOW());
```

## 🎨 Доступные иконки

Используй эти значения для поля `icon`:
- `zap` - молния (скорость/энергия)
- `users` - люди (сообщество)
- `globe` - глобус (мир/сеть)
- `shield` - щит (защита/безопасность)

## 📊 Полезные SQL запросы

### Посмотреть все новости
```sql
SELECT id, language, title, published, published_at 
FROM news 
ORDER BY published_at DESC;
```

### Посмотреть все особенности
```sql
SELECT id, language, title, "order" 
FROM features 
ORDER BY "order", language;
```

### Удалить старую новость
```sql
DELETE FROM news WHERE id = 5;
```

### Скрыть новость (не публиковать)
```sql
UPDATE news SET published = false WHERE id = 3;
```

### Изменить порядок особенностей
```sql
UPDATE features SET "order" = 1 WHERE id = 10;
UPDATE features SET "order" = 2 WHERE id = 8;
```

## 🔄 Создание простого скрипта для добавления новостей

Создай файл `add_news.sh`:

```bash
#!/bin/bash

# Параметры
TITLE_RU="$1"
CONTENT_RU="$2"
TITLE_EN="$3"
CONTENT_EN="$4"

# Добавить на русском
curl -X POST http://localhost:8080/api/news \
  -H "Content-Type: application/json" \
  -d "{
    \"language\": \"ru\",
    \"title\": \"$TITLE_RU\",
    \"content\": \"$CONTENT_RU\",
    \"published\": true,
    \"publishedAt\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
  }"

# Добавить на английском
curl -X POST http://localhost:8080/api/news \
  -H "Content-Type: application/json" \
  -d "{
    \"language\": \"en\",
    \"title\": \"$TITLE_EN\",
    \"content\": \"$CONTENT_EN\",
    \"published\": true,
    \"publishedAt\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
  }"

echo "Новости добавлены!"
```

Использование:
```bash
chmod +x add_news.sh
./add_news.sh "Вайп сервера" "Сервер будет вайпнут в 18:00" "Server Wipe" "Server will wipe at 18:00"
```

## 🗂️ Работа с базой данных напрямую

### Подключиться к БД

**Через Docker:**
```bash
docker exec -it rust-legacy-postgres psql -U rustlegacy -d rustlegacy
```

**Локально:**
```bash
psql -h localhost -U rustlegacy -d rustlegacy
# Пароль: rustlegacy_password
```

### Экспорт данных

**Экспорт всех новостей:**
```bash
docker exec rust-legacy-postgres pg_dump -U rustlegacy -d rustlegacy -t news > news_backup.sql
```

**Импорт:**
```bash
docker exec -i rust-legacy-postgres psql -U rustlegacy -d rustlegacy < news_backup.sql
```

## 🚀 Добавление функционала

### Пример: Добавить поле "автор" к новостям

1. **Обновить модель** (`backend/models/models.go`):
```go
type News struct {
    ID          uint      `gorm:"primaryKey" json:"id"`
    Language    string    `json:"language"`
    Title       string    `json:"title"`
    Content     string    `json:"content" gorm:"type:text"`
    Author      string    `json:"author"` // НОВОЕ ПОЛЕ
    ImageURL    string    `json:"imageUrl"`
    Published   bool      `json:"published"`
    PublishedAt time.Time `json:"publishedAt"`
    CreatedAt   time.Time `json:"createdAt"`
    UpdatedAt   time.Time `json:"updatedAt"`
}
```

2. **Перезапустить backend** - миграция произойдет автоматически:
```bash
docker-compose restart backend
```

3. **Использовать новое поле**:
```bash
curl -X POST http://localhost:8080/api/news \
  -H "Content-Type: application/json" \
  -d '{
    "language": "ru",
    "title": "Обновление",
    "content": "Текст новости",
    "author": "Админ",
    "published": true,
    "publishedAt": "2025-01-27T12:00:00Z"
  }'
```

## 💡 Советы

1. **Всегда добавляй контент на обоих языках** (ru и en)
2. **Используй `order` для упорядочивания** особенностей
3. **Проверяй `published: true`** для публикации новостей
4. **Делай бекапы БД** перед большими изменениями
5. **Тестируй на локалхосте** перед продакшеном

## 🔧 Устранение неполадок

### Новости не появляются на сайте
- Проверь `published = true`
- Проверь язык (`language = 'ru'` или `'en'`)
- Перезагрузи страницу с очисткой кеша (Ctrl+F5)

### API не отвечает
```bash
# Проверить логи backend
docker logs rust-legacy-backend

# Проверить, запущен ли сервис
docker-compose ps
```

### База данных не обновляется
```bash
# Перезапустить все сервисы
docker-compose down
docker-compose up --build
```

---

Удачи в управлении контентом! 🎮
