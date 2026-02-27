# Настройка PayGate.to

Документация: `12.txt`, [Postman](https://documenter.getpostman.com/view/14826208/2sA3Bj9aBi)

## Шаг 1: Получить USDC (Polygon) кошелёк

**⚠️ ОБЯЗАТЕЛЬНО: self-custodial (личный) кошелёк.** PayGate **отклоняет** адреса бирж (Binance, Bybit, Coinbase и т.д.). Ошибка «Provided wallet address is not allowed» означает, что адрес не принят.

Нужен адрес из приложения, где вы владеете приватным ключом:
- **MetaMask** → добавить сеть Polygon → скопировать адрес
- **Trust Wallet** (рекомендуется PayGate)
- **Rabby**, **Coinbase Wallet** (не адрес биржи!), **Rainbow** и т.п.

Формат: `0x` + 40 hex-символов (например `0x1234...abcd`).

## Шаг 2: Добавить переменные в .env

В `deploy/.env` (или корневом `.env` при локальной разработке):

```env
PAYGATE_MERCHANT_WALLET=0xВашРеальныйАдресНаPolygon
SITE_URL=https://rustlegacy.online
```

- `PAYGATE_MERCHANT_WALLET` — **обязательно**, без него "payment gateway unavailable"
- `SITE_URL` — публичный URL сайта **без слэша** в конце. PayGate вызывает callback `{SITE_URL}/api/webhooks/paygate?order_id={id}`

## Шаг 3: Убедиться, что callback доступен

PayGate при оплате делает GET на:
```
https://rustlegacy.online/api/webhooks/paygate?order_id=123&value_coin=...&...
```

Проверь:
1. Домен доступен с интернета (не localhost)
2. HTTPS работает
3. Nginx/SWAG проксирует `/api` на backend

## Шаг 4: Перезапустить backend

```bash
cd deploy
docker compose -f docker-compose.production.yml up -d backend
# или
docker compose -f docker-compose.swag.yml up -d backend
```

## Flow (по документации 12.txt)

1. **Create Wallet** — backend вызывает `GET api.paygate.to/control/wallet.php?address=...&callback=...`
2. **Payment URL** — возвращаем пользователю ссылку `checkout.paygate.to/pay.php?address=...&amount=...&currency=...&email=...`
3. **Callback** — PayGate шлёт GET на наш `/api/webhooks/paygate?order_id=X` → зачисляем баланс / выдаём товар

## Проверка

1. Зарегистрируйся на сайте
2. Пополни баланс (любая сумма)
3. Должен открыться PayGate с выбором карты/Apple Pay и т.д.
4. После тестовой оплаты — баланс зачисляется, callback виден в логах backend
