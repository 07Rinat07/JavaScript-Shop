# JavaScript Shop

Простой интернет-магазин на:
- `server` — Node.js + Express + Sequelize + PostgreSQL
- `client.v2` — React 18 + Vite (актуальный клиент)
- `client.v1` — старая версия клиента (legacy)

## Требования

- Node.js `^20.19.0` или `>=22.12.0` (требование Vite)
- npm 9+
- PostgreSQL 13+

## Быстрый старт

1. Клонируем репозиторий:

```bash
git clone https://github.com/tokmakov/javascript-shop.git shop
cd shop
```

2. Создаем базу данных:

```sql
CREATE DATABASE online_store;
```

3. Настраиваем сервер:

```bash
cd server
cp .env.example .env
```

Минимально проверьте в `server/.env`:
- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_PORT`
- `SECRET_KEY` (обязательно замените `change_me`)
- `DB_SYNC=true` только для первого локального запуска

4. Запускаем сервер:

```bash
npm install
npm run start-dev
```

Сервер по умолчанию: `http://localhost:7000`.

5. Запускаем клиент (`client.v2`):

```bash
cd ../client.v2
cp .env.example .env
npm install
npm start
```

Клиент по умолчанию: `http://localhost:3000`.

## Переменные окружения

### `server/.env`

```env
PORT=7000

DB_HOST=localhost
DB_NAME=online_store
DB_USER=postgres
DB_PASS=change_me
DB_PORT=5432

SECRET_KEY=change_me
BCRYPT_SALT_ROUNDS=10

# CORS
CORS_ORIGINS=http://localhost:3000

# App security
RATE_LIMIT_MAX=300

# File upload (bytes)
UPLOAD_MAX_FILE_SIZE=5242880

# Set true only for local initialization
DB_SYNC=true
```

### `client.v2/.env`

```env
VITE_API_URL=http://localhost:7000/api/
VITE_IMG_URL=http://localhost:7000/
```

## Скрипты

### `server`
- `npm run start-dev` — запуск в dev-режиме (nodemon)
- `npm start` — production-запуск
- `npm test` — smoke-тесты API

### `client.v2`
- `npm start` / `npm run dev` — запуск Vite dev-server
- `npm run build` — production-сборка
- `npm run preview` — предпросмотр production-сборки

## Импорт тестовых данных

Если нужен заполненный каталог/пользователи, импортируйте дамп `database.sql`:

```bash
psql -U postgres online_store < database.sql
```

После импорта рекомендуется:
- сменить пароли тестовых пользователей
- удалить тестовые учетные записи
- выставить `DB_SYNC=false`

## Важно

- Если меняете порт клиента, обновите `CORS_ORIGINS` в `server/.env`.
- Не коммитьте реальные секреты в `.env`.

