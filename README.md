# Star Halal Admin Backend

Feature-based Express + Prisma (MySQL) API. Current phase: **Auth + RBAC (done)**, **Categories + Products/Variants CRUD (this phase)**.

## Structure

```
src/
  controllers/<feature>/   e.g. controllers/auth/auth.controller.js
  routes/<feature>/        e.g. routes/auth/auth.routes.js
  services/<feature>/      business logic, called by controllers
  validators/<feature>/    request body validation
  middlewares/             auth, permission, rate limiting, error handler
  permissions/             permissions.json - single source of truth for RBAC + audit log keys
  utils/                   jwt, password hashing, api response shape, permission resolver, audit logger
  config/db.js             Prisma client singleton
  app.js / server.js       Express app + bootstrap
prisma/
  schema.prisma            AdminUser + AuditLog models (this phase only)
  seed.js                  creates the first "owner" admin user
```

Every future feature (products, orders, coupons...) follows the same pattern: its own
folder inside controllers/routes/services/validators, wired into `src/routes/index.js`.

## Setup

1. `cp .env.example .env` and fill in real values (DATABASE_URL, JWT_SECRET, seed admin creds).
2. `npm install`
3. `npm run prisma:migrate` - creates the `admin_users` and `audit_log` tables in MySQL.
4. `npm run seed` - creates the first owner admin from your `.env` values.
5. `npm run dev` - starts the API on `PORT` (default 4000).

## Try it

```
POST /api/admin/auth/login   { "email": "...", "password": "..." }   -> sets httpOnly cookie
GET  /api/admin/auth/me                                              -> current admin (requires cookie)
POST /api/admin/auth/logout                                          -> clears cookie

POST   /api/admin/categories
GET    /api/admin/categories                 ?includeInactive=true
GET    /api/admin/categories/:id
PUT    /api/admin/categories/:id
DELETE /api/admin/categories/:id              -> deactivates if products exist under it, else hard-deletes

POST   /api/admin/products                    { name, categoryId, variants: [{ label, price }] }
GET    /api/admin/products                    ?categoryId=1&includeInactive=true
GET    /api/admin/products/:id
PUT    /api/admin/products/:id
DELETE /api/admin/products/:id                -> soft delete (isActive=false), never hard-deleted

POST   /api/admin/products/:productId/variants           { label, price }
PUT    /api/admin/products/variants/:variantId            { label?, price?, isInStock? }
DELETE /api/admin/products/variants/:variantId
PATCH  /api/admin/products/variants/:variantId/stock       { isInStock: true|false }
```

Every write requires the corresponding permission from `permissions.json`
(`categories:create`, `products:update`, `products:toggleStock`, etc.) - `owner`
has everything, `manager` has full catalogue control, `staff` can view + toggle
stock only.

## How permissions work

`src/permissions/permissions.json` lists every permission key and which roles have them.
Protect a route like this:

```js
router.post(
  "/products",
  requireAuth,
  requirePermission("products:create"),
  createProductController
);
```

Add new permission keys to the JSON *before* using them in a route - `requirePermission`
and `auditLogger` both read from this file, so it stays the one place you update.
