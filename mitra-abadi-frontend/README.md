# Mitra Abadi — Frontend

React + Vite frontend for the Mitra Abadi textile distribution platform. Includes a public-facing product catalog and a protected admin panel, both connected to the Laravel REST API backend.

## Project Summary

- **Public / User side** — fabric catalog with category filter, color palette, product detail, about page, and AI chatbot
- **Admin side** — dashboard, inventory management, category management, manual order entry, and specimen entry form
- **Data source** — all data fetched from the Laravel backend API via Axios
- **Admin authentication** — token-based login via Laravel Sanctum

## Tech Stack

- React `18`
- Vite
- React Router DOM `6`
- Tailwind CSS
- Axios
- react-markdown

## Prerequisites

- Node.js `18+` (latest LTS recommended)
- npm

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment:

   ```bash
   cp .env.example .env
   ```

   Fill in `.env`:

   ```env
   VITE_API_BASE_URL=http://localhost:8000
   VITE_WHATSAPP_ADMIN_NUMBER=628123456789
   ```

3. Start development server:

   ```bash
   npm run dev
   ```

4. Open the URL shown in the terminal (usually `http://localhost:5173`).

> Make sure the Laravel backend is running at `http://localhost:8000` before starting the frontend.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm run build` | Production build to `dist/` folder |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

## Routes

### Public / User

| Path | Page |
|---|---|
| `/` | Fabric catalog (`Catalog`) |
| `/catalog/:id` | Product detail (`CatalogDetail`) |
| `/about` | About page (`About`) |

### Admin

| Path | Page |
|---|---|
| `/admin/login` | Admin login (`LoginAdmin`) |
| `/admin/dashboard` | Dashboard (`Dashboard`) |
| `/admin/inventory` | Inventory list (`Inventory`) |
| `/admin/inventory/:id` | Specimen detail (`DetailSpesimen`) |
| `/admin/inventory/:id/edit` | Edit specimen (`EditSpesimen`) |
| `/admin/manajemen-kategori` | Category list (`ManajemenKategori`) |
| `/admin/manajemen-kategori/:id` | Category detail (`DetailKategori`) |
| `/admin/manual-order-entry` | Manual order entry (`ManualOrderEntry`) |
| `/admin/specimen-entry` | Add specimen form (`SpecimenEntry`) |

## Default Admin Login

| Field | Value |
|---|---|
| Email | `admin@mitraabadi.com` |
| Password | `password` |

After a successful login, the admin token is stored and the user is redirected to `/admin/dashboard`.

## Folder Structure

```
src/
├── api/
│   └── axios.js           # Axios instance with base URL and auth interceptors
├── components/
│   ├── layout/
│   │   └── AdminLayout.jsx
│   ├── ChatWindow.jsx
│   ├── FabricCard.jsx
│   ├── NavAdmin.jsx
│   ├── PageLoader.jsx
│   ├── SectionLoader.jsx
│   └── SidebarAdmin.jsx
├── pages/
│   ├── admin/
│   └── user/
├── App.jsx
├── index.css
└── main.jsx
```

---

© 2026 Mitra Abadi
