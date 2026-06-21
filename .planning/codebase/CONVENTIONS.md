# Coding Conventions

**Analysis Date:** 2026-06-20

## File Extensions

- `.jsx` -- React components (`App.jsx`, `ExperienceOrchestrator.jsx`, `GiftBox.jsx`, etc.)
- `.js` -- Server code, hooks, utilities, and config files (`server/index.js`, `server/lib/flair.js`, `useReducedMotion.js`, `vite.config.js`)
- `.md` -- Documentation, agent definitions, and skill specs (`.claude/agents/*.md`, `.claude/skills/*/SKILL.md`)
- `.json` -- Package manifests and configuration
- `.prisma` -- Database schema (`server/prisma/schema.prisma`)
- `.ts` -- Only `server/prisma.config.ts`; all other code is plain JS (no TypeScript)

## Module System

- **ES modules throughout** -- both `client/package.json` and `server/package.json` declare `"type": "module"`
- Bare specifiers for npm packages: `import express from "express"`
- Relative imports with explicit `.js` extensions on server side: `import { getBirthdayFlair } from "./lib/flair.js"`
- Relative imports with explicit `.jsx` extensions on client side: `import CreatePage from "./pages/CreatePage.jsx"`
- Default exports for React components: `export default function App()`
- Named exports for utility functions: `export function getBirthdayFlair(month, day)`
- Named exports for hooks: `export default function useReducedMotion()`
- Mixed pattern: most hooks and components use `export default`, server utilities use named exports

## Naming Conventions

| Category | Convention | Examples |
|----------|-----------|----------|
| React components | PascalCase, default export | `CreatePage`, `ExperienceOrchestrator`, `ErrorBoundary` |
| Custom hooks | camelCase with `use` prefix | `useReducedMotion` |
| Functions | camelCase | `getBirthdayFlair`, `splitSentences`, `handlePhotoSelect` |
| Constants / Config objects | UPPER_SNAKE_CASE | `RELATIONSHIPS`, `THEMES`, `THEME_STYLES`, `EMOJIS`, `PHASE`, `ZODIAC_RANGES` |
| Animation variants | camelCase with `Variants` suffix | `senderVariants`, `happyBirthdayVariants`, `instantVariants` |
| CSS custom properties | kebab-case with semantic names | `--coral`, `--gold`, `--mint`, `--cream`, `--ink`, `--birthstone` |
| CSS classes | BEM-like with double underscore for elements | `.hero__eyebrow`, `.form__theme-btn--active`, `.reaction-bar__emoji` |
| Files (components) | PascalCase matching component name | `GiftBox.jsx`, `SentenceRevealer.jsx` |
| Files (non-component) | camelCase | `wishService.js`, `flair.js`, `prisma.js` |
| Files (config/docs) | kebab-case | `birthday-wish-style`, `framer-motion-patterns` |
| Files (server routes) | plural noun | `wishes.js`, `photos.js` |

## CSS Conventions

### Architecture
- **Single monolithic CSS file** (`client/src/index.css`, ~1248 lines)
- No CSS modules, CSS-in-JS, Tailwind, or any CSS framework
- No Sass/Less/PostCSS processors

### Custom Properties
- Defined on `:root` in `index.css` with semantic names
- Theme-aware: `WishPage.jsx` overrides `:root` vars per theme using `THEME_STYLES` map
- Five themes defined: `sunrise`, `ocean`, `lavender`, `forest`, `midnight`
- `--birthstone` is dynamically set from flair data
- Theme reset on component unmount (back to `sunrise` defaults)

### Naming
- BEM-like convention: `.block__element--modifier`
- Block-level: `.page`, `.card`, `.hero`, `.form`, `.experience`, `.gift-box`
- Elements: `.form__section-title`, `.gift-box__lid`, `.sentence-revealer__text`
- Modifiers: `.form__theme-btn--active`, `.sentence-revealer__text--final`, `.experience__happy-birthday--small`

