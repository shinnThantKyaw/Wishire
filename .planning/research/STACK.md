# Stack Research

**Domain:** Interactive wish/gift experience web app (React SPA + Express API)
**Researched:** 2026-06-19
**Confidence:** MEDIUM (versions from training data, not verified against live npm registry)

> **Note:** Bash, WebSearch, and WebFetch were all restricted in this environment. Version numbers reflect training data through August 2025. All dependencies use caret ranges (`^`) so `npm install` will pull the latest compatible version. The architectural choices (which libraries, why) are high-confidence; exact patch versions are medium-confidence.

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | ^18.3 or ^19.0 | UI framework | Already part of project. React 19 is stable as of mid-2025 with improved hooks and concurrent features, but React 18 is perfectly capable. Use whichever the existing Vite scaffold targets. |
| Vite | ^5.4 | Build tool / dev server | Already part of project. Fastest HMR in the ecosystem, native ESM, excellent React plugin support. Vite 6 may be available by 2026 but Vite 5 is battle-tested. |
| TypeScript | ^5.5 | Type safety | Catches bugs at compile time for both client and server. Non-negotiable for any project with API boundaries. |
| Express | ^4.21 | HTTP server / REST API | Already part of project. Mature, minimal, well-understood. No reason to switch for this scale. |
| SQLite (via Prisma) | — | Database | Already decided in PROJECT.md. Zero-config, file-based, no server process. Prisma provides type-safe queries and easy migration path to PostgreSQL. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| framer-motion | ^11.0 | All animations: gift box open, sentence reveals, photo transitions, sparkles | Core animation engine for the entire recipient experience. Handles layout animations, gestures (tap), spring physics, and exit animations out of the box. |
| canvas-confetti | ^1.9 | Confetti explosion on final sentence | Lightweight (no React dependency), highly customizable particle effects. Superior to react-confetti because it gives per-particle control: colors, shapes, trajectories, gravity. |
| react-dropzone | ^14.0 | Photo upload with drag-and-drop | De-facto standard for React file uploads. Handles drag states, file type validation, size limits, preview generation. Accessible. No UI opinions — you style it yourself. |
| react-router-dom | ^6.26 | Client-side routing: `/create` and `/wish/:id` | Standard React router. v6 has cleaner API than v5. Use `createBrowserRouter` for data-loading patterns if needed later. |
| howler | ^2.2 | Background music and tap sound effects | Most robust cross-browser audio library. Handles auto-play policies, mobile audio unlocks, multiple concurrent sounds, sprite maps for sound effects. Prefer over native `<audio>` because mobile browsers gate audio on user gesture — Howler manages this. |
| yet-another-react-lightbox | ^3.0 | Photo gallery finale lightbox | Clean, accessible, supports touch gestures. Lighter than PhotoSwipe's React wrapper. Pairs well with react-photo-album if a grid layout is needed. |
| emoji-picker-react | ^4.0 | Emoji reaction picker | Complete emoji picker with search, skin tones, categories. If the reaction set is small and fixed (e.g., 6 emojis), build a custom bar instead and skip this dependency. |
| multer | ^1.4 | Multipart file upload handling on Express | Standard Express middleware for file uploads. Handles file size limits, field validation, disk storage. Slim — no unnecessary abstractions. |
| uuid | ^10.0 | Generate unique shareable link IDs | Cryptographically random v4 UUIDs. Prefer over auto-increment IDs for shareable links (unguessable, no enumeration risk). |
| concurrently | ^9.0 | Run client + server dev servers from root `npm run dev` | Simple, works. Already implied by the project setup commands. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint | Code quality | Use the Vite React TypeScript preset. Add `eslint-plugin-react-hooks` for rules-of-hooks checking. |
| Prettier | Code formatting | Consistent formatting across client and server. Configure via `.prettierrc`. |
| Prisma CLI | Database migrations | `npx prisma migrate dev` to create/apply migrations. `npx prisma studio` for visual DB inspection during development. |

## Installation

```bash
# --- Root ---
npm install concurrently

# --- Client (client/) ---
cd client
npm install react-router-dom framer-motion canvas-confetti react-dropzone howler
npm install -D @types/react @types/react-dom typescript eslint prettier

# --- Server (server/) ---
cd ../server
npm install express multer uuid @prisma/client
npm install -D prisma typescript @types/express @types/multer @types/uuid tsx
```

