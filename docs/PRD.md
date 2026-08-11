# Diary — Product Requirements Document

> A private, paper-themed web journal. "Start your thoughts into words."

## 1. Overview

Diary is a single-user (per Google account) private journaling web app. It provides a distraction-free, paper-like writing experience for long-form reflection, with rich text, photos, tags, and portable export. Data is isolated per user and accessed only through the user's own authenticated session.

**Status: built and verified.** This document describes the current as-built product.

## 2. Goals & Non-Goals

### Goals
- Fast, calm writing experience that feels like a paper journal.
- Private by default: everything behind Google OAuth, scoped to the signed-in user.
- Rich text editing (headings, lists, task lists, quotes, code, links, images, highlighting).
- Organization via tags and full-text search.
- Data portability: export individual entries or everything as JSON / Markdown.
- Works well on desktop and mobile.

### Non-Goals (explicitly out of scope)
- Social / sharing / comments.
- Real-time collaboration or multi-editor sessions.
- Offline-first / PWA support.
- Calendar, mood, or habit tracking features.
- Multi-user team workspaces.
- Encrypted at-rest storage beyond transport security (cloud storage in use).

## 3. Users & Personas

- **Primary**: an individual who journals privately on their personal devices. Uses their own Google account. Expects data to be private, searchable, and exportable.
- **Secondary**: the developer (learning project). The product doubles as a learning vehicle for the stack.

## 4. User Stories

| # | Story |
|---|---|
| U1 | As a visitor, I can sign in with Google so my journal is private and tied to my account. |
| U2 | As a first-time user, I get 3 sample entries + 4 tags so I can see how the app works. |
| U3 | As a user, I can create, edit, view, and delete my entries. |
| U4 | As a user, I can format my entries with rich text (headings, bold, italic, lists, task lists, quotes, code, highlights, alignment, links). |
| U5 | As a user, I can add photos to an entry via upload, drag-drop, or paste. |
| U6 | As a user, I can tag entries and filter by tag. |
| U7 | As a user, I can search my journal by title and content. |
| U8 | As a user, I can export a single entry or all entries as JSON or Markdown. |
| U9 | As a user, I can switch between light and dark paper themes. |
| U10 | As a user, my draft is auto-saved locally while writing a new entry. |
| U11 | As a user, I can sign out. |

## 5. Functional Requirements

### F1 — Authentication (Google OAuth)
- Server-side OAuth 2.0 Authorization Code flow with PKCE (S256).
- Consent + login at accounts.google.com, callback to `/api/auth/google/callback`.
- User upserted on first login (matched by `googleId`).
- Stateless session cookie `diary_session` (HMAC-SHA256 signed, `httpOnly`, `SameSite=Lax`, 30-day TTL).
- `GET /api/auth/me` restores the session on app load; `POST /api/auth/logout` clears it.
- First login auto-seeds sample data (idempotent: only when the user has 0 entries).
- If Google creds aren't configured, `/api/auth/google` returns `503 AUTH_NOT_CONFIGURED`; app still boots.

### F2 — Entry CRUD
- Create, read, update, delete entries. All scoped to `req.userId`.
- Fields: `title` (≤200 chars), `content` (TipTap JSON), `contentText` (plain text, derived for search), `publishedAt`, timestamps.
- Pagination: offset (`page`/`limit`, ≤50) and keyset cursor (`cursor`) modes.
- Sort: `createdAt:desc|asc`, `publishedAt:desc|asc`.

### F3 — Rich Text Editor (TipTap v3)
- StarterKit (headings 1–3, bold, italic, strike, code, code block, bullet/ordered lists, blockquote).
- Extensions: task lists (nested), highlight, text-align, link (autolink), image, placeholder, character count.
- 5000-character limit (CharacterCount).
- Toolbar with undo/redo and all formatting controls.
- Images insertable via toolbar picker, clipboard paste, or drag into editor.
- Image files upload to Cloudinary (signed), never base64 in the doc.

### F4 — Media
- Uploads via Cloudinary unsigned preset signed server-side (`/api/upload/sign` → client posts directly to Cloudinary with XHR progress → `/api/upload/confirm` persists the Media row).
- Media attached to an entry (`entryId`) or unattached (pending association).
- Delete media via `/api/upload/:publicId` (destroys Cloudinary asset + DB row).
- Optimized delivery URLs (`w_,q_auto,f_auto`), lightbox gallery with prev/next.

### F5 — Tags
- Tags are global rows (`Tag.name` unique); entries link via `EntryTag` join.
- Create-on-use via `connectOrCreate`; per-entry tag input with suggestions + keyboard navigation.
- Tag filter bar on home; counts derived from entries of the signed-in user only.

### F6 — Search
- Debounced (300ms) search across title + contentText (case-insensitive `contains`).
- Shortcut `⌘K`/`Ctrl+K` to focus; `/` also focuses search.

