# Stack Research

**Domain:** Interactive wish/gift experience web app (React SPA + Express API)
**Researched:** 2026-06-19
**Confidence:** HIGH (all versions verified via Context7 against live docs)

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | ^19.0 | UI framework | Already part of project. React 19 is stable with improved hooks and concurrent features. |
| Vite | ^5.4 | Build tool / dev server | Already part of project. Fastest HMR in the ecosystem, native ESM, excellent React plugin support. |
| TypeScript | ^5.5 | Type safety | Catches bugs at compile time for both client and server. Non-negotiable for any project with API boundaries. |
| Express | ^4.21 | HTTP server / REST API | Already part of project. Mature, minimal, well-understood. No reason to switch for this scale. |
| Prisma | ^7.8 | ORM / database toolkit | Type-safe queries, declarative schema, migration tooling. SQLite for v1 with trivial Postgres migration path. Prisma v7 confirmed to support `@default(uuid())` and `@default(uuid(7))` on String IDs across all providers. |
| SQLite | 3.x | Database | Zero-config, file-based, no server process. For v1 scale this is perfect. Use WAL mode from the start. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| framer-motion | ^12.40 | All animations: gift box open, sentence reveals, photo transitions, sparkles | Core animation engine. Handles layout animations, gestures (tap), spring physics, and exit animations. Use `LazyMotion` + `domAnimation` (~17KB) instead of full `domMax` (~29KB) for bundle optimization since this project only needs basic animation features. |
| canvas-confetti | ^1.9 | Confetti explosion on final sentence | Lightweight (no React dependency), highly customizable particle effects. Supports `particleCount`, `angle`, `spread`, `origin`, `colors`, and `shapes` per burst. Fire multiple themed bursts for the finale. |
| react-dropzone | ^15.0 | Photo upload with drag-and-drop | De-facto standard for React file uploads. Handles drag states, file type validation, size limits, preview generation. Accessible. No UI opinions -- you style it yourself. |
| react-router-dom | ^7.18 | Client-side routing: `/create` and `/wish/:id` | **Important v7 change:** Import from `"react-router"` not `"react-router-dom"`. The v6-style `BrowserRouter` + `Routes` + `Route` declarative API is fully supported (called "declarative router" mode). No need for `createBrowserRouter`/`RouterProvider` data router unless you want loaders/actions -- which this project doesn't need. |
| howler | ^2.2 | Background music and tap sound effects | Most robust cross-browser audio library. Handles auto-play policies, mobile audio unlocks, multiple concurrent sounds, sprite maps for sound effects. Prefer over native `<audio>` because mobile browsers gate audio on user gesture -- Howler manages this. |
| yet-another-react-lightbox | ^3.0 | Photo gallery finale lightbox | Clean, accessible, supports touch gestures. Lighter than PhotoSwipe's React wrapper. Optional -- only needed if gallery needs lightbox. |
| emoji-picker-react | ^4.0 | Emoji reaction picker | Complete emoji picker with search, skin tones, categories. Optional -- if the reaction set is small and fixed (e.g., 6 emojis), build a custom bar instead and skip this dependency. |
| multer | ^2.2 | Multipart file upload handling on Express | Standard Express middleware for file uploads. API is identical to v1: `upload.single()`, `upload.array()`, `upload.fields()`. Handles file size limits and field validation. |
| uuid | ^10.0 | Generate unique shareable link IDs | Cryptographically random v4 UUIDs. Note: Prisma v7 can generate UUIDs directly via `@default(uuid())` in the schema, so the `uuid` package is only needed if you generate IDs in application code. |
| concurrently | ^10.0 | Run client + server dev servers from root `npm run dev` | Simple, works. Already implied by the project setup commands. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint | Code quality | Use the Vite React TypeScript preset. Add `eslint-plugin-react-hooks` for rules-of-hooks checking. |
| Prettier | Code formatting | Consistent formatting across client and server. Configure via `.prettierrc`. |
| Prisma CLI | Database migrations | `npx prisma migrate dev` to create/apply migrations. `npx prisma studio` for visual DB inspection during development. |
| tsx | TypeScript execution for server | Run `tsx server/index.ts` for dev; compiles and executes TypeScript directly without a build step. |

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
npm install express multer @prisma/client
npm install -D prisma typescript @types/express @types/multer tsx
```

**Notes on the install list:**
- `react-router-dom@7` re-exports from `react-router` -- in your code, import from `"react-router"`, not `"react-router-dom"` (see React Router v7 section below).
- `uuid` package removed from server install -- Prisma v7's `@default(uuid())` handles ID generation at the schema level. Only add `uuid` if you need to generate UUIDs in application code outside of Prisma.
- `multer@2` API is identical to v1. All existing `upload.single()` / `upload.array()` patterns work unchanged.
- `framer-motion@12` supports `LazyMotion` for smaller bundles. Use `motion` components (not `motion.div` -- the shorthand `m.div` is available with `LazyMotion`).

**If using the full lightbox (optional):**
```bash
cd client
npm install yet-another-react-lightbox
```

**If using the full emoji picker (optional):**
```bash
cd client
npm install emoji-picker-react
```

## React Router v7 Migration Notes

React Router v7 changed the import source. Key differences from v6:

| v6 Pattern | v7 Pattern |
|------------|------------|
| `import { BrowserRouter } from "react-router-dom"` | `import { BrowserRouter } from "react-router"` |
| `import { Routes, Route } from "react-router-dom"` | `import { Routes, Route } from "react-router"` |
| `import { Link, Outlet } from "react-router-dom"` | `import { Link, Outlet } from "react-router"` |

The declarative API (`BrowserRouter` + `Routes` + `Route`) is fully supported -- no migration to `createBrowserRouter`/`RouterProvider` needed for this project.

```typescript
// client/src/App.tsx -- v7 style
import { BrowserRouter, Routes, Route } from "react-router";
import { CreatePage } from "./pages/CreatePage";
import { WishPage } from "./pages/WishPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CreatePage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/wish/:id" element={<WishPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## Prisma v7 Schema Example

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model Wish {
  id              String     @id @default(uuid())   // UUID v4, server-generated
  senderName      String
  recipientName   String
  relationship    String
  birthMonth      Int
  birthDay        Int
  message         String
  theme           String     @default("playful")
  createdAt       DateTime   @default(now())
  photos          Photo[]
  reactions       Reaction[]
  stats           WishStats?
}

model Photo {
  id        String  @id @default(uuid())
  wishId    String
  wish      Wish    @relation(fields: [wishId], references: [id])
  filename  String
  order     Int
}

model Reaction {
  id        String   @id @default(uuid())
  wishId    String
  wish      Wish     @relation(fields: [wishId], references: [id])
  emoji     String
  count     Int      @default(1)
  timestamps String  @default("[]")  // JSON array, or use a separate ReactionEvent model
}

model WishStats {
  wishId        String    @id
  wish          Wish      @relation(fields: [wishId], references: [id])
  openCount     Int       @default(0)
  lastOpenedAt  DateTime?
}
```

## Framer Motion v12 Bundle Optimization

Framer Motion v12 offers `LazyMotion` for smaller bundles. This project only needs basic DOM animations (opacity, scale, position), so use the lighter `domAnimation` feature set:

```typescript
import { LazyMotion, domAnimation, m } from "framer-motion";

function App() {
  return (
    <LazyMotion features={domAnimation}>
      {/* m.div, m.button, etc. instead of motion.div */}
      <m.div animate={{ opacity: 1 }} />
    </LazyMotion>
  );
}
```

This reduces the Framer Motion bundle from ~29KB to ~17KB. Use `domMax` only if you later need layout animations, drag gestures, or `AnimatePresence` with complex exit animations.

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| framer-motion | react-spring | react-spring has better physics for complex spring chains, but framer-motion has better gesture handling, layout animations, and a simpler API for the UX patterns in this app (tap-to-animate, sequential reveals, enter/exit transitions). |
| framer-motion | CSS animations + transitions | CSS-only is fine for simple hover effects. Completely inadequate for the gift box open (multi-stage), sequential sentence reveals (stagger + orchestration), and gesture-driven animations this app requires. |
| canvas-confetti | react-confetti | react-confetti is simpler (just `<Confetti>`), but gives less control over particle behavior. canvas-confetti lets you fire multiple bursts with different colors per theme, control spread angle, and trigger from specific screen positions -- all needed for a polished finale. |
| howler | use-sound | use-sound is a thin React hook wrapper around Howler. Use it if you want the hook API, but import Howler directly for more control over audio sprites and mobile unlock flows. |
| howler | Native `<audio>` element | Native audio is fine for a single track with basic play/pause. Fails on mobile where browsers require user gesture before playing audio -- Howler's auto-unlock handles this. Also breaks when you need to play a tap sound + background music simultaneously (two `<audio>` elements have unpredictable behavior). |
| react-dropzone | Uppy | Uppy is a full upload framework with dashboard UI, tus resumable uploads, and S3 integration. Massive overkill for 1-5 photos under 5MB each. react-dropzone is 15KB and does exactly what's needed. |
| multer | formidable / busboy | multer is built on busboy and adds Express middleware ergonomics. formidable is lower-level. multer v2 API is identical to v1. |
| uuid | nanoid | nanoid is smaller and URL-safe by default. Both work. With Prisma v7's `@default(uuid())`, neither package is needed for ID generation -- the schema handles it. Only add one if you need programmatic UUID generation outside the DB. |
| Prisma + SQLite | better-sqlite3 (raw) | Raw SQL is faster but loses type safety, migration tooling, and the Postgres migration path. Prisma is worth the overhead for a project that may grow. |
| yet-another-react-lightbox | PhotoSwipe | PhotoSwipe is excellent but heavier and its React wrappers are community-maintained with varying quality. yarl is purpose-built for React with first-class TypeScript support. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| GSAP (GreenSock) | Powerful but imperative API that fights React's declarative model. Requires refs, manual cleanup, and `useLayoutEffect` gymnastics. Overkill for the animation complexity here. | framer-motion |
| React Spring alone | Excellent physics, weaker gesture and layout animation support. The gift box open involves a tap gesture triggering a multi-stage animation -- framer-motion's gesture + animate combo is cleaner. | framer-motion (or framer-motion + react-spring if complex spring chains are needed later) |
| react-audio-player | Thin wrapper around `<audio>` with no mobile unlock, no multi-sound support, no sprite maps. | howler |
| Cloudinary / Uploadcare / S3 (for v1) | Adds service dependency, cost, complexity, and latency for something that can be a local folder + Express static serving. Premature optimization. | multer + filesystem (swap to S3 in a later phase if scale demands it) |
| Redux / Zustand / Jotai | State management libraries for a two-page app with no shared complex state. A wish form's state lives in component state or a single `useReducer`. The recipient page is read-only display. | React `useState` / `useReducer` |
| Next.js | SSR/SSG framework. This app is a SPA with two client-rendered routes. Next.js adds routing complexity, server component mental model overhead, and deployment constraints for zero benefit here. | Vite + React (SPA) |
| Tailwind CSS / MUI / Chakra | Full CSS framework for a heavily bespoke animated experience. The gift box, confetti, sparkles, and theme system need custom CSS/scoped styles. A framework adds constraints without solving the hard problems. | Plain CSS or CSS Modules (already scaffolded by Vite) |
| Socket.io / WebSockets | Real-time bidirectional communication. The birthday person opens a link and experiences a pre-rendered wish -- no live collaboration, no chat, no real-time sync. | REST (GET /api/wish/:id, POST /api/wish/:id/reactions) |

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| framer-motion ^12.40 | React ^18.0 or ^19.0 | Framer Motion 12 requires React 18+. Supports LazyMotion for bundle optimization. |
| react-router-dom ^7.18 | React ^18 or ^19 | **Import from `"react-router"` not `"react-router-dom"`.** Declarative BrowserRouter/Routes/Route API fully supported. |
| canvas-confetti ^1.9 | Any framework or vanilla JS | No React dependency. Call from `useEffect` or event handlers. |
| howler ^2.2 | Any framework or vanilla JS | No React dependency. Create instances inside `useRef` to avoid re-creation on re-renders. |
| react-dropzone ^15.0 | React ^18 or ^19 | Uses hooks extensively. React 16.8+ minimum. |
| multer ^2.2 | Express ^4 | API identical to multer v1. `upload.single()`, `upload.array()`, `upload.fields()` unchanged. |
| Prisma ^7.8 | SQLite 3 | `@default(uuid())` confirmed working on String ID fields. Provider-agnostic -- swap to PostgreSQL with one config line. |
| concurrently ^10.0 | Any Node.js project | Process runner. No framework coupling. |

## Key Architecture Decisions

### 1. No CSS framework -- scoped CSS Modules for theme system

Themes change colors, backgrounds, animation personality, and confetti patterns. A CSS framework like Tailwind would fight this because themes are dynamic data, not static utility classes. Use CSS Modules with CSS custom properties:

```css
/* theme-elegant.module.css */
.container {
  --color-primary: var(--theme-primary, #C9A96E);
  --color-bg: var(--theme-bg, #1a1a2e);
  --animation-personality: cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

Theme data (colors, animation configs) lives in a JS config object. CSS custom properties are set on the root element via inline style, and CSS Modules scope the rest.

### 2. Animation architecture: Framer Motion variants + orchestration

The recipient experience is a sequenced animation flow. Use Framer Motion's `variants` and `AnimatePresence`:

```
Tap gift box -> box open animation (2 stages: lid lift + glow reveal)
-> Sentence 1 reveals (stagger children)
-> Photo 1 transitions in
-> Sentence 2 reveals
-> ...
-> Final sentence -> confetti trigger (canvas-confetti, imperative)
-> Photo gallery finale -> AnimatePresence exit
```

Each stage is a Framer Motion `motion.div` with `variants` defining enter/exit states. Sequencing uses `transition.staggerChildren` and `transition.delay`. The confetti is the one imperative call -- everything else is declarative.

Use `LazyMotion` + `domAnimation` for the smaller ~17KB bundle. Only switch to `domMax` if layout animations or drag gestures become needed.

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

No need for a "click to enable audio" button -- the gift box tap IS the user gesture.

### 4. Photo upload flow

```
react-dropzone (client) -> validates type/size -> POST /api/upload (multipart/form-data)
-> multer (server) -> saves to /server/uploads/ -> returns filename
-> filename stored in wish.photos[] in SQLite via Prisma
-> recipient page: <img src={`/uploads/${filename}`} />
```

No base64 in the database. No cloud service. Photos are static files served by Express.

### 5. Shareable link generation via Prisma @default(uuid())

```
POST /api/wish -> server creates via Prisma -> UUID v4 generated at DB level -> returns { id, url: "/wish/:id" }
```

UUIDs are:
- Unguessable (no enumeration)
- No collision risk
- No central ID service needed
- Generated by Prisma v7's `@default(uuid())` -- no `uuid` package needed

## Sources

- **Context7 (verified 2026-06-19):** framer-motion v12.40.0, canvas-confetti v1.9.4, react-dropzone v15.0.0, howler v2.2.4, react-router-dom v7.18.0, Prisma v7.8.0, multer v2.2.0, concurrently v10.0.3
- **PROJECT.md** -- existing stack decisions (React + Vite + Express + SQLite/Prisma)
- **CLAUDE.md** -- project conventions and existing MCP server setup
- **Confidence: HIGH** -- all versions verified against live Context7 documentation. API-compatibility confirmations (React Router v7 declarative API, Prisma v7 uuid() default, multer v2 API stability) cross-checked via Context7 docs queries.

---
*Stack research for: Birthday Wish Generator -- interactive experience app*
*Researched: 2026-06-19*
*Last verified: 2026-06-19 (Context7)*
