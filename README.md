# JavaScript Shop

Простой интернет-магазин на:
- `server` — Node.js + Express + Sequelize + PostgreSQL
- `client.v2` — React 18 + Vite (актуальный клиент)
- `client.v1` — старая версия клиента (legacy)

## Требования

- Node.js `^20.19.0` или `>=22.12.0` (требование Vite)
- npm 9+
- PostgreSQL 13+
- Docker 24+ и Docker Compose v2 (для запуска в контейнерах)

## Локальный запуск

1. Клонируем репозиторий:

```bash
git clone https://github.com/07Rinat07/javascript-shop.git shop
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

## Запуск в Docker

1. Из корня проекта:

```bash
docker compose up -d --build
```

Примечание: при первом запуске Docker автоматически импортирует `database.sql`
в контейнер PostgreSQL (`/docker-entrypoint-initdb.d`), поэтому каталог не пустой.

2. Проверка сервисов:

```bash
docker compose ps
curl http://localhost:7000/health
```

3. Приложение:
- клиент: `http://localhost:3000`
- API: `http://localhost:7000/api`
- health: `http://localhost:7000/health`

4. Остановка:

```bash
docker compose down
```

5. Остановка с удалением данных PostgreSQL:

```bash
docker compose down -v
```

После `down -v` при следующем `up` дамп `database.sql` снова импортируется автоматически.

Для Docker используется `server/.env.docker`.

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

# Fixture users (npm run seed:users)
FIXTURE_ADMIN_EMAIL=admin@local.test
FIXTURE_ADMIN_PASSWORD=Admin12345
FIXTURE_USER_EMAIL=user@local.test
FIXTURE_USER_PASSWORD=User12345
```

### `server/.env.docker`

```env
PORT=7000

DB_HOST=db
DB_NAME=online_store
DB_USER=postgres
DB_PASS=postgres
DB_PORT=5432

SECRET_KEY=change_me_docker
BCRYPT_SALT_ROUNDS=10

CORS_ORIGINS=http://localhost:3000
RATE_LIMIT_MAX=300
UPLOAD_MAX_FILE_SIZE=5242880
DB_SYNC=true

# Fixture users (npm run seed:users)
FIXTURE_ADMIN_EMAIL=admin@local.test
FIXTURE_ADMIN_PASSWORD=Admin12345
FIXTURE_USER_EMAIL=user@local.test
FIXTURE_USER_PASSWORD=User12345
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
- `npm run seed:users` — создать/обновить фикстуры пользователей (admin + user)

### `client.v2`
- `npm start` / `npm run dev` — запуск Vite dev-server
- `npm run build` — production-сборка
- `npm run preview` — предпросмотр production-сборки

## Импорт тестовых данных

Если нужен заполненный каталог/пользователи, импортируйте дамп `database.sql`:

```bash
psql -U postgres online_store < database.sql
```

Для Docker:

```bash
docker compose exec -T db psql -U postgres online_store < database.sql
```

## Фикстуры пользователей

По умолчанию создаются 2 аккаунта:
- админ: `admin@local.test` / `Admin12345`
- пользователь: `user@local.test` / `User12345`

Локально:

```bash
cd server
npm run seed:users
```

В Docker фикстуры создаются автоматически при старте `server` контейнера.

После импорта рекомендуется:
- сменить пароли тестовых пользователей
- удалить тестовые учетные записи
- выставить `DB_SYNC=false`

## Важно

- Если меняете порт клиента, обновите `CORS_ORIGINS` в `server/.env`.
- Если меняете порты в Docker, обновите `CORS_ORIGINS` в `server/.env.docker`.
- Если меняете порты в Docker, обновите `VITE_API_URL` и `VITE_IMG_URL` в `docker-compose.yml` (build args `client`).
- Не коммитьте реальные секреты в `.env`.
