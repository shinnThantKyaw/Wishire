# Answers

## Current Project Status (2026-06-20)

**Stack:** React 18 (Vite 5) + Express + Prisma/SQLite + MCP server

**Progress: 5 of 6 phases complete.**

| Phase | Status | What it covers |
|-------|--------|----------------|
| 1. Data Foundation | ✅ Done | Prisma schema, CRUD API, photo upload, MCP tool |
| 2. Creator Flow | ✅ Done | CreatePage form, themes, routing, Google Fonts |
| 3. Core Experience | ✅ Done | ExperienceOrchestrator, GiftBox, SentenceRevealer, ConfettiFinale |
| 4. Delight Layer | ✅ Done | PhotoGallery, BackgroundMusic, FlairChips, reduced-motion support |
| 5. Reactions + Tracking | ✅ Done | ReactionBar, optimistic UI, atomic backend increments |
| 6. Polish | ⬜ Not started | Responsive, loading states, error boundaries, share button |

**What's left:** Phase 6 (responsive breakpoints, loading skeletons, error boundaries, mobile layout, share button, production build test, replace placeholder audio, fill in slides/pitch.md and report.md).

**What works end-to-end:** Create a wish → get a link → recipient opens → gift box tap → sentences reveal one by one → confetti burst → photos appear → flair chips show zodiac/birthstone/flower → emoji reactions available.

**Known issues:**
- `ambient.mp3` is a silent placeholder (4.5KB) — needs real audio
- No tests exist anywhere
- No responsive design work done yet
- Slides and report templates not filled in
- All code is uncommitted (only 3 documentation commits in git history)

---

## Problem: `ENOENT: client/dist/index.html`

The server (`server/index.js`) serves static files from `../client/dist`, but that folder doesn't exist until you build the client.

## Fix Applied

Updated `server/index.js` catch-all route to handle missing `client/dist/index.html` gracefully. Now returns a 404 JSON error instead of crashing:

```javascript
app.get("*", (req, res) => {
  const indexPath = path.join(clientDist, "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).json({
        error: "Client not built. Run 'cd client && npm run build' first.",
      });
    }
  });
});
```

## How to Run

### Option 1: Dev mode (recommended)

```bash
npm run dev
```

Runs Vite dev server (client on :5173) + Express API (on :3001) concurrently. No build step needed.

### Option 2: Production mode

```bash
cd client && npm run build
cd ../server && npm start
```

Builds client to `client/dist/`, then Express serves everything on :3001.

## Why It Happened

The catch-all route tried to serve `client/dist/index.html` for all non-API routes. If `client/dist/` doesn't exist (because you never ran `vite build`), Express throws ENOENT. The fix adds error handling so the server stays up and tells you what to do.

## Verification

Both servers running and tested:

- Client: http://localhost:5173/ → serves HTML
- API: http://localhost:3001/api/wish/test → `{"error":"Wish not found"}`
- Create wish: POST /api/wish → returns wish with ID, sentences, flair
- Get wish: GET /api/wish/:id → returns full wish with reactions

---

## What Happens If You Run `/clear`

**Short answer:** Conversation history wipes. Files stay. Claude forgets everything said.

**What's cleared:**
- All messages in current conversation
- All context about what you discussed
- All tool call results from this session

**What's NOT cleared:**
- Files on disk (code, explain.md, answers.md — all safe)
- Git history
- Memory files in `.claude/projects/` (if any were saved)
- Skills installed in `.claude/skills/`
- Installed packages (node_modules)

**After `/clear`:**
- Claude starts fresh — no memory of this conversation
- Can still read your files to understand the project
- Will re-read CLAUDE.md for project instructions
- Skills still available (ui-ux-pro-max, etc.)
- Can pick up where you left off by reading explain.md

**If you want context to survive `/clear`:**
- `explain.md` — already has project status
- `answers.md` — already has troubleshooting
- Memory system — ask Claude to "remember" key things before clearing
- CLAUDE.md — project conventions persist (already there)

