# App Distribution Platform

A two-page web platform: a public landing page for distributing a mobile app, and a private internal gallery page accessible only via a link inside the app. Both pages are managed via a password-protected admin panel.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run API server
- `pnpm --filter @workspace/web run dev` — run web frontend
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm run typecheck` — full typecheck across all packages

Required env vars: `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_PASSWORD` (defaults to `admin123`), `DEFAULT_OBJECT_STORAGE_BUCKET_ID`, `PUBLIC_OBJECT_SEARCH_PATHS`, `PRIVATE_OBJECT_DIR`

## Stack

- **Monorepo**: pnpm workspaces
- **Node.js**: 24, **TypeScript**: 5.9
- **Frontend**: React 19 + Vite + Tailwind CSS + shadcn/ui + Wouter routing
- **Backend**: Express 5 + Pino logging
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod v4 + drizzle-zod
- **API codegen**: Orval (from OpenAPI spec)
- **File storage**: Replit Object Storage (GCS-backed)
- **Auth**: Session-based (express-session) with password

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/db/src/schema/landing.ts` — Landing page table
- `lib/db/src/schema/gallery.ts` — Gallery table
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/web/src/pages/` — React page components
- `lib/api-client-react/src/generated/` — Generated React Query hooks (do not edit)
- `lib/api-zod/src/generated/` — Generated Zod schemas (do not edit)

## Architecture decisions

- Two completely isolated public pages: `/` (landing) and `/gallery` — no links between them
- Content stored as JSONB in PostgreSQL (photos array, social links array, gallery items array)
- Single admin password via `ADMIN_PASSWORD` env var (default: `admin123`) — no user table
- File uploads use presigned GCS URLs: client uploads directly to GCS, stores objectPath in DB
- Session auth via express-session + SESSION_SECRET

## Product

- `/` — Public landing page: app download, tutorial video, photo gallery, social links
- `/gallery` — Private gallery: photo/video album (linked only from inside the app)
- `/admin` — Admin login (password only)
- `/admin/dashboard` — Overview with links to edit both pages
- `/admin/landing` — Full editor for landing page content + file uploads
- `/admin/gallery` — Gallery editor: upload, caption, remove items

## User preferences

- Language: Portuguese (Brazilian)
- Two completely separate pages with no links between them

## Gotchas

- After OpenAPI spec changes, always run codegen then manually fix `lib/api-zod/src/index.ts` to remove the `export * from "./generated/types"` line (orval re-adds it, causing duplicate export errors)
- `ADMIN_PASSWORD` env var controls admin access — change it before deploying
- The `object-storage-web` lib must be composite — see `tsconfig.json` references
