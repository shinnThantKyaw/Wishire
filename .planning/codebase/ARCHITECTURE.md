# Architecture

**Analysis Date:** 2026-06-20

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Vite + React)                 │
│                                                         │
│  /create ──→ CreatePage ──→ POST /api/upload (photos)   │
│              CreatePage ──→ POST /api/wish (create)      │
│                                                         │
│  /wish/:id ─→ WishPage ──→ GET /api/wish/:id            │
│              └→ ExperienceOrchestrator                   │
│                  ├→ GiftBox (tap to open)                │
│                  ├→ SentenceRevealer (tap per sentence)  │
│                  ├→ ConfettiFinale (auto on last)        │
│                  ├→ PhotoGallery                         │
│                  ├→ FlairChips (zodiac/birthstone)       │
│                  ├→ ReactionBar (emoji + heart)          │
│                  ├→ ShareButton (clipboard)              │
│                  └→ Replay button                        │
└──────────────────────┬──────────────────────────────────┘
                       │ /api proxy (Vite dev)
                       ▼
┌─────────────────────────────────────────────────────────┐
│                SERVER (Express + Prisma)                 │
│                                                         │
│  POST /api/wish         → wishService.createWish()      │
│  GET  /api/wish/:id     → wishService.getWish()         │
│  POST /api/wish/:id/react → wishService.addReaction()   │
│  GET  /api/wish/:id/stats → wishService.getWishStats()  │
│  POST /api/upload       → multer → magic-byte → sharp   │
│  GET  /api/uploads/:fn  → UUID-validate → sendFile      │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ lib/flair.js │  │ lib/prisma.js│  │ middleware/     │  │
│  │ zodiac/stone │  │ SQLite WAL   │  │ upload.js      │  │
│  │ /flower      │  │ singleton    │  │ multer+uuid    │  │
│  └─────────────┘  └──────┬───────┘  └────────────────┘  │
│                          │                               │
│                    ┌─────┴─────┐                         │
│                    │  SQLite   │                         │
│                    │ wishes.db │                         │
│                    └───────────┘                         │
└─────────────────────────────────────────────────────────┘
```

## Request Flow

### Create Wish Flow
1. User fills form in `CreatePage` (sender name, recipient name, relationship, month, day, message, theme)
2. Optionally selects up to 5 photos (client-side validation: count + type)
3. Submits → `POST /api/upload` with FormData (photos)
   - multer saves to `server/uploads/` with UUID filenames
   - `file-type` validates magic bytes (rejects non-images)
   - `sharp` generates 300px thumbnail (`_thumb` suffix)
   - Returns `[{ originalName, filename, thumbnailFilename }]`
4. `POST /api/wish` with JSON body + photo metadata
   - `wishService.createWish()` validates fields, splits message into sentences (max 6)
   - Creates Wish + Photo records in SQLite via Prisma
   - Returns wish object with `flair` (zodiac, birthstone, birthstoneColor, birthflower)
5. CreatePage shows success screen with shareable link + copy/open buttons

### Experience Flow (Birthday Person)
1. `GET /wish/:id` → WishPage fetches wish data
2. WishPage applies theme CSS custom properties (overriding `:root` vars)
3. WishPage merges `birthstoneColor` as `--birthstone` CSS var
4. `ExperienceOrchestrator` manages a 5-phase state machine:
   - **SENDER_INTRO**: "A birthday wish from {sender}" (auto-advances after 2.5s)
   - **GIFT_BOX**: Animated gift box, tap to open → unlocks AudioContext (Pitfall 8)
   - **SENTENCE**: Each tap reveals next sentence, progress dots show position
   - **CONFETTI**: "Happy Birthday!" + confetti explosion + flair chips (auto-advances)
   - **GALLERY**: Photo gallery + flair chips + reaction bar + share button + replay
5. Background music plays via Howler.js (graceful fallback if missing)
6. `prefers-reduced-motion` detected → skips confetti, uses instant variants

### Reaction Flow
1. User taps emoji or heart in `ReactionBar`
2. `POST /api/wish/:id/reactions` with `{ emoji, count }`
3. Prisma upsert with atomic increment (supports multi-tap hearts)
4. Reaction count updated in-place

## Component Architecture

### State Machine: ExperienceOrchestrator
The core orchestrator uses a finite state machine with 5 phases. Each phase renders a different component via `AnimatePresence`. Key design:

- **Module-level motion variants** (Rule 3): All Framer Motion variants defined at module scope, not inside render
- **Instant variants for reduced motion**: Zero-duration opacity-only transitions
- **Play count keying**: Components keyed by `playCount` so replay resets animations cleanly
- **Music lifecycle**: Howler created on mount (eager), played on gift box open (user gesture), seek(0) on replay

### Component Hierarchy
```
App
├── CreatePage (form state, photo upload, wish creation)
│   └── (no children — self-contained form)
└── WishPage (fetch wish, apply theme)
    └── ExperienceOrchestrator (state machine, music)
        ├── GiftBox (CSS animation, tap handler)
        ├── SentenceRevealer (Framer Motion, tap-to-reveal)
        ├── ConfettiFinale (canvas-based confetti)
        ├── PhotoGallery (image grid)
        ├── FlairChips (zodiac/birthstone/flower badges)
        ├── ReactionBar (emoji buttons, heart, POST to API)
        └── ShareButton (clipboard API)