---

## Phase 2: Core Experience Build (2026-06-20)

### What was built

**Server changes:**
- Added WAL mode to Prisma/SQLite for concurrent read/write safety (Pitfall 1)
- Added `theme` field to Wish model in Prisma schema
- Updated `createWish()` to accept and store theme selection

**Client — new components (`src/components/experience/`):**
- `ExperienceOrchestrator.jsx` — State machine driving the whole birthday experience. Phases: SENDER_INTRO → GIFT_BOX → SENTENCE → CONFETTI → GALLERY. Uses AnimatePresence with `mode="wait"` and stable keys per playCount (Pitfall 2). Replay increments playCount to force full remount.
- `GiftBox.jsx` — CSS gift box with glow, ribbon, bow. Framer Motion spring animations on mount. Tap triggers state transition via `onTap` callback.
- `SentenceRevealer.jsx` — Shows one sentence at a time on tap. Progress dots below. Final sentence styled larger/coral. "tap to continue" hint with pulse animation.
- `ConfettiFinale.jsx` — canvas-confetti with shared canvas pattern (Pitfall 4). `pointer-events: none` so reactions stay tappable (Rule 6). Mobile-aware particle count (80 vs 200). `confetti.reset()` on cleanup.
- `PhotoGallery.jsx` — Staggered entrance animation for photos. Uses thumbnail filenames for fast load (Pitfall 6).
- `ReactionBar.jsx` — 6 emoji buttons + multi-tap heart. Heart uses client-side debounce at 800ms before POST (Pitfall 7). Optimistic UI — count updates instantly on tap.
- `FlairChips.jsx` — Zodiac/birthstone/birth flower pills with stagger animation.
- `BackgroundMusic.jsx` — Howler.js wrapper. Eager Howl init, deferred `.play()` until user gesture (Pitfall 8). Replay resets audio to 0.

**Client — updated pages:**
- `WishPage.jsx` — Stripped down to fetch wish data + render ExperienceOrchestrator
- `CreatePage.jsx` — Added theme selector with 5 themes (Sunrise, Ocean, Lavender, Forest, Midnight). Each shows color swatches.

**CSS:** Full styles for all experience components in `index.css`

**Dependencies installed:** `framer-motion`, `canvas-confetti`, `howler`

### Pitfalls addressed

| Pitfall | How addressed |
|---------|---------------|
| 1. SQLite locked | WAL mode + busy_timeout=10000 |
| 2. AnimatePresence exits | Stable keys with playCount, mode="wait" |
| 4. Confetti memory leak | Shared canvas ref, confetti.reset() on cleanup |
| 6. Photo load times | Thumbnails served, lazy loading |
| 7. Reaction write storms | 800ms debounce, optimistic UI |
| 8. Audio autoplay blocked | Play triggered from gift box tap (user gesture) |

### What's NOT done yet

- No actual audio files (BackgroundMusic has no src) — needs .mp3 files added to `public/audio/`
- ~~Theme CSS custom properties not wired to change colors on wish page~~ **FIXED** — WishPage now applies theme CSS vars on load
- Photo upload thumbnails via `sharp` need verification on server
- No status page for generator (TRACK-01, TRACK-02)
- Mobile testing on real devices needed
- No production build tested end-to-end
- No ambient audio file in `public/audio/` — Howl will 404 on load

---

## Bugs Fixed This Session (2026-06-20)

### 1. Music playback broken in ExperienceOrchestrator
**Problem:** `musicRef.current` was `null` on first render, so `{musicRef.current && <audio>}` short-circuits — the Howl was never created. The `BackgroundMusic.jsx` component existed but was never imported.
**Fix:** Replaced broken JSX ref callback with a proper `useEffect` that creates the Howl on mount. Simplified `handleGiftBoxOpen` to just call `.play()`. Added proper cleanup with `howl.unload()`.