### F7 — Export
- Single entry or all entries → JSON (full fidelity) or Markdown (human-readable).
- Markdown uses `contentText` (plain text) + title/date/tags.
- Multi-entry Markdown export bundles as a ZIP with a `README.md`.

### F8 — Settings
- Light/dark theme toggle (persisted in localStorage, respects system preference initially).
- Export all entries (JSON / Markdown).
- Danger zone: "Delete all data" — currently a **stubbed confirmation** (shows "Bulk delete not enabled in demo"); actual bulk delete not implemented.
- About section.

### F9 — Sample Data (first-login seed)
- 3 entries: *First Entry*, *Project Ideas*, *Morning Reflection* (with rich content: heading, bullet list, blockquote).
- 4 tags: `personal`, `work`, `ideas`, `gratitude` with distinct colors.
- Idempotent — skipped when the user already has ≥1 entry.

## 6. Non-Functional Requirements

### Security
- Google OAuth with PKCE; `state` + short-lived signed cookie guards the callback against CSRF.
- Session cookie `httpOnly` + `SameSite=Lax` (XSS/CSRF resistant); `secure` in production.
- Per-user data isolation enforced server-side (every query filtered by `userId`).
- Zod validation on all request bodies/queries; error codes via `AppError`/`ValidationError`.
- Rate limiting: 100 req/min/IP (in-memory).

### Performance
- Keyset (cursor) pagination avoids offset drift on large journals.
- Cloudinary `f_auto,q_auto` delivers optimized images; thumbnails (300/400px) in grids.
- Infinite scroll with `IntersectionObserver` (200px rootMargin) on the entry list.

### Accessibility
- Buttons have `aria-label`/`title`; focus styles visible.
- Touch targets ≥44px (`.touch-target` utility).
- Semantic HTML (`article`, `header`, `time`), `role=dialog` modals, focus outline on editor.

### Responsive
- Desktop: 2-column card grid on `sm+`; sticky header + toolbar.
- Mobile: single column, floating action button (FAB) for new entry.

## 7. Data Model

| Model | Key fields | Notes |
|---|---|---|
| `User` | `id`, `email` (unique), `googleId` (unique, nullable), `name?`, `avatarUrl?` | `users` |
| `Entry` | `id`, `title`, `content` (TipTap JSON), `contentText`, `createdAt`, `updatedAt`, `publishedAt?`, `userId` | `entries`; indexes on `(userId, createdAt)` and `(userId, publishedAt)`; cascade delete |
| `Tag` | `id`, `name` (unique), `color?` | `tags` |
| `EntryTag` | `entryId`, `tagId` | `entry_tags`; composite PK; cascade |
| `Media` | `id`, `entryId?`, `url`, `mimeType`, `size`, `width?`, `height?`, `cloudinaryId` (unique) | `media`; cascade |

## 8. API Surface

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | — | Health + DB connectivity |
| GET | `/api/auth/google` | — | Redirect to Google (PKCE) |
| GET | `/api/auth/google/callback` | — | Exchange code → upsert user → seed → set cookie → redirect |
| GET | `/api/auth/me` | optional | Current user / 401 |
| POST | `/api/auth/logout` | required | Clear session cookie |
| GET | `/api/entries` | required | List w/ q, tag, page/limit/cursor, sort |
| POST | `/api/entries` | required | Create entry |
| GET | `/api/entries/:id` | required | Get one |
| PATCH | `/api/entries/:id` | required | Update |
| DELETE | `/api/entries/:id` | required | Delete |
| GET | `/api/tags` | required | Tags with counts (scoped to user) |
| POST | `/api/tags` | required | Create/upsert tag |
| GET | `/api/upload/sign` | — | Signed Cloudinary upload params |
| POST | `/api/upload/confirm` | — | Persist Media row |
| DELETE | `/api/upload/:publicId` | — | Destroy Cloudinary asset + DB row |

## 9. Tech Stack

| Layer | Choice |
|---|---|
| Monorepo | npm workspaces (`client`, `server`) + `concurrently` dev script |
| Client | React 19, TypeScript, Vite 8, Tailwind CSS v4, Zustand, TipTap 3, react-router-dom 7, axios, framer-motion, date-fns, JSZip + file-saver, lucide-react, react-hot-toast, TanStack react-virtual |
| Server | Express 5, TypeScript (NodeNext, `tsx` dev), Prisma 7 (driver adapter), PostgreSQL on Neon, Cloudinary, google-auth-library, cookie-parser, zod |
| Auth | Server-side Google OAuth + PKCE, stateless HMAC session cookie |
| Infra | Neon (Postgres), Cloudinary (image CDN), Google Fonts |

## 10. Success Metrics / Acceptance

- First-time user lands on Login → signs in with Google → sees 3 sample entries + 4 tags.
- Can create an entry with rich formatting + an image, tag it, find it by search, and export it.
- Refreshing keeps the session; signing out returns to Login.
- All protected endpoints reject unauthenticated requests with `401`.