### Layout
- `.page` wrapper with `max-width: 560px`, centered with `margin: 0 auto`
- Flexbox for single-direction layouts (`.form`, `.experience`, `.flair-chips`)
- CSS Grid for multi-column layouts (`.form__row`, `.photo-gallery__grid`, `.form__themes`)
- Responsive breakpoints at 768px and 480px via `@media` queries

### Typography
- Two font families: `"Nunito"` (body text) and `"Baloo 2"` (headings, buttons, labels)
- Heading sizes: 2.4rem (h1 hero), 2rem (success), 1.6rem (error boundary)
- Body text: 1rem, sentence reveal: 1.25-1.5rem

## Component Patterns

### Functional Components with Hooks
- **All components are functional** except `ErrorBoundary` (the one required class component in React)
- Hooks used: `useState`, `useEffect`, `useCallback`, `useRef` (no `useMemo`, `useReducer`, or `useContext`)
- No Redux, Zustand, Jotai, or any external state management library
- All state is local to the component or page that owns it
- No prop drilling beyond 2 levels -- pages hold state, pass to immediate children

### State Management Pattern
- **Page-level state**: `CreatePage` and `WishPage` hold all state for their respective views
- **State machine in ExperienceOrchestrator**: Uses `useState` with a `PHASE` constant object as a simple finite state machine (SENDER_INTRO -> GIFT_BOX -> SENTENCE -> CONFETTI -> GALLERY)
- **No global state**: no Context providers beyond React Router's `BrowserRouter`
- **Optimistic UI**: `ReactionBar` updates counts locally before the API responds, debounces heart flushes at 800ms

### Animation Patterns (from `.claude/skills/framer-motion-patterns/SKILL.md`)
- Framer Motion used extensively in experience components
- **Variants defined at module level** (not inline) to prevent re-render restarts
- `AnimatePresence mode="wait"` for sequential phase transitions
- `playCount` included in all motion keys for replay reset
- `useReducedMotion` hook checked everywhere; instant (duration:0) variants provided as fallback
- `onAnimationComplete` preferred over `setTimeout` for state transitions

### Component Organization
```
client/src/
  App.jsx                     -- Router only (3 routes)
  main.jsx                    -- Entry point (StrictMode + BrowserRouter)
  index.css                   -- All styles
  pages/
    CreatePage.jsx            -- Form page with all form state
    WishPage.jsx              -- Fetch + theme application + delegate to ExperienceOrchestrator
  components/
    ErrorBoundary.jsx         -- Class component (React requirement)
    experience/
      ExperienceOrchestrator  -- State machine, phase transitions, music init
      GiftBox                 -- Tap-to-open animated gift
      SentenceRevealer        -- Tap-to-advance sentence display
      ConfettiFinale          -- Canvas-based confetti burst
      PhotoGallery            -- Staggered photo grid
      FlairChips              -- Zodiac/birthstone/flower chips
      ReactionBar             -- Emoji reactions + heart counter
      ShareButton             -- Native share / clipboard fallback
      BackgroundMusic         -- Howl.js audio component (null render)
  hooks/
    useReducedMotion.js       -- Media query hook for prefers-reduced-motion
```

### Error Handling Patterns
- **Client-side form validation**: Inline checks in `CreatePage.generate()` throwing `Error` with user-friendly messages, caught in try/catch, displayed via `error` state
- **API error handling**: `fetch` calls check `res.ok`, parse JSON error body with `.catch(() => ({}))` fallback
- **Error boundary**: `ErrorBoundary` wraps `WishPage` route; catches render errors with `getDerivedStateFromError`
- **Server route errors**: Each Express route handler has try/catch; 400 for validation errors, 404 for not-found, 500 for internal errors
- **Server service errors**: `wishService` wraps Prisma calls in try/catch and re-throws with context messages
- **Graceful degradation**: Music loads fail silently (`onloaderror: null` the ref), confetti disabled in reduced-motion, `navigator.share` has clipboard fallback

