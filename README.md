# مطعم - Restaurant Management System

Full-stack restaurant management app with Admin Dashboard + Customer Frontend.

## Stack

- **Backend:** Express 5 + TypeScript + Prisma 6 + PostgreSQL
- **Admin Dashboard:** React 19 + Vite 8 + TanStack Query 5 + TailwindCSS 4
- **Customer Frontend:** React 19 + Vite 8 + TanStack Query 5 + TailwindCSS 4
- **Shared:** Zod 4 schemas (single validation source)

## Setup

```bash
# 1. Start PostgreSQL
docker compose up -d

# 2. Install dependencies
npm install

# 3. Generate Prisma client + run migration + seed
cd apps/api
npx prisma generate
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
cd ../..

# 4. Start all apps (API on :4000, Admin on :5173, Client on :5174)
npm run dev
```

## Default Admin Login

```
Email:    admin@restaurant.com
Password: admin123
```

## Structure

```
restaurant-app/
├── apps/
│   ├── api/          # Express API (port 4000)
│   ├── admin/        # Admin Dashboard (port 5173)
│   └── client/       # Customer Frontend (port 5174)
├── packages/
│   └── shared/       # Zod schemas + types
└── docker-compose.yml
```

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/login | No | Login |
| POST | /api/auth/register | No | Register admin |
| GET | /api/menu | No | List menu items |
| POST | /api/menu | Admin | Create item |
| PUT | /api/menu/:id | Admin | Update item |
| DELETE | /api/menu/:id | Admin | Delete item |
| GET | /api/categories | No | List categories |
| POST | /api/orders | No | Create order (customer) |
| GET | /api/orders | Admin | List orders |
| GET | /api/orders/:id | No | Get order |
| PATCH | /api/orders/:id/status | Admin | Update status |
| GET | /api/tables | Admin | List tables |
| POST | /api/tables | Admin | Create table |
| POST | /api/pos/order | Admin | POS quick order |
| GET | /api/pos/active | Admin | Active POS orders |
| GET | /api/reports/sales | Admin | Sales report |
