# Mitra Abadi — Textile Distribution Information System

A web application for product catalog management and textile distribution at **Mitra Abadi**. Built with Laravel (REST API) and React + Vite as the user interface.

---

## Project Structure

```
mitra-abadi/
├── mitra-abadi-backend/    # REST API — Laravel 11
└── mitra-abadi-frontend/   # User interface — React + Vite
```

---

## Features

### Public Pages (User)
- **Fabric Catalog** — browse products with category filter and color palette
- **Product Detail** — full specifications, color variants, price range
- **AI Chatbot** — virtual assistant powered by Gemini AI to answer product-related questions
- **About Page** — company profile

### Admin Panel
- **Dashboard** — sales statistics, low-stock alerts, and transaction charts
- **Inventory Management** — add, edit, delete products along with color variants and images
- **Category Management** — manage fabric material categories
- **Transaction History** — incoming order records

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 11, PHP 8.2 |
| Database | MySQL |
| Auth | Laravel Sanctum (token-based) |
| AI Chatbot | Google Gemini 3.1 Flash-Lite |
| Frontend | React 18, Vite |
| Styling | Tailwind CSS |
| HTTP Client | Axios |

---

## Getting Started

### Prerequisites
- PHP 8.2+, Composer
- Node.js 18+, NPM
- MySQL (Laragon / XAMPP / local)

---

### 1. Backend (Laravel)

```bash
cd mitra-abadi-backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate
```

Edit the `.env` file with your database credentials and API key:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mitra_abadi
DB_USERNAME=root
DB_PASSWORD=

GEMINI_API_KEY=        # https://aistudio.google.com/apikey
WHATSAPP_ADMIN_NUMBER=628123456789
```

```bash
# Create database, run migrations and seeders
php artisan migrate --seed

# Create symbolic link for storage
php artisan storage:link

# Start server
php artisan serve
```

API will be available at `http://localhost:8000`

> **Default admin account:**
> Email: `admin@mitraabadi.com` | Password: `password`

---

### 2. Frontend (React)

```bash
cd mitra-abadi-frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

Fill in the `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WHATSAPP_ADMIN_NUMBER=628123456789
```

```bash
# Start development server
npm run dev
```

App will be available at `http://localhost:5173`

---

## Main API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | List all active products |
| `GET` | `/api/products/{id}` | Product detail |
| `GET` | `/api/categories` | List categories |
| `POST` | `/api/chatbot/session` | Start chatbot session |
| `POST` | `/api/chatbot/message` | Send message to chatbot |
| `POST` | `/api/auth/login` | Admin login |
| `GET` | `/api/admin/dashboard` | Dashboard data (auth) |
| `GET` | `/api/admin/products` | Product management (auth) |
| `GET` | `/api/admin/inventories` | Inventory data (auth) |

Postman collection available at `mitra-abadi-backend/Mitra_Abadi_Postman_Collection.json`

---

## License

This project was created for academic purposes — Computing Project course, Semester 6.
