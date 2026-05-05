# AppPage — App Distribution Platform

Uma plataforma multi-tenant onde cada usuário cria sua própria landing page para distribuir um app móvel, com galeria interna privada.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run API server
- `pnpm --filter @workspace/web run dev` — run web frontend
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm run typecheck` — full typecheck across all packages

Required env vars: `DATABASE_URL`, `SESSION_SECRET`, `DEFAULT_OBJECT_STORAGE_BUCKET_ID`, `PUBLIC_OBJECT_SEARCH_PATHS`, `PRIVATE_OBJECT_DIR`

## Stack

- **Monorepo**: pnpm workspaces
- **Node.js**: 24, **TypeScript**: 5.9
- **Frontend**: React 19 + Vite + Tailwind CSS + shadcn/ui + Wouter routing
- **Backend**: Express 5 + Pino logging + bcryptjs
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod v4 + drizzle-zod
- **API codegen**: Orval (from OpenAPI spec)
- **File storage**: Replit Object Storage (GCS-backed)
- **Auth**: Session-based (express-session) with email/password + bcrypt

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/db/src/schema/users.ts` — Users table
- `lib/db/src/schema/landing.ts` — Landing pages table (per user)
- `lib/db/src/schema/gallery.ts` — Galleries table (per user)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/web/src/pages/` — React page components
- `artifacts/web/src/lib/templates.ts` — 4 visual templates (vivid/dark/nature/sunset)
- `lib/api-client-react/src/generated/` — Generated React Query hooks (do not edit)
- `lib/api-zod/src/generated/` — Generated Zod schemas (do not edit)

## Architecture decisions

- Multi-tenant: each user owns their own landing page + gallery at `/p/{username}`
- Passwords hashed with bcrypt (12 rounds); sessions via express-session
- Content stored as JSONB in PostgreSQL (photos array, social links array, gallery items array)
- 4 visual templates per landing page: vivid (purple), dark (zinc), nature (green), sunset (orange)
- File uploads use presigned GCS URLs: client uploads directly to GCS, stores objectPath in DB
- Gallery is completely isolated from landing page — no links between them

## Product

- `/` — Platform home page with sign up / login CTAs
- `/register` — Create account (name, email, username, password)
- `/login` — Login with email + password
- `/dashboard` — User dashboard with links to both editors
- `/dashboard/landing` — Full landing page editor (template, content, uploads)
- `/dashboard/gallery` — Gallery editor (upload photos/videos)
- `/p/{username}` — Public landing page (themed, shareable)
- `/p/{username}/gallery` — Private gallery (to embed in the app)

## User preferences

- Language: Portuguese (Brazilian)
- Two completely separate public pages — no links between landing and gallery
- Multi-tenant: each account is independent

## Gotchas

- After OpenAPI spec changes, always run codegen then manually fix `lib/api-zod/src/index.ts` to remove the `export * from "./generated/types"` line (orval re-adds it, causing TS2308)
- `lib/db/src/schema/index.ts` must export users, landing, gallery
- The `object-storage-web` lib must be composite — see `tsconfig.json` references