**If using the full lightbox (optional — only if gallery needs lightbox):**
```bash
cd client
npm install yet-another-react-lightbox
```

**If using the full emoji picker (optional — skip if building a fixed reaction bar):**
```bash
cd client
npm install emoji-picker-react
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| framer-motion | react-spring | react-spring has better physics for complex spring chains, but framer-motion has better gesture handling, layout animations, and a simpler API for the UX patterns in this app (tap-to-animate, sequential reveals, enter/exit transitions). |
| framer-motion | CSS animations + transitions | CSS-only is fine for simple hover effects. Completely inadequate for the gift box open (multi-stage), sequential sentence reveals (stagger + orchestration), and gesture-driven animations this app requires. |
| canvas-confetti | react-confetti | react-confetti is simpler (just `<Confetti>`), but gives less control over particle behavior. canvas-confetti lets you fire multiple bursts with different colors per theme, control spread angle, and trigger from specific screen positions — all needed for a polished finale. |
| howler | use-sound | use-sound is a thin React hook wrapper around Howler. Use it if you want the hook API, but import Howler directly for more control over audio sprites and mobile unlock flows. |
| howler | Native `<audio>` element | Native audio is fine for a single track with basic play/pause. Fails on mobile where browsers require user gesture before playing audio — Howler's auto-unlock handles this. Also breaks when you need to play a tap sound + background music simultaneously (two `<audio>` elements have unpredictable behavior). |
| react-dropzone | Uppy | Uppy is a full upload framework with dashboard UI, tus resumable uploads, and S3 integration. Massive overkill for 1-5 photos under 5MB each. react-dropzone is 15KB and does exactly what's needed. |
| multer | formidable / busboy | multer is built on busboy and adds Express middleware ergonomics. formidable is lower-level. multer is the right abstraction level for this project. |
| uuid | nanoid | nanoid is smaller and URL-safe by default. Both work. uuid is more widely used in the Express/Prisma ecosystem and produces standard v4 UUIDs that Prisma handles natively. |
| Prisma + SQLite | better-sqlite3 (raw) | Raw SQL is faster but loses type safety, migration tooling, and the Postgres migration path. Prisma is worth the overhead for a project that may grow. |
| yet-another-react-lightbox | PhotoSwipe | PhotoSwipe is excellent but heavier and its React wrappers are community-maintained with varying quality. yarl is purpose-built for React with first-class TypeScript support. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| GSAP (GreenSock) | Powerful but imperative API that fights React's declarative model. Requires refs, manual cleanup, and `useLayoutEffect` gymnastics. Overkill for the animation complexity here. | framer-motion |
| React Spring alone | Excellent physics, weaker gesture and layout animation support. The gift box open involves a tap gesture triggering a multi-stage animation — framer-motion's gesture + animate combo is cleaner. | framer-motion (or framer-motion + react-spring if complex spring chains are needed later) |
| react-audio-player | Thin wrapper around `<audio>` with no mobile unlock, no multi-sound support, no sprite maps. | howler |
| Cloudinary / Uploadcare / S3 (for v1) | Adds service dependency, cost, complexity, and latency for something that can be a local folder + Express static serving. Premature optimization. | multer + filesystem (swap to S3 in a later phase if scale demands it) |
| Redux / Zustand / Jotai | State management libraries for a two-page app with no shared complex state. A wish form's state lives in component state or a single `useReducer`. The recipient page is read-only display. | React `useState` / `useReducer` |
| Next.js | SSR/SSG framework. This app is a SPA with two client-rendered routes. Next.js adds routing complexity, server component mental model overhead, and deployment constraints for zero benefit here. | Vite + React (SPA) |
| Tailwind CSS / MUI / Chakra | Full CSS framework for a heavily bespoke animated experience. The gift box, confetti, sparkles, and theme system need custom CSS/scoped styles. A framework adds constraints without solving the hard problems. | Plain CSS or CSS Modules (already scaffolded by Vite) |
| Socket.io / WebSockets | Real-time bidirectional communication. The birthday person opens a link and experiences a pre-rendered wish — no live collaboration, no chat, no real-time sync. | REST (GET /api/wish/:id, POST /api/wish/:id/reactions) |

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| framer-motion ^11 | React ^18 or ^19 | Framer Motion 11 officially supports React 19. If the project is on React 18, upgrade path is smooth. |
| react-router-dom ^6 | React ^18 or ^19 | v6.4+ (with data routers) requires React 16.8+. Fully compatible with React 18 and 19. |
| canvas-confetti ^1 | Any framework or vanilla JS | No React dependency. Works by manipulating a `<canvas>` element. Call it from a `useEffect` or event handler. |
| howler ^2 | Any framework or vanilla JS | No React dependency. Import and use directly. Be aware: Howler objects should be created inside `useRef` or `useMemo` to avoid re-creation on re-renders. |
| react-dropzone ^14 | React ^18 or ^19 | Uses hooks extensively. React 16.8+ minimum. |
| multer ^1 | Express ^4 | Standard Express middleware. No compatibility concerns. |
| Prisma ^5 | SQLite 3 | Prisma 5 supports SQLite via the `sqlite` provider. Schema syntax is identical across providers — migration to Postgres is a one-line config change. |

## Key Architecture Decisions

### 1. No CSS framework — scoped CSS Modules for theme system

Themes change colors, backgrounds, animation personality, and confetti patterns. A CSS framework like Tailwind would fight this because themes are dynamic data, not static utility classes. Use CSS Modules with CSS custom properties:

```css
/* theme-elegant.module.css */
.container {
  --color-primary: var(--theme-primary, #gold);
  --color-bg: var(--theme-bg, #1a1a2e);
  --animation-personality: cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

Theme data (colors, animation configs) lives in a JS config object. CSS custom properties are set on the root element via inline style, and CSS Modules scope the rest.

### 2. Animation architecture: Framer Motion variants + orchestration

The recipient experience is a sequenced animation flow. Use Framer Motion's `variants` and `AnimatePresence`:

```
Tap gift box → box open animation (2 stages: lid lift + glow reveal)
→ Sentence 1 reveals (stagger children)
→ Photo 1 transitions in
→ Sentence 2 reveals
→ ...
→ Final sentence → confetti trigger (canvas-confetti, imperative)
→ Photo gallery finale → AnimatePresence exit
```

Each stage is a Framer Motion `motion.div` with `variants` defining enter/exit states. Sequencing uses `transition.staggerChildren` and `transition.delay`. The confetti is the one imperative call — everything else is declarative.

### 3. Audio unlock flow (mobile-critical)

Mobile browsers block `AudioContext` until user gesture. The gift box tap is the natural unlock point:

```typescript
// In gift box tap handler:
const handleGiftBoxTap = () => {
  // This user gesture unlocks the AudioContext
  backgroundMusic.play();  // Howler handles AudioContext unlock internally
  tapSound.play();
  startOpenAnimation();
};
```

No need for a "click to enable audio" button — the gift box tap IS the user gesture.

### 4. Photo upload flow

```
react-dropzone (client) → validates type/size → POST /api/upload (multipart/form-data)
→ multer (server) → saves to /server/uploads/ → returns filename
→ filename stored in wish.photoUrls[] in SQLite via Prisma
→ recipient page: <img src={`/uploads/${filename}`} />
```

No base64 in the database. No cloud service. Photos are static files served by Express.

### 5. Shareable link generation

```
POST /api/wish → server generates UUID v4 → stores wish → returns { id: "abc-123", url: "/wish/abc-123" }
```

UUIDs are:
- Unguessable (no enumeration)
- No collision risk
- No central ID service needed
- Prisma's `@default(uuid())` can generate them at the DB level

## Sources

- Training data (August 2025) — framer-motion, canvas-confetti, react-dropzone, howler, react-router-dom, Prisma, multer ecosystem knowledge
- PROJECT.md — existing stack decisions (React + Vite + Express + SQLite/Prisma)
- CLAUDE.md — project conventions and existing MCP server setup
- Confidence: MEDIUM overall. Architectural choices (which library for which job) are HIGH confidence. Exact version numbers are MEDIUM confidence — not verified against live npm registry due to tool restrictions in this environment.

---
*Stack research for: Birthday Wish Generator — interactive experience app*
*Researched: 2026-06-19*
