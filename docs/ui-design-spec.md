# Diary — UI Design Specification

> Design language: **"digital paper"** — a calm, tactile journaling surface. Warm paper backgrounds, a subtle paper-grain texture, serif display typography, and a terracotta accent.

## 1. Design Tokens

All colors are defined as RGB triplets consumed via `rgb(var(--token))` so the same token set powers light and dark themes.

### Color Palette

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--paper` | `255 254 252` (warm white) | `24 22 26` (near-black) | Page background |
| `--paper-card` | `252 251 246` | `31 29 35` | Cards, inputs, toolbar |
| `--paper-line` | `233 230 218` | `48 45 54` | Borders, dividers, rules |
| `--ink` | `42 37 33` | `240 239 244` | Primary text |
| `--ink-soft` | `89 84 79` | `190 187 198` | Secondary text |
| `--ink-faint` | `148 142 134` | `130 127 138` | Muted text, placeholders |
| `--accent` | `196 120 94` (terracotta) | `212 152 120` | Primary action, active states, brand star |
| `--accent-soft` | `242 229 220` | `66 50 42` | Tag chips, soft accents |
| `--success` | `94 196 120` | `110 210 140` | Success |
| `--danger` | `220 90 90` | `235 120 120` | Destructive actions |

### Typography (Google Fonts)

| Role | Family | Notes |
|---|---|---|
| Body/UI | **DM Sans** | Default `font-sans` |
| Display/headings | **DM Serif Display** | `.font-serif-display`; brand titles, headings |
| Code | **JetBrains Mono** | `font-mono` |

Headings (`h1–h3`) globally use the serif display family.

### Texture & Effects
- **Paper grain**: `paper-texture` utility — inline SVG `feTurbulence` noise at 3–5% opacity, overlay on page background.
- **Ruled paper**: `ruled-paper` utility — repeating 30px rule lines (`--paper-line`) for a notebook feel.
- **Radius**: `rounded-2xl` cards, `rounded-full` pills/buttons; editor `rounded-t-2xl` toolbar + `rounded-b-2xl` canvas.
- **Shadows**: soft `shadow-sm` cards, `shadow-md` on hover, `shadow-xl` modals/login card.
- **Motion**: `transition-transform hover:scale-105` on primary CTAs; framer-motion entry-card entrance (opacity + 12px rise, 0.2s) and `layout` animation.

### Touch & Interaction
- `.touch-target` utility guarantees ≥44px tap targets on icon buttons and chips.
- Buttons: active state `bg-[--accent] text-white`; idle state bordered with `--paper-line` + soft ink.

## 2. Layout & Page Structure

App shell (when authed):
```
[ Header (sticky, blurred)            ]
[ main → <PageTransition> → <Routes>  ]
[ MobileFab (new entry, < sm)          ]
```
Shell background: `paper-texture` on `--paper`; `flex min-h-screen flex-col`.

### 2.1 Login (`/` unauthenticated)
- Full-screen centered card: `max-w-sm`, `rounded-3xl`, `--paper-card` bg, `shadow-xl`.
- Brand mark: `✦` in accent serif, app name **Diary**, tagline "Your private space to write, reflect, and remember."
- Primary CTA: full-width pill **Sign in with Google** (accent bg, white text, inline Google "G" glyph).
- Inline error banner on `?auth=error`: accent-soft rounded box.
- Caption: "Your entries stay private to your Google account."

### 2.2 Home — Entry List (`/`)
- Content column `max-w-3xl mx-auto px-4 py-8`.
- **Row 1**: SearchBar (flex-1) + circular `+` new-entry button (accent, `size-10`).
- **Row 2**: TagFilter pill row (All + user's tags, colored dots).
- **List**: desktop `sm:grid-cols-2 gap-4`; mobile single column. Cards animate in (framer-motion).
- **Loading**: `EntryCardSkeleton` shimmer blocks (3 on first load, 2 while appending).
- **Infinite scroll**: invisible sentinel div triggers next page (`IntersectionObserver`, 200px margin).
- **Empty state**: centered `PenLine` in accent-soft circle; "Your blank page awaits" + **Start writing** CTA (or "No entries found" when searching).

### 2.3 Entry View (`/entry/:id`)
- Header row: **Back to journal** link (left) + actions (right): `Edit` pill button, `⋮` kebab menu.
- Kebab menu (absolute dropdown, `rounded-xl shadow-lg`): Export JSON, Export Markdown, Delete (red, top border).
- Title block: `font-serif-display text-4xl`; date `MMMM d, yyyy · h:mm a` + "· updated X ago" (date-fns).
- Tag chips row under title.
- Divider (`--paper-line`).
- **Content**: rendered HTML via `@tiptap/html`, `.prose prose-lg max-w-none`, headings forced to serif display.
- **Photos**: "Photos" heading + responsive grid (`grid-cols-2 sm:grid-cols-3`), 1:1 square thumbnails, hover scale.
- **Lightbox**: fullscreen `bg-black/80`; image centered `max-h-full object-contain`; close `✕`; prev/next arrows.

### 2.4 Editor (`/new`, `/edit/:id`)
- Header row: **Back** (left) + (right) "Unsaved changes" hint + **Save entry / Save changes** accent pill (with spinner while saving).
- Title input: `font-serif-display text-4xl`, transparent bg, no border, placeholder "Entry title…", maxLength 200.
- TagInput: pill field (accent-soft chips with remove `✕`), autocomplete dropdown (colored dots, counts, `✓`), "Create tag" affordance, keyboard nav (Enter / ↑ / ↓ / Backspace).
- **Toolbar**: sticky below header (`top-16`), `rounded-t-2xl`, wraps. Groups (divider between):
  Undo/Redo | H1 H2 H3 | B I S Highlight Code | Lists (bullet/numbered/task) Quote CodeBlock | Align (L/C/R) | Link Image
  Active buttons: accent bg + white icon. Tooltips via `title` + `aria-label`.
- **Canvas**: `min-h-[50vh]`, `.prose prose-lg`, placeholder "Start writing your thoughts…", 5000-char limit.
- **MediaUploader**: thumbnail grid (3 cols mobile / 4 sm) with hover remove `✕`; upload progress rows (spinner, name, progress bar, %); dashed dropzone "Drag & drop images, or click to browse" + "You can also paste images directly into the editor".
- Draft auto-saved to localStorage every 30s (new entries only); `beforeunload` guard when dirty.

### 2.5 Settings (`/settings`)
- `max-w-2xl`; header with back chevron + **Settings** serif title.
- **Appearance** card: theme toggle row (Sun/Moon icon + "Light paper"/"Dark paper") with a pill switch.
- **Export** card: explanation + two pill buttons (**Export as JSON** accent / **Export as Markdown** bordered).
- **Danger zone** card: red-tinted bg, AlertTriangle, "Delete all data" red pill → 3-step ConfirmModal. *(Bulk delete currently a stub.)*
- **About** card: app name + version, tech list, one-liner.

### 2.6 Header (global, authed)
- Sticky, `z-40`, `bg-[--paper]/90 backdrop-blur-sm`, bottom border `--paper-line`, `max-w-6xl`.
- Left: brand `✦` (accent serif) + **Diary** serif wordmark.
- Right: avatar (Google photo or initial in accent-soft circle) + name (hidden < `md`), then round icon buttons: Settings gear, Sign out, Theme toggle (Sun/Moon).

## 3. Shared Components

| Component | Spec |
|---|---|
| `Header` | Sticky app bar above |
| `MobileFab` | Fixed `bottom-6 right-6`, `size-14` accent circle, `+`, `sm:hidden`, hidden on `/new` `/edit` |
| `EntryCard` | `rounded-2xl` card: date (`MMM d, yyyy · h:mm a`) + hover `✦`; serif title; 160-char excerpt; tag chips. Hover: lift 2px + shadow |
| `TagChip` | Pill: colored dot (tag color / `#c4785e` fallback) + name; active = accent bg, else accent-soft |
| `TagFilter` | Pill row: **All** + tag buttons; active accent, idle bordered |
| `SearchBar` | Rounded input, leading search icon, trailing clear `✕`; placeholder "Search your journal… ⌘K"; `⌘K`/`Ctrl+K` focuses |
| `ConfirmModal` | Fullscreen `bg-black/50`; `max-w-sm` card; serif title, message, Cancel + destructive confirm |
| `EmptyState` | Centered, icon circle, serif heading, body, CTA |
| `Skeleton` | `EntryCardSkeleton` shimmer blocks for loading |
| `PageTransition` | Wraps `<Routes>`; smooth page transitions (framer-motion) |
| `Toaster` | react-hot-toast, bottom/top toasts for success/error/loading |
| `ErrorBoundary` | Top-level crash fallback |
| `MediaGallery` | Grid + lightbox (above) |
| `MediaUploader` | Dropzone + previews + progress (above) |
| `TagInput` | Tag chips + autocomplete + create (above) |

