# BTMPage — App Distribution Platform

Plataforma multi-tenant onde cada usuário cria sua própria landing page para distribuir um app móvel, com galeria interna privada.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run API server
- `pnpm --filter @workspace/web run dev` — run web frontend
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec (then fix `lib/api-zod/src/index.ts`)
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
- `lib/db/src/schema/landing.ts` — Landing pages table (per user, with full custom color/section columns)
- `lib/db/src/schema/gallery.ts` — Galleries table (items as JSONB with title/likes/comments)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/web/src/pages/` — React page components
- `artifacts/web/src/components/LandingPageRenderer.tsx` — Shared landing page renderer (used by public page + editor preview)
- `lib/api-client-react/src/generated/` — Generated React Query hooks (do not edit)
- `lib/api-zod/src/generated/` — Generated Zod schemas (do not edit)

## Architecture decisions

- Multi-tenant: each user owns their own landing page + gallery at `/p/{username}`
- Passwords hashed with bcrypt (12 rounds); sessions via express-session
- Content stored as JSONB in PostgreSQL (photos, social links, gallery items, sections, comments)
- Split-pane live editor: left = accordion form panels, right = live `LandingPageRenderer` preview (no iframe)
- Landing page colors fully customizable (gradient, solid, image bg; CTA color, page bg, text color)
- Gallery items support: title, caption, likes (integer), comments (JSONB array) managed both in admin and by public viewers
- 6 visual presets (Vivid, Dark, Nature, Sunset, Ocean, Rose) that fill all color fields at once
- File uploads use presigned GCS URLs: client uploads directly to GCS, stores objectPath in DB
- Admin UI uses dark green theme (sidebar-primary: 142 71% 45%)

## Product

- `/` — Platform home (BTMPage branding, green CTA)
- `/register` — Create account (name, email, username, password)
- `/login` — Login with email + password
- `/dashboard` — User dashboard (green dark theme) with links to both editors
- `/dashboard/landing` — Split-pane live-preview editor (colors, gradients, bg image, logo, sections, app file, video, photos, social links)
- `/dashboard/gallery` — Gallery editor (upload photos/videos, set titles, add/delete comments, manage likes)
- `/p/{username}` — Public landing page (custom colors/gradients via inline styles)
- `/p/{username}/gallery` — Public gallery (lightbox, like button, comment form)

## User preferences

- Language: Portuguese (Brazilian)
- Brand name: BTMPage (green admin theme)
- Two completely separate public pages — no links between landing and gallery
- Multi-tenant: each account is independent

## Gotchas

- After OpenAPI spec changes, always run codegen then manually fix `lib/api-zod/src/index.ts` to contain ONLY `export * from "./generated/api";` (orval re-adds `export * from "./generated/types"`, causing TS2308)
- `lib/db/src/schema/index.ts` must export users, landing, gallery
- uuid and zod must be in `artifacts/api-server` dependencies (not just root)
- `react-icons` must be in `artifacts/web` devDependencies for social icons (SiInstagram etc.)

## Pointers

- Object storage upload flow: POST `/api/storage/uploads/request-url` → PUT to GCS signed URL → store objectPath
- Gallery public interactions: POST `/api/pages/:username/gallery/:itemId/like`, POST `/api/pages/:username/gallery/:itemId/comments`
