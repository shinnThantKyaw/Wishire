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

---

## Premium Gift Box Redesign (2026-06-25)

### What changed

Complete redesign of the GiftAnticipation screen (Phase 1 — the page recipients see when they open the wish link). Goal: Apple/Linear/Stripe-level premium feel.

**Files modified:**
- `client/src/components/experience/GiftAnticipation.jsx` — Complete rewrite
- `client/src/components/experience/GiftBox.jsx` — Premium 3D redesign
- `client/src/components/experience/FloatingSparkles.jsx` — Purple-only particle system
- `client/src/index.css` — All gift-anticipation, gift-box, and sparkle CSS replaced

### Design changes

| Element | Before | After |
|---------|--------|-------|
| Background | Light surface (`#faf5ff`) with subtle tinted overlay | Deep purple gradient (`#0d0221` → `#1a0533` → `#2d1b69`) with ambient glow orbs |
| Card | Frosted glass (semi-transparent white) | Clean white premium card with layered shadows and `border-radius: 32px` |
| Headline | "{name}, a surprise awaits!" | "Something special is waiting for you" |
| Subtitle | "{sender} prepared something special" | "Made with love, just for {name}" |
| CTA | Bouncing "✨ Tap To Open ✨" text | Gradient pill button "🎁 Open Your Gift" with glow pulse, hover/press states |
| Gift box | Flat box with basic shadows | Premium 3D box with float animation, lid wiggle, deeper shadows, gradient highlights, bow center knot |
| Floating elements | Mixed emoji (hearts, sparkles, gold) | Purple-only system: sparkle dots, tiny hearts, bokeh orbs |
| Decorations | Scattered emoji around card edges + floating hearts | Removed (cleaner, more premium) |
| Metadata chips | Basic pills | Refined frosted badges with letter-spacing |

### New animations
- `gift-box-float` — gentle 6px vertical float, 4s cycle
- `gift-lid-wiggle` — subtle 3° lid rotation every 5s
- `cta-glow-pulse` — expanding glow ring on CTA button, 3s cycle
- `bokeh-drift` — slow diagonal drift for bokeh orbs

### Visual hierarchy (top to bottom)
1. **Headline** — warm personal message
2. **Gift Box** — hero element, largest, floating animation draws eye
3. **CTA Button** — clear interactive prompt with gradient + glow
4. **Sender** — "With love from {name}" with gradient text
5. **Metadata chips** — zodiac, birthstone, birthday date

### Accessibility preserved
- `role="button"`, `tabIndex`, `aria-label`, `onKeyDown` on GiftBox
- `prefers-reduced-motion` disables all CSS animations + framer-motion variants
- All text meets contrast requirements on both dark background and white card
- CTA button has proper `:hover`, `:focus`, `:active` states

---

## Bug Report: Wish Page Scroll Issues (2026-06-25)

### Bug 1: Scroll Not Smooth / Too Slow

**Root Cause:** Expensive CSS animations + No scroll containment

The wish page has **multiple layers of continuously running CSS animations** that fight with the browser's scroll compositor:

1. **`.gift-anticipation` background animation** (`index.css:1978`)
   ```css
   animation: hero-gradient-drift 30s ease-in-out infinite alternate;
   ```
   Combined with `background-size: 200% 200%` (set inline in `GiftAnticipation.jsx:116`), this forces the browser to repaint a massive gradient on every animation frame.

2. **14 floating emoji decorations** (`FloatingSparkles.jsx`) each with:
   - `will-change: transform` (`index.css:2016`)
   - Individual `hero-deco-float` animations with different durations (15–26s)
   - CSS `filter` chains of 5–6 filters per emoji (`grayscale`, `brightness`, `sepia`, `hue-rotate`, `saturate`, `blur`)
   - All running on the compositor thread alongside scroll

3. **Ambient glow blurs** (`index.css:1999, 2008`)
   - `filter: blur(60px)` and `blur(50px)` on 400px/300px elements
   - Animated with framer-motion `scale` + `opacity` (`GiftAnticipation.jsx:128-135`)
   - Blur filters are extremely expensive to composite

