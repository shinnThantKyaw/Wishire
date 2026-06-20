# Birthday Wish Generator — Project Status

**Last updated:** 2026-06-20

## What Is This Project?

A web app where someone creates a personalized birthday wish, gets a shareable link, and the recipient opens it like a gift — tap a box, message reveals sentence by sentence with animations, photos appear, confetti pops, emoji reactions available.

---

## Current Stage: 5 of 6 Phases Complete — Polish Remaining

### What's Done

**Backend (server/) — fully working:**

- Express API with SQLite via Prisma ORM (WAL mode + busy_timeout)
- `POST /api/wish` — creates wish, splits message into sentences, stores theme + flair data
- `GET /api/wish/:id` — fetches wish with photos + reactions, records open stat
- `POST /api/wish/:id/reactions` — emoji reactions with atomic increment (supports delta for multi-tap)
- `GET /api/wish/:id/stats` — open count + reactions
- Photo upload with multer — UUID filenames, magic-byte validation (file-type), sharp thumbnails, path traversal protection
- Birthday flair lookup — zodiac sign, birthstone, birthstone color, birth flower based on birth month/day
- MCP server exposing `get_birthday_flair` tool (registered in `.mcp.json` as `birthday-facts`)

**Frontend (client/) — full experience working:**

- React 18 + Vite 5 + react-router-dom v7
- **CreatePage** (`/create`) — form with sender name, recipient name, relationship, birth month/day, message textarea (1000 char max), photo upload (max 5 with preview/remove), theme selector (5 themes: Sunrise, Ocean, Lavender, Forest, Midnight)
- **WishPage** (`/wish/:id`) — fetches wish data, applies theme CSS custom properties, renders full experience via ExperienceOrchestrator
- **ExperienceOrchestrator** — state machine with 5 phases: SENDER_INTRO → GIFT_BOX → SENTENCE → CONFETTI → GALLERY
- **GiftBox** — CSS gift box with glow, ribbon, bow. Framer Motion spring animations. Tap triggers open.
- **SentenceRevealer** — one sentence at a time on tap, progress dots, "tap to continue" hint
- **ConfettiFinale** — canvas-confetti with shared canvas, mobile-aware particles, `pointer-events: none`
- **PhotoGallery** — staggered entrance animations, thumbnail filenames for fast load
- **ReactionBar** — 6 emoji buttons + multi-tap heart with 800ms debounce, optimistic UI
- **FlairChips** — zodiac/birthstone/birth flower pills with birthstone color
- **BackgroundMusic** — Howler.js wrapper with eager init, deferred play, graceful fallback
- **useReducedMotion** hook — respects `prefers-reduced-motion` (skips confetti, instant variants, shorter delays)
- CSS with custom properties (cream/coral/gold/mint theme), Google Fonts (Nunito + Baloo 2), BEM naming

**Database (Prisma + SQLite):**

```
Wish (id, senderName, recipientName, relationship, birthMonth, birthDay, message, sentences, theme, createdAt)
  ├── Photo[] (originalName, filename, thumbnailFilename)
  ├── Reaction[] (emoji, count) — unique per wish+emoji
  └── Stat[] (openedAt) — tracks when wish was opened
```

### What's NOT Done (Phase 6 — Polish)

- Loading skeletons for async content
- Error boundaries (React error boundary component)
- Responsive breakpoints (375px, 768px, 1024px, 1440px)
- Mobile layout optimization
- Share link copy button
- Production build end-to-end testing
- Replace silent placeholder `ambient.mp3` with a real royalty-free track
- Fill in `slides/pitch.md` and `report.md` for assignment submission
- No tests exist (Vitest recommended in `.planning/codebase/TESTING.md`)

---

## Phase Breakdown

| Phase | Name | Status | Notes |
|-------|------|--------|-------|
| 1 | Data Foundation | ✅ Complete | Prisma schema, CRUD API, photo upload, MCP tool, SPA catch-all |
| 2 | Creator Flow | ✅ Complete | CreatePage form, routing, themes, Google Fonts |
| 3 | Core Experience | ✅ Complete | ExperienceOrchestrator, GiftBox, SentenceRevealer, ConfettiFinale |
| 4 | Delight Layer | ✅ Complete | PhotoGallery, BackgroundMusic, FlairChips, theme-flair merge, reduced-motion |
| 5 | Reactions + Tracking | ✅ Complete | ReactionBar with debounced heart, optimistic UI, backend atomic increments |
| 6 | Polish | ⬜ Not started | Responsive, a11y, loading states, error boundaries, share button |

---

## How It Works End-to-End

