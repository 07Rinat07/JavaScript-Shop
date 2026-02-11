# JavaScript Shop

![Витрина проекта JavaScript Shop](docs/project-preview.png)

## Windows PowerShell quick start

Для Windows используйте команды ниже в `PowerShell` (остальные команды в README в основном даны в `bash`).

Локальный запуск:

```powershell
cd server
npm run env:init
npm install
npm run migrate
npm run start-dev

cd ../client
npm run env:init
npm install
npm start
```

Docker:

```powershell
node scripts/init-env.js .env.example .env
docker compose up -d --build
```

## Принимайте участие в разработке
Приветствуются пулл-реквесты (PR) и сообщения об ошибках. Пожалуйста, добавляйте тесты для нового функционала.

Интернет-магазин на:
- `server` - Node.js + Express + Sequelize + PostgreSQL
- `client` - React 19 + Vite (единый клиент)

## Версии backend-стека

- `Node.js`: `^20.19.0 || >=22.12.0`
- `Express`: `^5.2.1`
- `Sequelize`: `^6.37.7`
- `PostgreSQL`: `15+` (рекомендуется `16`, Docker по умолчанию: `postgres:16-alpine`)



## Требования

- Node.js `^20.19.0` или `>=22.12.0`
- npm 9+
- PostgreSQL `15+` (рекомендуется 16)
- Docker 24+ и Docker Compose v2 (опционально)

## Кроссплатформенность

Проект поддерживает Ubuntu, macOS и Windows (PowerShell):
- все npm-скрипты запускаются одинаково на всех трёх ОС;
- для инициализации `.env` используйте кроссплатформенный скрипт `node scripts/init-env.js`;
- Docker-команды из раздела ниже одинаково работают на Ubuntu, macOS и Windows (PowerShell).

## Локальный запуск

1. Создайте базу:

```sql
CREATE DATABASE online_store;
```

2. Сервер:

```bash
cd server
npm run env:init
npm install
npm run migrate
npm run start-dev
```

Минимально проверьте в `server/.env`:
- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_PORT`
- `SECRET_KEY` (минимум 32 символа, без значений по умолчанию)
- `PAYMENT_WEBHOOK_SECRET` (минимум 24 символа)

Пример генерации безопасных значений:

```bash
node -e "const c=require('crypto');console.log('SECRET_KEY='+c.randomBytes(32).toString('hex'));console.log('PAYMENT_WEBHOOK_SECRET='+c.randomBytes(24).toString('hex'))"
```

Сервер: `http://localhost:7000`.

3. Клиент:

```bash
cd ../client
npm run env:init
npm install
npm start
```

Клиент: `http://localhost:3000`.

Важно: фикстуры пользователей, каталог и полный дамп `database.sql` не импортируются автоматически ни локально, ни в Docker.
Все команды для ручной загрузки данных собраны в разделе `Ручная загрузка данных (фикстуры, каталог и полный дамп)`.

## Docker

Запуск из корня:

```bash
node scripts/init-env.js .env.example .env
docker compose up -d --build
```

Docker автоматически использует:
- `server/.env.docker` для backend
- root `.env` для:
  - `POSTGRES_IMAGE` (версия Postgres)
  - `SECRET_KEY`
  - `PAYMENT_WEBHOOK_SECRET`

Перед стартом обязательно задайте в root `.env`:
- `SECRET_KEY` (минимум 32 символа)
- `PAYMENT_WEBHOOK_SECRET` (минимум 24 символа)

Генерация безопасных значений:

```bash
node -e "const c=require('crypto');console.log('SECRET_KEY='+c.randomBytes(32).toString('hex'));console.log('PAYMENT_WEBHOOK_SECRET='+c.randomBytes(24).toString('hex'))"
```

Фикстуры пользователей, каталог и полный дамп `database.sql` не импортируются автоматически.
Используйте команды из раздела `Ручная загрузка данных (фикстуры, каталог и полный дамп)`.

Сервисы:
- клиент: `http://localhost:3000`
- API: `http://localhost:7000/api`
- health: `http://localhost:7000/health`

Проверка после старта:

```bash
docker compose ps
curl http://localhost:7000/health
```

Остановка:

```bash
docker compose down
```

Полный рестарт проекта с пересборкой:

```bash
docker compose down && docker compose up -d --build
```

С очисткой данных PostgreSQL:

```bash
docker compose down -v
```

## PostgreSQL 15/16 в Docker

