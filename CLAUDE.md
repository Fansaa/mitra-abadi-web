# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Mitra Abadi** — a textile distribution information system. Monorepo with two separate apps:
- `mitra-abadi-backend/` — Laravel 11 REST API (PHP 8.3)
- `mitra-abadi-frontend/` — React 18 + Vite SPA

---

## Commands

### Backend (`cd mitra-abadi-backend`)

```bash
php artisan serve              # Start API at http://localhost:8000
php artisan migrate            # Run pending migrations
php artisan migrate:fresh --seed  # Full reset + seed
php artisan storage:link       # Create public/storage symlink (required for images)
composer test                  # Run PHPUnit tests (clears config first)
./vendor/bin/pint              # Format PHP code (Laravel Pint)
php artisan tinker             # Interactive REPL
```

Run everything at once (server + queue + logs + vite):
```bash
composer dev
```

### Frontend (`cd mitra-abadi-frontend`)

```bash
npm run dev      # Start dev server at http://localhost:5173
npm run build    # Production build to dist/
npm run lint     # ESLint check
npm run preview  # Preview production build
```

---

## Architecture

### Backend

**Route structure** (`routes/api.php`):
- Public: `GET /api/products`, `GET /api/categories`, `GET /api/products/{id}` — handled by `CatalogController`
- Public: `POST /api/chatbot/session`, `POST /api/chatbot/message` — Gemini AI integration in `ChatbotController`
- Auth: `POST /api/auth/login` → returns Sanctum token stored on frontend as `auth_token` in localStorage
- Admin (requires `auth:sanctum` + `admin` middleware): all under `/api/admin/` — dashboard, categories, products, inventories, orders, and PDF document export

**Data model** (key relationships):
- `Category` → `Product` (hasMany) → `ProductVariant` (hasMany, stores color hex/name per variant)
- `Product` → `Inventory` (inventory is per-product, not per-variant)
- `Order` → `OrderItem` (hasMany) → `ProductVariant` (belongsTo)
- `Order` also has `Document` for generated PDFs (invoice + packing list via `barryvdh/laravel-dompdf`)
- `Product` uses `SoftDeletes` — deleted products persist in DB; use `withTrashed()` when needed

**PDF generation**: `ApiDocumentController` generates invoice and packing-list PDFs using Blade templates at `resources/views/pdf/`. The `Document` model tracks generated files.

**CORS**: `config/cors.php` allows `http://localhost:5173` and `env('FRONTEND_URL')`. For production, set `FRONTEND_URL` in `.env`.

**Auth**: Laravel Sanctum token-based (not session/cookie). The `admin` middleware is a custom gate check — only users with `is_admin = true` can access admin routes.

### Frontend

**Entry point**: `src/main.jsx` → `src/App.jsx` (React Router v7 route tree)

**Route structure** (`App.jsx`):
- Public: `/`, `/about`, `/catalog`, `/catalog/:id`, `/contact`
- Protected (via `ProtectedRoute`): all `/admin/*` routes rendered inside `AdminLayout`

**Auth state**: `src/context/AuthContext.jsx` — provides `{ user, login, logout, isAuthenticated }` via React context. Token is stored in `localStorage` as `auth_token`; user object as `auth_user`.

**HTTP client**: `src/lib/api.js` — an Axios instance pre-configured with `VITE_API_BASE_URL/api` as base URL. Automatically injects `Authorization: Bearer <token>` from localStorage. On 401, clears auth and redirects to `/admin/login`.

**UI conventions**:
- Skeleton loading components (`Skeleton.jsx`, `SectionLoader.jsx`, `PageLoader.jsx`) used for async states
- `SweetAlert2` (imported as `Swal`) for confirmations and toast notifications
- Tailwind CSS v4 for styling (config via `@tailwindcss/vite` plugin, not a `tailwind.config.js` postcss plugin)
- Admin pages use Indonesian language for labels (e.g., `ManajemenKategori`, `RiwayatTransaksi`, `SpesimenEntry`)
- `xlsx` package used in `RiwayatTransaksi.jsx` for export-to-Excel functionality

**Component conventions**: Admin-side components import from `src/components/NavAdmin.jsx`, `SidebarAdmin.jsx`, and are wrapped by `src/components/layout/AdminLayout.jsx`.

---

## Environment Variables

### Backend (`.env`)
```
DB_CONNECTION=mysql
DB_DATABASE=mitra_abadi
GEMINI_API_KEY=        # Required for chatbot
FRONTEND_URL=          # Required for production CORS
```

### Frontend (`.env`)
```
VITE_API_BASE_URL=http://localhost:8000
VITE_WHATSAPP_ADMIN_NUMBER=628...
```

---

## Key Notes

- Default admin credentials (from seeder): `admin@mitraabadi.com` / `password`
- Postman collection: `mitra-abadi-backend/Mitra_Abadi_Postman_Collection.json`
- `OrderItem` stores `warna` (color text), `qty_roll`, `qty_yard`, `qty_meter` — the `warna` and `qty_yard` columns were added via migration `2026_05_17_000001`
- `Product.sku_code` was renamed from `composition` — check migrations if DB field name is unclear