## 4. Responsive Breakpoints

| Breakpoint | Behavior |
|---|---|
| `< sm` | Single-column list; FAB for new entry; kebab actions; toolbar wraps |
| `sm+` | 2-col entry grid; header shows name/avatar; toolbar still wraps |
| `md+` | Header shows avatar + name; editor toolbar sticky works with `top-16` |

## 5. Motion & Micro-interactions
- Entry cards: fade + rise on mount, `layout` reflow when filtering.
- Primary CTAs (`+`, Save, Google): `hover:scale-105` / `active:scale-95`.
- Theme switch: 0.3s background/color transition on `html`.
- Gallery thumbnails: `group-hover:scale-105` 0.3s.
- Kebab/dropdowns: instant open, `shadow-lg`, bordered.
- Loaders: `Loader2` spin icons; skeleton shimmer; upload progress bars.
- Page transitions via `PageTransition` wrapper (framer-motion).

## 6. Accessibility Notes
- Icon-only buttons carry `aria-label` (+`title` tooltips).
- Modals: `role="dialog"` + `aria-modal`, click-outside closes, `stopPropagation` on panel.
- Focus: visible focus outline on editor and inputs; no `outline-none` without replacement.
- Color: contrast handled by token palette; accent used for both branding and active states.
- Keyboard: `⌘K`/`Ctrl+K` search focus, `/` search focus, `n` new entry, full tag-input keyboard nav.

## 7. File Map (UI)

```
client/src/
├─ App.tsx, main.tsx, index.css, App.css
├─ context/ AuthContext.tsx · ThemeContext.tsx
├─ pages/ Login.tsx · Home.tsx · EntryView.tsx · EntryEdit.tsx · Settings.tsx
├─ components/
│  ├─ layout/ Header.tsx · MobileFab.tsx
│  ├─ entries/ EntryCard.tsx · EmptyState.tsx
│  ├─ tags/ TagChip.tsx · TagFilter.tsx · TagInput.tsx
│  ├─ media/ MediaUploader.tsx · MediaGallery.tsx
│  ├─ search/ SearchBar.tsx
│  ├─ editor/ Editor.tsx · Toolbar.tsx
│  └─ ui/ ConfirmModal.tsx · ErrorBoundary.tsx · PageTransition.tsx · Skeleton.tsx · Toaster.tsx
├─ stores/ useEntries.ts · useTags.ts
├─ hooks/ useDebounce.ts · useInfiniteScroll.ts · useKeyboardShortcuts.ts
├─ lib/ api.ts · export.ts · tipTap.ts · upload.ts
├─ styles/ editor.css
└─ types/ index.ts
```