4. **`gift-box-float` animation** (`index.css:1770-1773`) — continuous `translateY` on the gift box

5. **`cta-glow-pulse` animation** (`index.css:2082-2085`) — continuous `box-shadow` changes

6. **No `overscroll-behavior: contain`** — browser's default overscroll rubber-banding adds visual complexity on top of all these animations

**Compounding effect:** On scroll, the browser must composite all 14 emoji layers with filter chains, repaint the 200%×200% gradient background, re-blur two large glow orbs, float the gift box, pulse the CTA shadow, AND handle the scroll itself. This overwhelms the GPU compositor, especially on mobile.

---

### Bug 2: White Background (~40px) at Top/Bottom on Fast Scroll

**Root Cause:** Missing background chain + overscroll exposure

The DOM nesting for the wish experience (Phase 2 — MAIN) is:

```
body                          → background: #f8f5ff (very light purple, almost white)
  #root                       → NO background
    div                       → NO background (App.jsx wrapper)
      div.wish-page           → background: var(--wish-surface) ← SET ✓
        .experience           → NO background ← MISSING ✗
          motion.div          → NO background (framer-motion wrapper)
            .wish-experience  → NO background ← MISSING ✗
```

When you scroll fast and the browser's **overscroll rubber-banding** kicks in (iOS Safari, Chrome mobile), it reveals the area above the top and below the bottom of the scrollable content. This area shows the **body background** (`#f8f5ff` — so light it looks white) or the **HTML document background** (white by default).

The ~40px white band appears because:
1. `.wish-page` has `background-color` but `.experience` and `.wish-experience` do NOT
2. During fast overscroll, the page "bounces" and exposes the body/html background
3. On the **gift anticipation** phase, `overflow: hidden` on `.gift-anticipation` (`index.css:1976`) prevents scrolling — so the bug only appears in the **MAIN phase** (WishExperience)

**Additional factor:** The `.experience` container (`index.css:1674-1683`) has `min-height: 100vh` + `justify-content: center`. When content is shorter than viewport, the flex container still spans full viewport. On overscroll bounce, the gap between flex content and container edge exposes the white body background.

---

### Suggested Fixes

**Fix 1 — Overscroll containment** (stops the white flash):
```css
/* In index.css — .wish-page rule (line 1563) */
.wish-page {
  text-align: center;
  max-width: none;
  padding: 0;
  background-color: var(--wish-surface, #faf5ff);
  overscroll-behavior: contain;   /* ← ADD THIS */
}
```

**Fix 2 — Background inheritance** (belt-and-suspenders):
```css
/* In index.css — .experience rule (line 1674) */
.experience {
  background-color: inherit;   /* ← ADD THIS — inherits from .wish-page */
}

/* In index.css — .wish-experience rule (line 2387) */
.wish-experience {
  background-color: inherit;   /* ← ADD THIS */
}
```

**Fix 3 — CSS containment for animated layers** (improves scroll performance):
```css
/* In index.css — .gift-anticipation rule (line 1966) */
.gift-anticipation {
  contain: layout style paint;   /* ← ADD THIS — isolates repaints */
}

/* In index.css — .gift-anticipation__deco rule (line 2012) */
.gift-anticipation__deco {
  contain: layout style paint;   /* ← ADD THIS */
}

/* In index.css — .gift-anticipation__ambient-glow rule (line 1990) */
.gift-anticipation__ambient-glow {
  contain: layout style paint;   /* ← ADD THIS */
}
```

**Fix 4 — Reduce filter complexity** (optional, for mobile perf):
```css
/* Simplify the filter chain on sparkles — remove blur on all, use opacity instead */
.gift-anticipation__deco {
  /* Remove the blur() from the inline filter chain in FloatingSparkles.jsx */
  /* Already has opacity control — blur adds marginal visual value at high GPU cost */
}
```