```

## State Management

**No global state.** Each page manages its own state via `useState`:

- **CreatePage**: form fields, photos array, loading/error/progress states, createdWish result
- **WishPage**: wish data, loading, error
- **ExperienceOrchestrator**: phase (enum), sentenceIndex, playCount, showConfetti, musicRef

State flows down via props. No Context, no Redux, no Zustand. The app is simple enough that prop drilling through 2-3 levels is sufficient.

## Data Model

```
Wish (id: nanoid(8))
├── senderName, recipientName, relationship
├── birthMonth, birthDay
├── message (original text)
├── sentences (JSON array, max 6)
├── theme (sunrise|ocean|lavender|forest|midnight)
├── createdAt
│
├──→ Photo[] (wishId FK, cascade delete)
│    ├── originalName, filename (UUID), thumbnailFilename
│    └── createdAt
│
├──→ Reaction[] (wishId FK, cascade delete)
│    ├── emoji, count (atomic increment)
│    └── @@unique([wishId, emoji])
│
└──→ Stat[] (wishId FK, cascade delete)
     └── openedAt (one row per page visit)
```

**ID strategy**: `nanoid(8)` — 8-char URL-safe string. Short enough for URLs, collision-resistant at small scale.

**Sentences**: Stored as JSON string in SQLite. Parsed on read. Source message split on sentence boundaries (`.!?`), capped at 6.

## Key Patterns

### Flair Lookup
`server/lib/flair.js` is shared between the Express API and the MCP server. Pure functions, no side effects. Returns zodiac sign, birthstone, birthstone hex color, and birth flower based on month/day.

### Photo Upload Security (Pitfall 3)
Three-layer defense:
1. **Multer filter**: MIME type check on upload (`image/jpeg`, `image/png`, `image/webp`, `image/gif`)
2. **Magic-byte validation**: `file-type` library reads actual file bytes (rejects renamed non-images)
3. **UUID filenames**: `crypto.randomUUID()` prevents path traversal via crafted filenames
4. **Serve-side validation**: UUID regex + path traversal check + resolved-path containment

### Theme System
Themes override CSS custom properties on `document.documentElement.style`. Five themes defined as maps in WishPage. On unmount, properties reset to sunrise defaults. `birthstoneColor` from flair data merged as `--birthstone`.

### SPA Routing (Pitfall 5)
Express serves `client/dist` static files with a catch-all `*` route returning `index.html`. This ensures `/wish/:id` routes work on refresh when served from the Express production server.

### Audio Strategy (Pitfall 8)
Howler.js with `html5: true` for streaming. Created eagerly on mount but `play()` deferred to gift box tap (user gesture required for AudioContext). Graceful fallback: if audio file missing or load fails, `musicRef` set to null and experience continues silently.

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| No AI for wishes | Authentic, personal, zero API cost |
| SQLite + Prisma | Zero-config, file-based, structured queries |
| nanoid(8) for wish IDs | Short, URL-safe, sufficient entropy for small scale |
| Sentences as JSON string | SQLite has no array type; parse on read is cheap |
| Module-level motion variants | Avoids re-creation on every render (Rule 3) |
| State machine for experience | Clear phase transitions, easy to extend |
| CSS custom properties for theming | No JS theme library needed, cascade handles inheritance |
| Multer + magic-byte + UUID | Defense in depth for photo uploads |
| Howler over native Audio | Cross-browser consistency, graceful degradation |

---

*Architecture analysis: 2026-06-20*
