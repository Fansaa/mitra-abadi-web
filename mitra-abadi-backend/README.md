# Mitra Abadi — Backend (REST API)

Laravel 11 REST API powering the Mitra Abadi textile distribution platform. Handles product catalog, inventory management, order records, AI chatbot integration, and token-based admin authentication via Laravel Sanctum.

## Tech Stack

- **Framework**: Laravel 11 (PHP 8.2+)
- **Database**: MySQL
- **Authentication**: Laravel Sanctum (token-based)
- **AI Chatbot**: Google Gemini 3.1 Flash-Lite
- **File Storage**: Laravel Storage (local + symbolic link)

## Prerequisites

- PHP 8.2+
- Composer
- MySQL (Laragon / XAMPP / local)
- A [Google Gemini API key](https://aistudio.google.com/apikey)

## Installation

### 1. Install dependencies

```bash
composer install
```

### 2. Set up environment

```bash
cp .env.example .env
```

Open `.env` and configure your database and API key:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mitra_abadi
DB_USERNAME=root
DB_PASSWORD=

GEMINI_API_KEY=your_gemini_api_key_here
WHATSAPP_ADMIN_NUMBER=628123456789
```

### 3. Generate application key

```bash
php artisan key:generate
```

### 4. Run migrations and seeders

```bash
php artisan migrate --seed
```

This creates all tables and seeds initial data including the default admin account, sample categories, and products.

### 5. Create storage symbolic link

```bash
php artisan storage:link
```

Required for serving uploaded product images.

### 6. Start the server

```bash
php artisan serve
```

API will be available at `http://localhost:8000`

---

## Default Admin Account

| Field | Value |
|---|---|
| Email | `admin@mitraabadi.com` |
| Password | `password` |

---

## API Endpoints

### Public

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | List all active products |
| `GET` | `/api/products/{id}` | Product detail with variants |
| `GET` | `/api/categories` | List all categories |
| `POST` | `/api/chatbot/session` | Start a new chatbot session |
| `POST` | `/api/chatbot/message` | Send message to AI chatbot |
| `POST` | `/api/auth/login` | Admin login (returns Sanctum token) |

### Admin (requires Bearer token)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/logout` | Logout and revoke token |
| `GET` | `/api/admin/dashboard` | Dashboard statistics |
| `GET` | `/api/admin/products` | List all products |
| `POST` | `/api/admin/products` | Create new product |
| `PUT` | `/api/admin/products/{id}` | Update product |
| `DELETE` | `/api/admin/products/{id}` | Delete product |
| `GET` | `/api/admin/inventories` | Inventory data |
| `GET` | `/api/admin/categories` | Category management |
| `POST` | `/api/admin/categories` | Create category |
| `PUT` | `/api/admin/categories/{id}` | Update category |
| `DELETE` | `/api/admin/categories/{id}` | Delete category |
| `GET` | `/api/admin/orders` | Order history |
| `POST` | `/api/admin/orders` | Record new order |

A full Postman collection is available at `Mitra_Abadi_Postman_Collection.json`.

---

## Features

- **Product Catalog** — products with multiple color variants and images, category filtering
- **Inventory Tracking** — stock per roll, low-stock alerts
- **AI Chatbot** — context-aware assistant using Gemini 3.1 Flash-Lite with full product knowledge base
- **Admin Dashboard** — sales totals, transaction charts, low-stock summary
- **Order Management** — manual order entry and transaction history
- **Token Authentication** — Sanctum-based login for admin panel access

---

© 2026 Mitra Abadi