### Summary Table

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| Slow/janky scroll | 14 animated emoji filters + gradient repaint + blur orbs all compositing simultaneously | Add `contain: layout style paint` to animated layers; reduce filter chain complexity |
| White 40px bands | Missing background on `.experience` / `.wish-experience` + no `overscroll-behavior: contain` → rubber-band exposes white body bg | Add `overscroll-behavior: contain` to `.wish-page`; propagate `background-color: inherit` down the DOM chain |

---

## Features of the App for README (2026-06-26)

### Core Experience
- 🎁 **3D Gift Box Reveal** — premium animated gift box with spring-based lid opening, 28-particle burst, bow, ribbons, and constellation pattern
- 🎉 **7-Wave Confetti Celebration** — timed multi-directional confetti bursts (center, left, right, rain, fans, final shower)
- 📸 **Photo Memories Slideshow** — auto-advancing carousel (3.5s) with dot indicators, prev/next, hover-to-pause, wrap-around
- 💌 **Typewriter Letter Card** — expandable card with character-by-character reveal (40ms/char), blinking cursor, skip button, chime SFX
- 🎵 **Audio System** — background birthday music (looped), whoosh SFX on gift open, chime on letter finish, pause/resume toggle
- 🔄 **Replay Experience** — recipient can re-experience the full surprise from the gift box

### Creator Flow
- 📝 **Rich Wish Form** — sender/recipient name, relationship picker, birth date, message (10K chars with live counter)
- 🖼️ **Drag & Drop Photo Upload** — up to 5 photos, JPEG/PNG/WebP/GIF, 5MB each, thumbnail previews
- 🎨 **12 Theme Colors** — Lavender, Sunrise, Ocean, Forest, Rose, Midnight, Amber, Teal, Fuchsia, Sky, Emerald, Slate
- 👥 **Relationship Picker** — 5 icon-based options (Friend, Family, Coworker, Partner, Custom) with spring animations
- ✅ **Inline Validation** — validate-on-submit, clear-on-change, per-field errors + toast notifications

### Personalization
- ♈ **Zodiac Sign** — auto-calculated from birth month/day
- 💎 **Birthstone** — month-based with hex color
- 🌸 **Birth Flower** — month-based flower
- 🏷️ **Flair Chips** — zodiac, birthstone, birth flower displayed as themed pills

### Animations & Effects
- 🖱️ **Mouse Parallax** — landing page decorations respond to cursor
- ✨ **Floating Sparkles** — 14 emoji decorations with theme-aware hue rotation
- 🌟 **Glow Orbs** — breathing gradient orbs across backgrounds
- 💫 **Staggered Section Reveals** — all experience sections animate in sequence
- ⭐ **Premium CTA Button** — glassmorphism, shine sweep, icon wiggle, sparkle particles
- 💀 **Skeleton Loading** — shimmer placeholders while data loads

### Sharing & Success
- 🔗 **Shareable Link** — unique short URL (`/wish/{id}`) with nanoid
- 📋 **Copy to Clipboard** — clipboard API with execCommand fallback
- 🎊 **Success Confetti** — burst when wish is created

### Backend & Data
- 🗄️ **SQLite + Prisma** — WAL journal mode for concurrent reads/writes
- 📊 **View Tracking** — records each wish open
- 👍 **Emoji Reactions** — atomic upsert, supports multi-tap
- 📏 **Auto Sentence Splitting** — message split into max 6 sentences for staggered display
- 🔧 **MCP Server** — `get_birthday_flair` tool for AI assistants

### Security
- 🔒 **UUID Filenames** — uploads stored with crypto.randomUUID()
- 🛡️ **Magic-Byte Validation** — file type verified by actual bytes
- 🚫 **Path Traversal Prevention** — resolved path + UUID format validation
- 🧹 **XSS Prevention** — React text nodes, no dangerouslySetInnerHTML

### Accessibility
- ♿ **Reduced Motion** — 25+ animations disabled via prefers-reduced-motion
- ⌨️ **Keyboard Accessible** — gift box Enter/Space, focus-visible outlines, aria-labels
- 📱 **Touch Aware** — parallax disabled on touch, mobile-adaptive particle counts
- 👆 **44px Touch Targets** — minimum size for interactive elements

