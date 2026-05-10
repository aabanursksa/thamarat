# Restaurant Management System — PROJECT_MAP

> Generated: 2026-05-09 | Tech Lead: Planning Protocol

## [TECH_STACK]

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Runtime | Node.js | 24.15 LTS | Current LTS |
| Language | TypeScript | 6.0.3 | strict mode |
| Backend Framework | Express | 5.2.1 | async error handling via wrapper |
| ORM | Prisma | 7.8.0 | PostgreSQL dialect |
| Database | SQLite (dev) / PostgreSQL (prod) | — | SQLite for local, swap to PostgreSQL for production |
| Validation | Zod | 4.4.3 | shared schemas package |
| Frontend Build | Vite | 8.0.11 | SPA mode + @vitejs/plugin-react |
| CSS | TailwindCSS | 4.3.0 | via @tailwindcss/vite plugin |
| UI (Admin) | React | 19.2.6 | + TailwindCSS 4.3.0 |
| UI (Customer) | React | 19.2.6 | + TailwindCSS 4.3.0 |
| Server State | @tanstack/react-query | 5.100.9 | caching, mutations |
| Auth | JWT (jsonwebtoken) | latest | access + refresh tokens |
| Logging | pino | latest | async, zero-overhead |
| Monorepo | npm workspaces | — | built-in, no extra tools |

## [ARCHITECTURE]

```
restaurant-app/
├── apps/
│   ├── api/                      # Express backend (port 4000)
│   │   ├── prisma/
│   │   │   └── schema.prisma     # Data models
│   │   ├── src/
│   │   │   ├── middleware/       # auth, error, validate
│   │   │   ├── modules/          # Feature-based domains
│   │   │   │   ├── menu/         # menu CRUD + categories
│   │   │   │   ├── orders/       # order lifecycle
│   │   │   │   ├── tables/       # table management
│   │   │   │   ├── pos/          # point-of-sale logic
│   │   │   │   ├── reports/      # aggregations + stats
│   │   │   │   └── auth/         # login, register, refresh
│   │   │   ├── lib/              # shared util (logger, jwt, prisma client)
│   │   │   └── index.ts          # entry point
│   │   └── package.json
│   ├── admin/                    # Admin Dashboard (port 5173)
│   │   ├── src/
│   │   │   ├── pages/            # Route pages
│   │   │   ├── components/       # Shared UI components
│   │   │   ├── hooks/            # Custom hooks + react-query
│   │   │   ├── lib/              # API client, auth context
│   │   │   └── main.tsx
│   │   └── package.json
│   └── client/                   # Customer Frontend (port 5174)
│       ├── src/
│       │   ├── pages/            # Menu browsing, cart, order tracking
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── lib/
│       │   └── main.tsx
│       └── package.json
└── packages/
    └── shared/                   # Shared Zod schemas + types
        ├── src/
        │   ├── schemas/          # menu.schema.ts, order.schema.ts, etc.
        │   └── index.ts
        └── package.json
```

### Key Architectural Decisions (Surgical)

1. **Monorepo with npm workspaces** — zero extra tooling, native support since npm 7+
2. **Shared Zod schemas** as the single source of truth for validation on both Express and React — no manual type duplication
3. **No Micro-files**: each domain module has max 3 files: `controller.ts`, `service.ts`, `routes.ts` (or less if simple)
4. **No ORM abstraction layer**: Prisma IS the data layer — wrapping it adds zero value for this scale
5. **No state management library** beyond react-query — no Redux, no Zustand for this scope
6. **No WebSocket initially** — polling with react-query `refetchInterval` for order status updates (simpler, verifiable)

## [SYSTEM_FLOW]

### User Journeys (Verifiable Goals)

```
[A] Customer Frontend Flow
    1. Visit /menu → fetch menu items (GET /api/menu) → display categorized menu
    2. Add items to cart (local state)
    3. Submit order → POST /api/orders → receive order ID
    4. Track order status → poll GET /api/orders/:id every 10s

[B] Admin Dashboard Flow
    1. Login → POST /api/auth/login → receive JWT
    2. Manage Menu → CRUD /api/menu (protected)
    3. View Orders → GET /api/orders?status=pending (poll every 15s)
    4. Update Order Status → PATCH /api/orders/:id/status
    5. POS (Quick Order) → POST /api/pos/order (simplified, cashier-facing)
    6. Table Management → CRUD /api/tables + assign orders
    7. Reports → GET /api/reports/sales?range=day|week|month

[C] API Data Flow
    Client → Express Router → Auth Middleware → Controller → Service → Prisma → PostgreSQL
                                                     ↕
                                              Zod Validation (shared schemas)
```

### API Routes (scope-locked, no feature creep)

```
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/register       (admin creation only)

GET    /api/menu                 (public)
GET    /api/menu/:id             (public)
POST   /api/menu                 (admin)
PUT    /api/menu/:id             (admin)
DELETE /api/menu/:id             (admin)

GET    /api/categories           (public)
POST   /api/categories           (admin)
PUT    /api/categories/:id       (admin)
DELETE /api/categories/:id       (admin)

POST   /api/orders               (customer)
GET    /api/orders               (admin, filter by status)
GET    /api/orders/:id           (customer + admin)
PATCH  /api/orders/:id/status    (admin)

GET    /api/tables               (admin)
POST   /api/tables               (admin)
PATCH  /api/tables/:id           (admin)
DELETE /api/tables/:id           (admin)

POST   /api/pos/order            (admin/cashier quick order)
GET    /api/pos/active           (admin — active POS orders)

GET    /api/reports/sales        (admin, query: dateFrom, dateTo, groupBy)
```