По умолчанию используется образ `postgres:16-alpine`.

Можно переключить, например, на 15 (через `.env`):

```bash
POSTGRES_IMAGE=postgres:15-alpine
```

Или разово без изменения `.env`:

```bash
POSTGRES_IMAGE=postgres:15-alpine docker compose up -d --build
```

PowerShell:

```powershell
$env:POSTGRES_IMAGE='postgres:15-alpine'; docker compose up -d --build
```

Если меняете major-версию PostgreSQL на уже существующем volume, обычно нужен перезапуск с очисткой данных:

```bash
docker compose down -v
docker compose up -d --build
```

## Переменные окружения

### `.env` (root, для Docker Compose)

```env
POSTGRES_IMAGE=postgres:16-alpine
SECRET_KEY=
PAYMENT_WEBHOOK_SECRET=
```

### `server/.env`

```env
PORT=7000

DB_HOST=localhost
DB_NAME=online_store
DB_USER=postgres
DB_PASS=change_me
DB_PORT=5432

SECRET_KEY=__SET_STRONG_SECRET_KEY__
BCRYPT_SALT_ROUNDS=10
PAYMENT_WEBHOOK_SECRET=__SET_PAYMENT_WEBHOOK_SECRET__
CORS_ORIGINS=http://localhost:3000
RATE_LIMIT_MAX=300
UPLOAD_MAX_FILE_SIZE=5242880
```

### `client/.env`

```env
VITE_API_URL=http://localhost:7000/api/
VITE_IMG_URL=http://localhost:7000/
```

## Скрипты

### `server`
- `npm run migrate` - запуск SQL-миграций
- `npm run start-dev` - dev-запуск
- `npm start` - production-запуск
- `npm test` - API smoke-тесты
- `npm run seed:users` - upsert фикстурных пользователей (только при явно заданных env)
- `npm run restore:catalog` - восстановление товаров и свойств из `database.sql`

### `client`
- `npm start` / `npm run dev` - запуск Vite
- `npm run build` - production-сборка
- `npm run preview` - preview сборки
- `npm test` - unit-тесты (Vitest)

## Валюта в витрине

В шапке сайта доступен переключатель валюты:
- `KZT` (по умолчанию)
- `RUB`

Курс `RUB -> KZT` синхронизируется из внешних API через backend:
- `GET /api/currency/rub-kzt` (поддерживает `?refresh=1` для принудительной актуализации)
- при недоступности внешних источников используется безопасный fallback.

## API каталога: поиск и сортировка

`GET /api/product/getall` поддерживает параметры:
- `q` - строка поиска (до 80 символов, ищет по названию товара, бренду и категории)
- `sort` - сортировка (`name_asc`, `price_asc`, `price_desc`, `rating_desc`, `newest`)
- `page` - номер страницы (по умолчанию `1`)
- `limit` - элементов на страницу (по умолчанию `3`, максимум `100`)

Параметры можно комбинировать с маршрутами фильтрации:
- `/api/product/getall/categoryId/:categoryId`
- `/api/product/getall/brandId/:brandId`
- `/api/product/getall/categoryId/:categoryId/brandId/:brandId`

## API контента: шапка, доставка, контакты, главная

- `GET /api/content/navbar` — публично, данные шапки сайта
- `PUT /api/content/navbar` — только администратор, обновляет шапку
- `GET /api/content/delivery` — публично, страница доставки и список GPS-точек
- `PUT /api/content/delivery` — только администратор, обновляет страницу доставки и точки
- `GET /api/content/contacts` — публично, данные страницы контактов
- `PUT /api/content/contacts` — только администратор, обновляет контакты
- `GET /api/content/home` — публично, hero-блок главной страницы
- `PUT /api/content/home` — только администратор, обновляет hero-блок главной
- `DELETE /api/content/home` — только администратор, удаляет/сбрасывает hero-блок главной

## API валют

- `GET /api/currency/rub-kzt` — курс RUB → KZT (`?refresh=1` для принудительного обновления)
- `GET /api/currency/overview` — обзор курсов для виджетов кабинета
  - параметры: `base` (например `KZT`), `symbols` (например `USD,EUR,RUB,KZT,CNY,GBP`), `refresh=1`

## API обратной связи