---

## Railway Deployment Guide (2026-06-26)

### What's already ready (no changes needed)

| Item | Status | Code |
|------|--------|------|
| package.json scripts | ✅ | `"start": "node index.js"`, `"type": "module"` |
| PORT from env | ✅ | `process.env.PORT \|\| 3001` in `index.js:40` |
| CORS | ✅ | `app.use(cors())` in `index.js:13` |
| Isolated monorepo | ✅ | `server/` is self-contained |

### What needs fixing before deploy

1. **SQLite path is hardcoded** (`server/lib/prisma.js:13`) — reads `../dev.db`. Needs to read from `DATABASE_URL` env var, fallback to local path.
2. **File uploads go to local disk** (`server/middleware/upload.js`) — Railway filesystem is ephemeral. Need cloud storage (Cloudinary).

### Railway dashboard steps

1. New Project → Deploy from GitHub → select `shinnThantKyaw/Wishire`
2. Set **Root Directory** to `server`
3. Add a **Volume** (Mount Path: `/data`)
4. Add env var: `DATABASE_URL=file:/data/wishire.db`
5. Deploy

### Sources
- Railway monorepo docs: https://docs.railway.com/deployments/monorepo
- Railway volumes: https://docs.railway.com/integrations/api/manage-volumes
- Railway build config: https://docs.railway.com/builds/build-configuration

---

## Railway Deployment — Step-by-Step Guide (2026-06-26)

### Done
- ✅ Code committed with Cloudinary + configurable DB path
- ✅ Cloudinary URL added to local env

### Steps

1. `git push` — push code to GitHub
2. Railway → New Project → Deploy from GitHub → select `shinnThantKyaw/Wishire`
3. Service → Settings → **Root Directory**: `server`
4. Service → Settings → **Volumes** section → **Add Volume** → Mount Path: `/data`
   - **Note:** Volume is under the SERVICE settings, NOT the project settings
   - Free plan: 0.5GB limit (plenty for SQLite)
5. Service → Variables → Add `CLOUDINARY_URL` and `DATABASE_URL=file:/data/wishire.db`
6. Redeploy if it doesn't auto-deploy

### How to find the Volume section

The Volumes section is inside the **service settings**, not the project settings:
1. Click on your service box in the project canvas
2. Click the **Settings** tab at the top
3. Scroll down — you'll see **"Volumes"** section with an **"Add Volume"** button
4. Set Mount Path to `/data`

### Volume size limits by plan
| Plan | Volume Size |
|------|-------------|
| Free/Trial | 0.5GB |
| Hobby ($5/mo) | 5GB |
| Pro ($20/mo) | 50GB |

### Why we need a Volume
SQLite writes the database file to disk. Railway's filesystem is ephemeral — files outside volumes are deleted on every redeploy. A Volume mounts persistent storage at `/data`, so our `DATABASE_URL=file:/data/wishire.db` survives restarts.

---

## PostgreSQL Migration (2026-06-26)

Migrated from SQLite to PostgreSQL because Railway's Volume UI wasn't accessible.

### What changed

| File | Change |
|------|--------|
| `server/prisma/schema.prisma` | `provider = "postgresql"`, removed `url`, removed `@default(nanoid(8))` |
| `server/prisma.config.ts` | New — reads `DATABASE_URL` from env for Prisma 7 CLI |
| `server/lib/prisma.js` | Uses `PrismaPg` adapter with `pg` driver |
| `server/package.json` | Added `@prisma/adapter-pg`, `pg`; removed SQLite deps |
| `server/prisma/migrations/0_init/` | New — PostgreSQL migration SQL |

### Railway deployment steps (PostgreSQL)

1. `git push`
2. Railway → **+ New** → **Database** → **PostgreSQL**
3. App service → **Variables** → add `DATABASE_URL=${{Postgres.DATABASE_URL}}`
4. App service → **Variables** → add `CLOUDINARY_URL=your_url`
5. App service → **Settings** → **Start Command**: `npx prisma migrate deploy && node index.js`
6. Redeploy