## [DOMAIN-DRIVEN DATA MODEL] (Prisma)

```
enum OrderStatus { PENDING, CONFIRMED, PREPARING, READY, COMPLETED, CANCELLED }

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  role      String   @default("admin")  // admin | cashier
  createdAt DateTime @default(now())
}

model Category {
  id       String   @id @default(uuid())
  name     String   @unique
  sortOrder Int     @default(0)
  menuItems MenuItem[]
}

model MenuItem {
  id          String     @id @default(uuid())
  name        String
  description String?
  price       Decimal    @db.Decimal(10,2)
  image       String?
  available   Boolean    @default(true)
  categoryId  String
  category    Category   @relation(fields: [categoryId], references: [id])
  orderItems  OrderItem[]
  createdAt   DateTime   @default(now())
}

model Table {
  id      String  @id @default(uuid())
  number  Int     @unique
  qrCode  String? // QR linking to customer menu
  orders  Order[]
}

model Order {
  id          String       @id @default(uuid())
  status      OrderStatus  @default(PENDING)
  total       Decimal      @db.Decimal(10,2)
  tableId     String?
  table       Table?       @relation(fields: [tableId], references: [id])
  items       OrderItem[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model OrderItem {
  id         String    @id @default(uuid())
  orderId    String
  order      Order     @relation(fields: [orderId], references: [id])
  menuItemId String
  menuItem   MenuItem  @relation(fields: [menuItemId], references: [id])
  quantity   Int       @default(1)
  unitPrice  Decimal   @db.Decimal(10,2)
}
```

## [LOGGING STRATEGY]

```
Layer    : pino (async, JSON, no-blocking)
Levels   : info, warn, error (no debug in production)
Format   : JSON logs → stdout (container-native)
Context  : requestId, userId, action (attached via middleware)
Storage  : stdout only (no file rotation — handled by Docker/infra)
```

## [ORPHANS & PENDING]

| Item | Status | Note |
|---|---|---|
| QR code generation | PENDING | For table labels (low priority) |
| PostgreSQL for production | PENDING | Swap SQLite → PostgreSQL + Docker Compose |
| Email notifications | EXCLUDED | Not requested |
| Payment integration | EXCLUDED | Not requested (MVP scope) |
| Delivery / takeaway | EXCLUDED | Not requested |
| Multi-language (i18n) | EXCLUDED | Not requested |

## [MILESTONES — Verifiable Goals]

### M1: Scaffold + Database (Day 1) ✅
- [x] Initialize monorepo with npm workspaces
- [x] Configure Prisma with PostgreSQL (schema + client generated)
- [x] Seed script written (admin user, 3 categories, 6 items, 8 tables)
- **Verify:** `npx prisma generate` succeeds, schema compiles

### M2: API Core + Auth (Day 2) ✅
- [x] Express app with middleware stack (cors, json, pino-logger, error handler)
- [x] Auth module (register, login, refresh token) with bcrypt + JWT
- [x] Shared Zod schemas in `packages/shared`
- **Verify:** TypeScript compiles with `tsc --noEmit`

### M3: Menu + Categories API (Day 3) ✅
- [x] CRUD `/api/menu` + `/api/categories`
- [x] Zod validation for all inputs (shared schemas)
- **Verify:** TypeScript compiles, routes are mounted correctly

### M4: Orders + Tables API (Days 4-5) ✅
- [x] Orders CRUD (customer submit, admin update status)
- [x] Tables CRUD
- [x] POS quick-order endpoint (auto-status CONFIRMED)
- **Verify:** TypeScript compiles, all endpoints defined in router

### M5: Reports API (Day 6) ✅
- [x] Sales report endpoint with date range filtering
- [x] Returns summary (totalOrders, totalRevenue, averageOrderValue) + daily breakdown
- **Verify:** TypeScript compiles

### M6: Admin Dashboard Frontend (Days 7-10) ✅
- [x] Login page → JWT stored in localStorage, AuthContext provider
- [x] Orders page (filter by status, status update buttons, polling every 15s)
- [x] Menu page (CRUD with modal form, categories management)
- [x] Tables page (grid view, add/delete)
- [x] POS page (item grid, cart, table selection, active orders sidebar)
- [x] Reports page (date range filter, summary cards, daily breakdown)
- **Verify:** `npx tsc --noEmit` + `npx vite build` both succeed

### M7: Customer Frontend (Days 11-12) ✅
- [x] Menu browsing by category
- [x] Cart (add/remove items, bottom bar)
- [x] Order submission + real-time status tracker (polls every 5s)
- **Verify:** `npx tsc --noEmit` + `npx vite build` both succeed

### M8: Polish + Integration (Days 13-14) ✅
- [x] `.gitignore` (node_modules, dist, .env)
- [x] `README.md` with full setup instructions + API table
- [x] `docker-compose.yml` for PostgreSQL
- [x] API error middleware (global error handler)
- [x] Both frontends build clean with `npx vite build`
- [x] All three packages type-check with `npx tsc --noEmit`
- **Verify:** Root dev script `npm run dev` starts all 3 apps