1. User visits `/create` → fills form → selects theme → optionally uploads photos
2. Frontend sends photos to `POST /api/photos/upload` (multer saves with UUID names, generates thumbnails)
3. Frontend sends wish data + photo refs to `POST /api/wish`
4. Backend splits message into sentences, stores wish + photos in SQLite, returns wish with ID + flair
5. Frontend navigates to `/wish/:id`
6. Recipient opens link → sees "from {sender}" intro → gift box appears
7. Taps gift box → box opens with spring animation → sentences reveal one by one
8. After last sentence → confetti burst → photos appear with stagger animation
9. Flair chips show zodiac/birthstone/birth flower with birthstone color
10. Reaction bar appears — recipient can tap emoji reactions (heart supports multi-tap)

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 18.3.1 |
| Bundler | Vite | 5.4.1 |
| Routing | react-router-dom | 7.18.0 |
| Animation | framer-motion | 12.40.0 |
| Confetti | canvas-confetti | 1.9.4 |
| Audio | howler | 2.2.4 |
| Backend | Express | 4.19.2 |
| ORM | Prisma | 7.8.0 |
| Database | SQLite (better-sqlite3) | 12.11.1 |
| Upload | multer | 2.2.0 |
| Validation | file-type | 22.0.1 |
| Thumbnails | sharp | 0.35.2 |
| IDs | nanoid | 5.1.14 |
| MCP | @modelcontextprotocol/sdk | 1.0.0 |
| Fonts | Google Fonts (Baloo 2 + Nunito) | — |

---

## Project Structure

```
birthday-wish-generator/
├── package.json                    # Root — "npm run dev" runs server + client
├── answers.md                      # Troubleshooting + session log
├── explain.md                      # This file
├── report.md                       # Assignment report template (empty)
│
├── client/                         # Frontend (React + Vite)
│   ├── index.html                  # Entry HTML with Google Fonts
│   ├── vite.config.js              # Vite config, proxies /api to localhost:3001
│   └── src/
│       ├── main.jsx                # React root mount with BrowserRouter
│       ├── App.jsx                 # Router: / → /create, /create, /wish/:id
│       ├── index.css               # All styles (~13KB, BEM, custom properties)
│       ├── hooks/
│       │   └── useReducedMotion.js # prefers-reduced-motion detection
│       ├── components/experience/
│       │   ├── ExperienceOrchestrator.jsx  # State machine (5 phases)
│       │   ├── GiftBox.jsx                 # Animated gift box
│       │   ├── SentenceRevealer.jsx        # Sentence-by-sentence reveal
│       │   ├── ConfettiFinale.jsx          # Canvas confetti
│       │   ├── PhotoGallery.jsx            # Staggered photo grid
│       │   ├── ReactionBar.jsx             # Emoji reactions
│       │   ├── FlairChips.jsx              # Zodiac/birthstone/flower pills
│       │   └── BackgroundMusic.jsx         # Howler.js wrapper
│       └── pages/
│           ├── CreatePage.jsx      # Wish creation form
│           └── WishPage.jsx        # Wish viewer
│
├── server/                         # Backend (Express + Prisma + SQLite)
│   ├── index.js                    # Express entry, API routes, static serving
│   ├── mcp-server.js               # MCP server for birthday flair tool
│   ├── lib/
│   │   ├── flair.js                # Zodiac/birthstone/birthflower lookup
│   │   └── prisma.js               # Prisma client singleton (WAL mode)
│   ├── middleware/
│   │   └── upload.js               # Multer config: UUID, 5MB, mime filter
│   ├── routes/
│   │   ├── wishes.js               # Wish CRUD endpoints
│   │   └── photos.js               # Photo upload + serve
│   ├── services/
│   │   └── wishService.js          # Business logic
│   ├── prisma/
│   │   ├── schema.prisma           # 4 models
│   │   └── migrations/
│   └── uploads/                    # Photo storage (UUID filenames)
│
├── slides/
│   └── pitch.md                    # Pitch deck template (not filled in)
│
├── .planning/                      # Planning docs
│   ├── PROJECT.md                  # Full project spec
│   ├── codebase/                   # Codebase analysis docs
│   └── research/                   # Architecture, features, pitfalls, stack research
│
└── .claude/
    ├── skills/                     # 4 skills installed
    │   ├── birthday-wish-style/    # Wish display conventions
    │   ├── framer-motion-patterns/ # Animation rules
    │   ├── photo-upload-security/  # Upload security rules
    │   └── ui-ux-pro-max/          # Design system skill
    └── ...
```

---

## Bugs Fixed During Development

1. **Music playback broken** — `BackgroundMusic.jsx` existed but was never imported into ExperienceOrchestrator. Howl was created via broken JSX ref callback. Fixed with proper `useEffect` on mount.
2. **Reaction count ignoring multi-tap** — Server always incremented by 1, ignoring `{count: delta}` from client. Fixed `addReaction` to accept delta parameter.
3. **Theme CSS not applied on wish page** — `CreatePage` stored theme in DB but `WishPage` never read it. Fixed with `THEME_STYLES` map and CSS custom property injection.

---

## Remaining Work (Priority Order)

1. **Phase 6 polish** — responsive breakpoints, loading skeletons, error boundaries, touch targets, accessibility
2. **Production build test** — `cd client && npm run build && cd ../server && npm start`
3. **Replace `ambient.mp3`** — silent placeholder needs a real royalty-free track
4. **Share button** — copy link to clipboard after wish creation
5. **Fill in `slides/pitch.md` and `report.md`** — assignment submission docs
6. **Optional:** tests (Vitest), photo gallery lightbox, stats page