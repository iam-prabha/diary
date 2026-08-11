# Diary — Project Tracker

Single source of truth for project status, setup, commands, decisions, and known issues. Last updated: **2026-08-10**.

## 1. Snapshot

| | |
|---|---|
| **What** | Private, paper-themed web journal ("start your thought into words") |
| **Monorepo** | npm workspaces — `client` (React SPA) + `server` (Express API) |
| **DB** | PostgreSQL on Neon (Prisma 7, driver adapter) |
| **Image hosting** | Cloudinary (signed uploads) |
| **Auth** | Google OAuth (server-side redirect + PKCE), stateless HMAC session cookie |
| **Status** | Core features built; auth migrated from demo user → real Google OAuth; all verified except live browser consent step |

### Stack detail
- **Client**: React 19 · Vite 8 · TypeScript · Tailwind CSS v4 · Zustand · TipTap 3 · react-router-dom 7 · axios · framer-motion · date-fns · JSZip/file-saver · lucide-react · react-hot-toast · @tanstack/react-virtual
- **Server**: Express 5 · TypeScript (NodeNext, `tsx`) · Prisma 7 + `@prisma/adapter-pg` · google-auth-library · cookie-parser · zod · cloudinary
- **Tooling**: eslint · oxlint · vitest (server) · concurrently

## 2. Directory Map

```
diary/
├─ package.json          # workspaces: client, server; dev/build/lint/db scripts
├─ tsconfig.base.json
├─ client/
│  ├─ vite.config.ts     # port 5173, /api proxy → :3001
│  ├─ .env               # VITE_API_URL=http://localhost:3001/api
│  └─ src/               # pages/, components/, stores/, hooks/, lib/, context/, styles/, types/
├─ server/
│  ├─ .env               # DB, Cloudinary, Google creds, SESSION_SECRET, CORS, PORT
│  ├─ .env.example       # template (needs Google/SESSION vars appended)
│  ├─ prisma/
│  │  ├─ schema.prisma   # User, Entry, Tag, EntryTag, Media
│  │  ├─ migrations/     # init + add_google_auth
│  │  └─ seed.ts         # self-contained sample-data seeder
│  └─ src/
│     ├─ index.ts        # express app, CORS, cookieParser, rate limit, routers
│     ├─ routes/         # health, auth, entries, tags, upload
│     ├─ middleware/     # auth (requireAuth), validate, rateLimit, errorHandler
│     ├─ schemas/        # zod: entries, tags, upload
│     ├─ lib/            # env, prisma, session, auth (Google), cloudinary, seedSample, errors
│     └─ utils/          # asyncHandler, cast, entryHelpers
└─ docs/                 # PRD.md · ui-design-spec.md · track.md (this file)
```

## 3. Commands

Run from repo root (npm workspaces) or inside `client`/`server`.

```bash
# Dev (both apps)
npm run dev                 # concurrently: vite :5173 + tsx :3001

# Server only
cd server && npm run dev

# Client only
cd client && npm run dev

# Build + typecheck + lint (all workspaces)
npm run build               # server tsc -b, client tsc -b && vite build
npm run typecheck
npm run lint

# Database
cd server
npm run db:push             # prisma db push (dev)
npm run db:migrate          # prisma migrate dev (interactive — needs TTY)
npm run db:seed             # tsx prisma/seed.ts
npm run db:studio           # prisma studio
```

## 4. Environment Variables

### `server/.env` (required: first four; Google + SESSION optional-but-recommended)
| Variable | Notes |
|---|---|
| `DATABASE_URL` | Neon Postgres, `sslmode=require` |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | Cloudinary creds |
| `CORS_ORIGIN` | `http://localhost:5173` |
| `PORT` | `3001` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth web client |
| `GOOGLE_REDIRECT_URI` | `http://localhost:3001/api/auth/google/callback` |
| `SESSION_SECRET` | HMAC key for session cookie (generate: `openssl rand -hex 32`) |
| `CLIENT_URL` | `http://localhost:5173` (post-login redirect) |

If Google creds are missing the server still boots; `/api/auth/google` returns `503 AUTH_NOT_CONFIGURED`.

### `client/.env`
| Variable | Notes |
|---|---|
| `VITE_API_URL` | `http://localhost:3001/api` (dev; `/api` proxy also works) |

