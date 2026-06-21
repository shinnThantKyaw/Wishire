# Roadmap: Birthday Wish Generator

**Created:** 2026-06-20
**Mode:** mvp
**Granularity:** standard
**Total Phases:** 5
**Total Requirements:** 19

## Phase Overview

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Foundation | 2/2 | Complete    | 2026-06-20 |
| 2 | Creator Flow | 2/2 | Complete   | 2026-06-21 |
| 3 | Recipient Experience | Gift box + sentence reveals + audio — the core magic | PAGE-01, PAGE-02, PAGE-03, PAGE-04, PAGE-07 | 6 |
| 4 | Finale | Confetti + gallery + reactions — emotional payoff | PAGE-05, PAGE-06, PAGE-08, PAGE-09 | 5 |
| 5 | Polish | Themes, flair, status page, mobile — production ready | PAGE-10, THEME-02, TRACK-01, TRACK-02 | 5 |

## Phase Details

### Phase 1: Foundation

**Goal:** Data model + API skeleton — wishes can be created and retrieved
**Mode:** mvp
**Requirements:** WISH-01, WISH-02
**Success Criteria**:

1. Prisma schema created with wishes, photos, reactions, stats tables
2. SQLite WAL mode and busy_timeout configured from the start
3. POST /api/wish creates a wish and returns UUID-based shareable link
4. GET /api/wish/:id returns wish data (name, message, photos, theme)
5. Express SPA catch-all route serves React app for /create and /wish/:id

**Key Pitfalls Addressed:**

- Pitfall 1: SQLite write contention (WAL mode + busy_timeout from day one)
- Pitfall 5: SPA 404 on refresh (Express catch-all route)

**Plans:** 2/2 plans complete
Plans:
**Wave 1**

- [x] 01-01-PLAN.md — Error handling foundation: custom error classes, centralized middleware, refactor wishes service + routes

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02-PLAN.md — Refactor photo routes to use structured error handling; verify schema consistency

---

### Phase 2: Creator Flow

**Goal:** Generator form + photo upload — complete wish creation experience
**Mode:** mvp
**Requirements:** PHOTO-01, PHOTO-02, THEME-01, WISH-03
**Success Criteria**:

1. Generator form with name, relationship, birth month/day, message textarea, theme selector
2. Photo upload via react-dropzone with drag-and-drop, max 5 files, 5MB each
3. Photos stored on filesystem with UUID filenames via multer (magic byte validation)
4. Preview page showing the wish as recipient will see it
5. Copy link and open link buttons on preview page

**Key Pitfalls Addressed:**

- Pitfall 3: Photo upload path traversal (server-generated UUID filenames + magic byte validation)

**Plans:** 2/2 plans complete
Plans:
**Wave 1**

- [x] 02-01-PLAN.md — PhotoUploader + ThemeSelector components (standalone sub-components with CSS)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 02-02-PLAN.md — Refactor CreatePage with sub-components, validation, success state, and skill file

---

### Phase 3: Recipient Experience

**Goal:** Gift box + sentence reveals + audio — the core magic
**Mode:** mvp
**Requirements:** PAGE-01, PAGE-02, PAGE-03, PAGE-04, PAGE-07
**Success Criteria**:

1. Birthday page at /wish/:id shows sender name ("A birthday wish from [Name]")
2. Animated gift box in center — tap triggers Framer Motion open animation + SFX
3. Wish sentences appear one at a time on tap (useReducer state machine)
4. Photos appear between wish sections with Framer Motion transitions
5. Background music plays after gift box tap (Howler.js, mobile AudioContext unlock)
6. Animation state machine: IDLE → GIFT_BOX → UNWRAPPING → SENTENCE → (ready for confetti)

**Key Pitfalls Addressed:**

- Pitfall 2: Framer Motion AnimatePresence keys (include playCount in keys for replay)
- Pitfall 8: Mobile audio autoplay blocking (tie audio to gift box tap gesture)

---

### Phase 4: Finale

**Goal:** Confetti + gallery + reactions — emotional payoff
**Mode:** mvp
**Requirements:** PAGE-05, PAGE-06, PAGE-08, PAGE-09
**Success Criteria**:

1. Final sentence triggers confetti explosion (canvas-confetti, shared canvas pattern)
2. Sparkles and "Happy Birthday!" animation after confetti
3. All photos display together in a gallery finale with gentle transitions
4. Replay button resets animation state machine and replays the full experience
5. Emoji reaction bar (❤️ 😭 😂 🥰 etc.) with debounced POST to /api/wish/:id/reactions
6. Multi-tap heart button with counter increment

**Key Pitfalls Addressed:**

- Pitfall 4: canvas-confetti memory leak on replay (shared canvas + cleanup lifecycle)
- Pitfall 7: Reaction race conditions (debounced atomic increments)

---

### Phase 5: Polish

**Goal:** Themes, flair, status page, mobile — production ready
**Mode:** mvp
**Requirements:** PAGE-10, THEME-02, TRACK-01, TRACK-02
**Success Criteria**:

1. Theme system with CSS custom properties (color palette, backgrounds, animation personality)
2. Birthday page auto-enhanced with zodiac sign, birthstone color, birth flower motif
3. Wish opens tracked (count + timestamps) via GET /api/wish/:id/stats
4. Generator status page showing open count and reaction counts
5. Mobile-responsive across all pages (touch gestures, readable text, tappable elements)

**Key Pitfalls Addressed:**

- Pitfall 6: Photo load times on mobile (image optimization, lazy loading)

---
*Created: 2026-06-20*
*Last updated: 2026-06-21 after Phase 2 planning*