- `POST /api/feedback/create` — публично, отправка обращения из формы обратной связи
- `GET /api/feedback/admin/getall` — только администратор, список обращений (`?status=new|read|spam`)
- `GET /api/feedback/admin/getone/:id` — только администратор, чтение обращения
- `PATCH /api/feedback/admin/read/:id` — только администратор, пометить как прочитанное
- `PATCH /api/feedback/admin/block/:id` — только администратор, пометить как спам и заблокировать отправителя
- `DELETE /api/feedback/admin/delete/:id` — только администратор, удалить обращение

## API платежей

- `POST /api/payment/order/:orderId/initiate` — инициация платежа (авторизованный владелец заказа или администратор)
  - обязательный header: `Idempotency-Key`
  - body: `provider` (`mock`), `currency`, `returnUrl`, `metadata`
- `GET /api/payment/order/:orderId` — получить платеж заказа (авторизованный владелец заказа или администратор)
- `POST /api/payment/webhook/:provider` — webhook провайдера (raw JSON)
  - обязательный header: `x-webhook-signature` (HMAC SHA-256 от raw body)
  - секрет подписи: `PAYMENT_WEBHOOK_SECRET`

## Тесты и проверка

Локально:

```bash
cd server && npm test
cd ../client && npm test && npm run build
```

В Docker:

```bash
docker compose run --rm --no-deps -e NODE_ENV=test -v "$PWD/server:/app" -v /app/node_modules server sh -lc "npm ci --include=dev && npm test"
docker compose run --rm --no-deps -e NODE_ENV=development -v "$PWD/client:/workspace/client" -v /workspace/client/node_modules server sh -lc "cd /workspace/client && npm ci --include=dev && npm test && npm run build"
```

PowerShell:

```powershell
docker compose run --rm --no-deps -e NODE_ENV=test -v "${PWD}/server:/app" -v /app/node_modules server sh -lc "npm ci --include=dev && npm test"
docker compose run --rm --no-deps -e NODE_ENV=development -v "${PWD}/client:/workspace/client" -v /workspace/client/node_modules server sh -lc "cd /workspace/client && npm ci --include=dev && npm test && npm run build"
```

Примечание:
- предупреждение `No services to build` от Docker Compose для `run` допустимо и не является ошибкой;
- отдельный том `-v /.../node_modules` обязателен, чтобы изолировать Linux-зависимости контейнера от хостового `node_modules` (особенно важно на Windows).
- на первом запуске после строки `Container ... Creating/Created` возможна пауза на `npm ci` (это нормально, контейнер не завис).

## Ручная загрузка данных (фикстуры, каталог и полный дамп)

По умолчанию данные не загружаются автоматически:
- фикстуры пользователей;
- каталог (товары + характеристики);
- полный дамп `database.sql`.

### 1) Фикстуры пользователей

Локально:

```bash
cd server
FIXTURE_ADMIN_EMAIL=admin@local.test \
FIXTURE_ADMIN_PASSWORD='set_strong_password' \
FIXTURE_USER_EMAIL=user@local.test \
FIXTURE_USER_PASSWORD='set_strong_password' \
npm run seed:users
```

PowerShell:

```powershell
cd server
$env:FIXTURE_ADMIN_EMAIL='admin@local.test'
$env:FIXTURE_ADMIN_PASSWORD='set_strong_password'
$env:FIXTURE_USER_EMAIL='user@local.test'
$env:FIXTURE_USER_PASSWORD='set_strong_password'
npm run seed:users
```

Docker:

```bash
docker compose exec server sh -lc "FIXTURE_ADMIN_EMAIL=admin@local.test FIXTURE_ADMIN_PASSWORD='set_strong_password' FIXTURE_USER_EMAIL=user@local.test FIXTURE_USER_PASSWORD='set_strong_password' npm run seed:users"
```

### 2) Восстановление каталога из `database.sql` (только товары + характеристики)

Локально:

```bash
cd server
npm run restore:catalog
```

Docker:

```bash
docker compose exec server npm run restore:catalog
```

### 3) Полный импорт `database.sql` (вся БД)

Импортируйте только в чистую БД. После импорта обязательно запустите миграции, чтобы добавить недостающие таблицы/индексы (включая payment-домен).

Локально:

```bash
psql -v ON_ERROR_STOP=1 -U postgres -d online_store -f database.sql
cd server
npm run migrate
```

Docker:

```bash
docker compose down -v
docker compose up -d --wait db
docker compose cp database.sql db:/tmp/database.sql
docker compose exec db sh -lc "psql -v ON_ERROR_STOP=1 -U postgres -d online_store -f /tmp/database.sql"
docker compose up -d --wait server client
```