## 5. External Service Setup

### Google Cloud Console
1. console.cloud.google.com → create project (e.g. `diary`).
2. APIs & Services → **OAuth consent screen** → External → fill app name + support email.
3. Credentials → **Create credentials → OAuth client ID** → Web application.
4. Add **Authorized redirect URI**: `http://localhost:3001/api/auth/google/callback`.
5. Copy Client ID + Secret into `server/.env`.

### Cloudinary
- Free account; copy cloud name / API key / secret into `server/.env`.
- Unsigned upload preset (default `diary_unsigned`) used with server-side signatures (`/api/upload/sign`).
- Media delivered via `f_auto,q_auto,w_` optimized URLs; stored in folder `diary`.

### Neon
- Create project; copy pooled `DATABASE_URL` (with `sslmode=require`) into `server/.env`.

## 6. Feature Status

| Feature | Status | Notes |
|---|---|---|
| Google OAuth sign-in (PKCE) | ✅ Verified | Redirect 302, PKCE S256, upsert, cookie, logout all curl-verified |
| Session cookie (HMAC, httpOnly, 30d) | ✅ Verified | `diary_session`; stateless |
| First-login sample data | ✅ Verified | 3 entries + 4 tags, idempotent |
| Per-user data isolation | ✅ Verified | All entry/tag queries scoped to `req.userId`; unauthed = 401 |
| Entry CRUD + search + tag filter | ✅ Verified | API + store |
| Cursor & offset pagination | ✅ Verified | `cursor` / `page`,`limit` |
| Rich text editor (TipTap 3) | ✅ Built | H1–3, lists, tasks, quote, code, align, link, highlight, image, 5k chars |
| Image upload (Cloudinary signed) | ✅ Built | uploader/gallery/lightbox; sign+confirm tested previously |
| Export (JSON/Markdown, single/all) | ✅ Built | MD multi = ZIP |
| Tags (create-on-use, filter, autocomplete) | ✅ Built | |
| Theme light/dark | ✅ Built | localStorage + system default |
| Draft autosave (new entries) | ✅ Built | localStorage, 30s interval |
| Keyboard shortcuts | ✅ Built | `⌘K` search, `n` new, `/` search |
| Infinite scroll | ✅ Built | IntersectionObserver |
| Rate limiting | ✅ Built | 100 req/min/IP in-memory |
| Bulk "delete all data" | ⚠️ Stub | ConfirmModal flow shows "not enabled in demo" |
| Docker deploy | ❌ Not started | Older plan item |
| Root README | ❌ Not started | `docs/` is the reference today |

## 7. What Has Been Verified (recent run)

- `/api/health` → `200` "database: connected".
- Unauthenticated `/api/auth/me`, `/api/entries`, `/api/tags` → `401`.
- `/api/auth/google` → `302` to accounts.google.com with `code_challenge_method=S256` + `state` (real creds).
- Simulated callback: upsert user → sign session → `/api/auth/me` 200 → list entries → create entry with tags → delete.
- Seed-on-first-login: 0-entry user gets 3 entries + 4 tags; second run doesn't duplicate.
- Logout: `204` + cleared cookie (`Expires: 1970`).
- `tsc -b`, eslint, oxlint, and full `npm run build` all pass.

## 8. Decisions & Gotchas

- **Prisma 7** needs `prisma.config.ts`, `prisma-client` generator with `output = ../src/generated/prisma`, and `PrismaPg` driver adapter.
- **`prisma migrate dev` is TTY-only** — non-interactive env writes migration SQL by hand then `prisma migrate deploy`.
- **NodeNext**: server relative imports need `.js` extension (`./lib/env.js`).
- **Express 5**: `req.query` is read-only → parsed via `validatedQuery` on the request; async routes wrapped in `asyncHandler`.
- **Solution-style server tsconfig** (`tsconfig.json` refs → `tsconfig.app.json` + `tsconfig.node.json`) fixes editor `process` type errors in `prisma.config.ts`/`seed.ts`/generated code.
- **TipTap v3** StarterKit bundles Link → `StarterKit.configure({ link: false })` in Editor.tsx + tipTap.ts to avoid duplicate-extension warnings.
- **google-auth-library v11**: PKCE via `generateCodeVerifierAsync()`; token call uses snake_case `redirect_uri` + `codeVerifier`.
- **CORS**: `credentials: true`; dev cookies flow through Vite `/api` proxy.
- **Session**: stateless HMAC (no DB table, no express-session); logout only clears cookie (token remains valid if replayed — acceptable for this app).
- **Tags are global rows**; per-user counts computed via join filter; tag colors default `#c4785e`.
- **Process launching gotcha**: background dev servers hang the bash tool on inherited pipes → always `</dev/null >/tmp/*.log 2>&1 &`, kill with `pkill -f "tsx src/index.ts"`.