### 2. Reaction count ignoring multi-tap hearts
**Problem:** `addReaction(wishId, emoji)` always incremented by 1, but `ReactionBar` sends `{ emoji, count: delta }` for batched heart taps. The server discarded the `count` field.
**Fix:** `addReaction` now accepts `delta` parameter. Route extracts `count` from body with `Math.max(1, ...)` guard.

### 3. Theme CSS not applied on wish page
**Problem:** `CreatePage` stores theme in DB but `WishPage` never reads it to set CSS custom properties.
**Fix:** Added `THEME_STYLES` map (sunrise, ocean, lavender, forest, midnight) and `Object.entries(...).forEach(setProperty)` on wish fetch. Resets to defaults on unmount.

---

## Project Overview & Phase Status (2026-06-20, final)

### Stack
React 18 (Vite) + Express + Prisma/SQLite + MCP server (`get_birthday_flair` tool for zodiac/birthstone/birth-flower)

### MCP Server Status
**Working.** Registered in `.mcp.json` as `birthday-facts`. Exposes `get_birthday_flair(month, day)` → `{ zodiacSign, birthstone, birthstoneColor, birthFlower }`. Verified: `get_birthday_flair(6, 20)` → Gemini / Pearl / Rose.

### Phase Breakdown

| Phase | Name | Status | Notes |
|-------|------|--------|-------|
| 1 | Data Foundation (Schema + API) | ✅ **Complete** | Prisma schema, CRUD API, photo upload, MCP tool, SPA catch-all |
| 2 | Creator Flow (Form + Upload) | ✅ **Complete** | CreatePage form, routing, themes, Google Fonts |
| 3 | Core Experience (Animations) | ✅ **Complete** | ExperienceOrchestrator, GiftBox, SentenceRevealer, ConfettiFinale, PhotoGallery, FlairChips — all with Framer Motion patterns |
| 4 | Delight Layer (Confetti + Audio) | ✅ **Complete** | Confetti (shared canvas, mobile particles), PhotoGallery (stagger), BackgroundMusic (Howl + graceful fallback), FlairChips (birthstone-colored), theme-flair merge, `prefers-reduced-motion` support |
| 5 | Reactions + Tracking | ✅ **Complete** | ReactionBar with debounced heart multi-tap, optimistic UI, backend atomic increments |
| 6 | Polish (Responsive + A11y) | ⬜ **Not started** | Loading states, error boundaries, mobile layout, replay button polish |

**Scorecard: 5/6 complete, 1 remaining**

### Phase 4 Completion Details (this session)

| Item | What was done |
|------|---------------|
| `prefers-reduced-motion` | New `useReducedMotion` hook (`src/hooks/useReducedMotion.js`). ExperienceOrchestrator skips confetti, shortens sender intro delay (500ms vs 2500ms), uses instant variants. SentenceRevealer uses instant transitions, hides "tap to continue" hint. Confetti phase skipped entirely — jumps straight to gallery. |
| Ambient audio | Silent placeholder MP3 at `client/public/audio/ambient.mp3` (4.5KB). Howl in ExperienceOrchestrator has `onloaderror` graceful fallback (sets `musicRef.current = null`). Replace with a real royalty-free track for production. |
| Theme-flair merge | `flair.js` now returns `birthstoneColor` (hex). WishPage applies it as `--birthstone` CSS custom property. FlairChips uses it for the birthstone pill border + background tint. |
| Music playback fix | Howl created in `useEffect` on mount (not broken JSX ref callback). `handleGiftBoxOpen` calls `.play()` directly. Replay resets audio to 0 and plays again. |

### Remaining Work
1. **Phase 6 polish:** responsive breakpoints, loading skeletons, error boundaries, accessibility, touch targets
2. **Production build test** end-to-end (`cd client && npm run build && cd ../server && npm start`)
3. **Photo upload `sharp` thumbnail** verification on server
4. **Replace `ambient.mp3`** with a real royalty-free audio track
5. **Fill in `slides/pitch.md` and `report.md`** for assignment submission