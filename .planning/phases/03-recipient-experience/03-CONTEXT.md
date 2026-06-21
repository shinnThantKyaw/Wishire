# Phase 3: Recipient Experience - Context

**Gathered:** 2026-06-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Birthday person's interactive wish experience at `/wish/:id`. This covers: the birthday page showing sender name, animated gift box that splits open on tap, sentence-by-sentence typewriter reveal, photo slideshow after all sentences, background music (user-provided Happy Birthday MP3), sound effects, confetti finale with "Happy Birthday!" text, and a full replay button. No reaction system — the wish is a one-way gift.

</domain>

<decisions>
## Implementation Decisions

### Gift Box Animation
- **D-01:** Gift box splits open from center — two halves slide apart. Dramatic, cinematic feel.
- **D-02:** Sender name ("From [Name]") is visible on the gift box BEFORE opening. Birthday person knows who it's from.
- **D-03:** Gift box rendered with CSS/SVG + Framer Motion — no external illustration assets. Lightweight, theme-colored accents matching the selected theme.
- **D-04:** Slow split (~1s) with particles/light bursting from the gap as it opens. Magical, gives time to anticipate.

### Sentence Reveal
- **D-05:** Typewriter effect — sentences appear character by character when tapped. More dramatic than simple fade-in.
- **D-06:** Skip button available — impatient readers can tap skip to show the full sentence immediately.

### Photo Slideshow
- **D-07:** Photos appear AFTER all sentences are revealed (not woven between). Each photo shown one at a time as a slideshow.
- **D-08:** Auto-advance every 3-4 seconds with gentle crossfade. Manual prev/next controls also available.
- **D-09:** Photo slideshow uses Framer Motion AnimatePresence with proper keys (Pitfall 2).

### Audio
- **D-10:** Background music starts on gift box tap/open. Uses user-provided Happy Birthday MP3 from assets folder.
- **D-11:** Music auto-plays at 50-60% volume. The gift box tap satisfies mobile AudioContext unlock (Pitfall 8).
- **D-12:** Pause/resume button at top right corner — always visible during the experience.
- **D-13:** Sound effects (SFX): soft "whoosh" on box split open, gentle "chime" on each sentence reveal. In addition to background music.
- **D-14:** SFX files also user-provided in assets folder (or we use free open-source SFX).

### Finale & Replay
- **D-15:** After last sentence → confetti explosion + sparkles + large "Happy Birthday!" text in center. Photo slideshow starts below.
- **D-16:** No reaction system — the wish is a one-way gift. No emoji reactions, no heart button.
- **D-17:** Full replay button appears after photo slideshow ends. Resets everything: gift box reassembles, music restarts, sentences reset. AnimatePresence keys must include playCount for replay (Pitfall 2).

### Animation State Machine
- **D-18:** useReducer state machine: IDLE → GIFT_BOX → UNWRAPPING → SENTENCE → PHOTOS → FINALE → (replay → IDLE). Each state controls what's visible and what animations are active.

### Claude's Discretion
- Specific Framer Motion animation parameters (duration, easing, spring physics)
- Particle effect implementation (CSS or canvas)
- Typewriter speed (characters per second)
- Photo slideshow transition style (crossfade specifics)
- SFX sourcing (embedded or asset files)
- Component file structure under `client/src/components/experience/`
- confetti library choice (canvas-confetti or custom)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Architecture & Data Model
- `.planning/codebase/ARCHITECTURE.md` — System overview, request flows, data model, key patterns
- `.planning/codebase/STACK.md` — Technology stack, versions, configuration
- `.planning/codebase/CONVENTIONS.md` — File structure, naming, component patterns

### Research & Pitfalls
- `.planning/research/PITFALLS.md` — 8 critical pitfalls (Pitfall 2: AnimatePresence keys, Pitfall 8: Mobile audio autoplay)
- `.planning/codebase/CONCERNS.md` — Known concerns and security issues

### Skills (MUST follow)
- `.claude/skills/framer-motion-patterns/SKILL.md` — AnimatePresence keys, variants at module level, replay reset with playCount
- `.claude/skills/birthday-wish-style/SKILL.md` — Typography, flair chip formatting, sentence splitting
- `.claude/skills/ui-ux-pro-max/SKILL.md` — Accessibility, touch targets, responsive design

### Existing Implementation
- `client/src/App.jsx` — Route definition for `/wish/:id` (exists but renders placeholder)
- `client/src/pages/CreatePage.jsx` — Reference for form patterns, theme data, API calls
- `client/src/components/create/ThemeSelector.jsx` — THEMES constant with theme color data
- `server/services/wishService.js` — Wish creation logic, sentence splitting, flair embedding
- `server/routes/wishes.js` — GET /api/wish/:id endpoint (returns wish data with photos)
- `server/lib/flair.js` — Zodiac/birthstone/birthflower lookup

### Phase 2 Context
- `.planning/phases/02-creator-flow/02-CONTEXT.md` — Theme data, photo upload patterns, success state patterns

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `THEMES` constant (exported from ThemeSelector.jsx): provides primary, secondary, surface colors per theme — used for gift box accents and confetti colors
- `framer-motion` (v12.40.0): already installed, used in Phase 2 for transitions
- `howler` (v2.2.4): already installed for audio playback
- `/wish/:id` route already defined in App.jsx — just needs the actual WishPage component

### Established Patterns
- React functional components with hooks (useState, useEffect, useCallback)
- CSS uses BEM-like naming with CSS custom properties from `:root`
- Framer Motion patterns from `framer-motion-patterns` SKILL.md
- wishService returns wish data with: senderName, recipientName, message, photos[], theme, flair data

### Integration Points
- `GET /api/wish/:id` — Fetches wish data (already exists)
- `THEMES[theme]` — Color data for theming the recipient experience
- `server/lib/flair.js` — Zodiac/birthstone/birthflower data embedded in wish
- `client/src/App.jsx` — Route for `/wish/:id` (placeholder, needs WishPage component)

### Data Available from API
The wish object returned by `GET /api/wish/:id` includes:
- `senderName`, `recipientName`, `message` (the wish text)
- `photos[]` (array of photo URLs)
- `theme` (theme ID string, e.g., "sunrise")
- `flair` (zodiac sign, birthstone, birthflower)
- Sentences are split by wishService using sentence splitting logic

</code_context>

<specifics>
## Specific Ideas

**User's specific requests:**
- Gift box splits open from center with particles bursting out (~1s animation)
- Sender name ("From [Name]") visible on the box before opening
- CSS/SVG rendering with Framer Motion — no external illustration assets
- Typewriter effect for sentences with a skip button
- Photos at the end as a slideshow (one by one, auto-advance 3-4s + manual controls)
- Background music: user-provided Happy Birthday MP3 from assets folder, auto-play at 50-60% volume
- Pause/resume button at top right corner
- SFX: whoosh on box open, chime on sentence reveal
- Confetti explosion + "Happy Birthday!" text after last sentence
- No reactions — one-way gift
- Full replay button after slideshow

**Key implementation note:**
The Happy Birthday song MP3 and SFX files will be provided by the user in an `assets/` folder. Plan should assume these files exist and reference them by path.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 3-Recipient Experience*
*Context gathered: 2026-06-21*