### Data Flow
1. `CreatePage` collects form data, uploads photos via `POST /api/upload`, then creates wish via `POST /api/wish`
2. Server (`wishService.createWish`) validates, splits sentences, creates DB record, returns wish with flair
3. `WishPage` fetches wish via `GET /api/wish/:id`, applies theme CSS vars, renders `ExperienceOrchestrator`
4. `ExperienceOrchestrator` manages phase transitions; `ReactionBar` posts reactions via `POST /api/wish/:id/reactions`

## Import Order

Observed convention (not enforced by tooling):

1. **React core** (`react`, `react-dom`, `react-router-dom`)
2. **Third-party libraries** (`framer-motion`, `howler`, `canvas-confetti`)
3. **Custom hooks** (`../../hooks/useReducedMotion`)
4. **Local components** (`./GiftBox`, `./SentenceRevealer`)
5. **Server framework** (`express`, `cors`)
6. **Server utilities** (`../lib/flair.js`, `../services/wishService.js`)
7. **Node built-ins** (`path`, `fs/promises`, `crypto`, `url`)

No blank-line separators between groups. No explicit enforcement.

## Linting / Formatting

- **No linter configured**: No ESLint, Biome, or any lint tool installed or configured
- **No formatter configured**: No Prettier, dprint, or similar
- **No `.editorconfig` file**
- **No lint/format scripts** in any `package.json`
- **No pre-commit hooks** (no husky, lint-staged)
- Code style is maintained by convention and Claude Code agent reviews, not automated tooling

## Documentation

### Skills (`.claude/skills/`)
Four skill specifications define coding standards for specific domains:
- **`birthday-wish-style/SKILL.md`** -- Wish text display: sentence splitting, typography, flair chip formatting, render safety (no `dangerouslySetInnerHTML`)
- **`framer-motion-patterns/SKILL.md`** -- 8 rules for animation: stable AnimatePresence keys, `mode="wait"`, module-level variants, `onAnimationComplete` for transitions, `playCount` replay keys, `pointer-events: none` on confetti canvas, shared confetti canvas, eager Howl/deferred play
- **`photo-upload-security/SKILL.md`** -- Security rules: UUID filenames via `crypto.randomUUID()`, magic-byte validation via `file-type`, multer limits, controlled serve route with UUID regex validation, path traversal prevention
- **`ui-ux-pro-max/SKILL.md`** -- General UI/UX guidelines: accessibility, touch targets, performance, responsive design, typography

### Agents (`.claude/agents/`)
Seven agent definitions with YAML frontmatter (`name`, `description`, `tools`, `color`). Used for specialized review, debugging, verification, and security auditing tasks.

### Project Root (`CLAUDE.md`)
States that all wish display must follow `birthday-wish-style`, all photo code must follow `photo-upload-security`, all animation must follow `framer-motion-patterns`, and the 8 documented pitfalls must be reviewed before each build phase.

## Server Architecture

### Express API
- Single Express app in `server/index.js` with CORS, JSON body parsing (1mb limit)
- Route modules: `server/routes/wishes.js` (CRUD + reactions), `server/routes/photos.js` (upload + serve)
- Service layer: `server/services/wishService.js` (business logic, Prisma calls)
- Middleware: `server/middleware/upload.js` (multer config, error handler)
- Libraries: `server/lib/flair.js` (pure lookup functions), `server/lib/prisma.js` (singleton Prisma client)

### Database
- SQLite via Prisma with `@prisma/adapter-better-sqlite3`
- WAL mode and busy_timeout set via PRAGMA for concurrent access
- Four models: `Wish`, `Photo`, `Reaction`, `Stat` -- all with cascade deletes and indexes on `wishId`
- Sentences stored as serialized JSON string in `Wish.sentences`

### MCP Server
- Separate entry point `server/mcp-server.js` using `@modelcontextprotocol/sdk`
- Exposes `get_birthday_flair` tool that calls the same `lib/flair.js` functions
- Communicates over stdio transport