## 9. Known Issues / Next Steps

1. **Browser verification** of full Google consent → callback → redirect flow (can't be done via curl). Boot `npm run dev`, sign in at `http://localhost:5173`.
2. **Bulk delete** ("Delete all data") is a stub — decide whether to implement (needs delete entries + media + tags + Cloudinary cleanup).
3. **`/api/upload/sign` + `/confirm`** re-verify end-to-end (was working before auth migration; upload routes are NOT auth-protected).
4. **Docker + README** — finish if desired (older plan).
5. **Rate limiter** is in-memory (per-instance) — fine for single-node, not for multi-instance.
6. **`TanStack react-virtual`** dependency is installed but not visibly used — confirm or remove.
7. `App.css` may hold unused legacy styles — cleanup pass.

## 10. Deployment (Vercel)

Two Vercel projects from one repo (matches the cross-origin `sameSite=none` cookie design). Client and API are different origins but same-site (`*.vercel.app`), so credentialed cookies work with zero cookie-domain tricks.

### Project A — API (`diary-api`), rootDirectory = `server`
- Build command: `npx prisma generate && npx prisma migrate deploy`
- Framework: Other (Express auto-detected via default-export in `src/index.ts`; `app.listen` gated off by `VERCEL`).
- Env: `DATABASE_URL` (Neon pooled, `sslmode=require`), `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET`, `CORS_ORIGIN=https://diary.vercel.app`, `GOOGLE_CLIENT_ID/SECRET`, `GOOGLE_REDIRECT_URI=https://diary-api.vercel.app/api/auth/google/callback`, `SESSION_SECRET`, `CLIENT_URL=https://diary.vercel.app`, `NODE_ENV=production`.
- Verify: `curl https://diary-api.vercel.app/api/health` → `200 database: connected`.

### Project B — Client (`diary`), rootDirectory = `client`
- Framework preset: Vite; Build: `npm run build`; Output dir: `dist`; SPA fallback via `client/vercel.json`.
- Env: `VITE_API_URL=https://diary-api.vercel.app/api`.
- Verify: `/`, `/diary`, `/login`, `/new` all return `index.html`; signed-in calls hit the API.

### Google OAuth
Add prod redirect URI `https://diary-api.vercel.app/api/auth/google/callback` in Google console. Swap to custom domains (`diary.example.com` / `api.diary.example.com`) later by updating `CORS_ORIGIN`, `CLIENT_URL`, `GOOGLE_REDIRECT_URI`.

### Known deploy gotchas
- `express.static()` is ignored on Vercel — client is a separate static project (never rely on API to serve it).
- Rate limiter is in-memory (per function instance) — fine single-user/small.
- `/api/upload/sign` + `/confirm` are **not auth-protected** — hardening pass later.

## 11. Changelog (recent)

- **2026-08-11**: Vercel deploy prep — `app.listen` gated on `VERCEL`, `client/vercel.json` SPA rewrite, `engines.node>=22`, deployment section added here. Fixed `fetchEntries(true)` using a stale `page` (returning to `/diary` showed EmptyState). Renamed remaining PaperJournal refs → Diary.
- **2026-08-10**: Migrated from single demo user → real Google OAuth (PKCE, signed cookie, auto-seed on first login). Schema `+googleId/avatarUrl`; migration applied; demo-user code deleted. Docs consolidated into PRD.md / ui-design-spec.md / track.md.
- **Earlier**: Monorepo scaffold → Tailwind v4 paper theme → Prisma/Neon + Cloudinary → TipTap editor → entries/tags/search/export → theme/settings.
