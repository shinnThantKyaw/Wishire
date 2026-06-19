# Architecture Research

**Domain:** Interactive web greeting experience app (SPA + REST API)
**Researched:** 2026-06-19
**Confidence:** HIGH

## Standard Architecture

Interactive web greeting/experience apps follow a **Creator-Consumer split** where two distinct frontend flows share one backend. This is the same pattern used by digital invitation platforms, interactive storytelling apps, and unlisted-content sharing tools. The architecture is a content-creation-to-consumption pipeline with animation orchestration on the consumer side.

### System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Vite + React 18)                      │
├───────────────────────────────┬──────────────────────────────────────┤
│       CREATOR FLOW            │          CONSUMER FLOW                │
│  Route: /create               │  Route: /wish/:id                    │
│                               │                                      │
│  ┌─────────────────────┐      │  ┌──────────────────────────────┐    │
│  │  CreateWishPage      │      │  │  ViewWishPage                │    │
│  │  - WishForm          │      │  │  - ExperienceOrchestrator    │    │
│  │  - PhotoUploader     │      │  │    (useReducer state machine)│    │
│  │  - ThemePicker       │      │  │  - GiftBox                  │    │
│  │  - PreviewPanel      │      │  │  - SentenceRevealer         │    │
│  └──────────┬───────────┘      │  │  - ConfettiFinale           │    │
│             │                  │  │  - PhotoGallery             │    │
│    POST /api/wish              │  │  - ReactionBar              │    │
│    POST /api/upload            │  │  - BackgroundMusic          │    │
│    GET /api/wish/:id/stats     │  │  - FlairChips               │    │
│             │                  │  └──────────────┬───────────────┘    │
│             │                  │                 │                    │
│             │                  │    GET /api/wish/:id                 │
│             │                  │    POST /api/wish/:id/reactions      │
├─────────────┴──────────────────┴─────────────────┴────────────────────┤
│                    EXPRESS REST API (server/)                          │
│                                                                        │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐    │
│  │ wishRoutes        │  │ photoRoutes      │  │ flairRoutes      │    │
│  │ POST /api/wish    │  │ POST /api/upload │  │ GET /api/flair   │    │
│  │ GET /:id          │  │ GET /uploads/:fn │  │                  │    │
│  │ POST /:id/reactions│ │                  │  │                  │    │
│  │ GET /:id/stats    │  │                  │  │                  │    │
│  └────────┬──────────┘  └────────┬─────────┘  └──────────────────┘    │
│           │                      │                                     │
│      Prisma Client          Multer (disk)                              │
│           │                      │                                     │
├───────────┴──────────────────────┴────────────────────────────────────┤
│                        DATA LAYER                                      │
│  ┌─────────────────────────┐   ┌─────────────────────────┐            │
│  │  SQLite (via Prisma)    │   │  server/uploads/        │            │
│  │  ┌───────────────────┐  │   │  <uuid>-<originalname>  │            │
│  │  │ Wish              │  │   │                         │            │
│  │  │ Photo (paths in DB)│  │   │  Static file serving   │            │
│  │  │ Reaction          │  │   │  via express.static     │            │
│  │  │ ViewEvent         │  │   │                         │            │
│  │  └───────────────────┘  │   └─────────────────────────┘            │
│  └─────────────────────────┘                                          │
└──────────────────────────────────────────────────────────────────────┘
```

### Component Boundaries

| Component | Layer | Responsibility | Communicates With |
|-----------|-------|---------------|-------------------|
| `CreateWishPage` | Client route | Form orchestration: collects message, photos, theme; submits wish | WishForm, PhotoUploader, ThemePicker, PreviewPanel |
| `WishForm` | Client component | Text inputs: recipient name, relationship, birth month/day, sender name, free-text message | CreateWishPage (lifts state up) |
| `PhotoUploader` | Client component | Drag/drop or file pick, client-side validation (max 5 files, max 5MB each), thumbnail previews | POST /api/upload via FormData |
| `ThemePicker` | Client component | Renders theme option tiles, applies selected theme to live preview | CreateWishPage (lifts selected theme up) |
| `PreviewPanel` | Client component | Post-submission view: rendered wish preview, copy-link button, open-link button | API response from POST /api/wish |
| `ViewWishPage` | Client route | Top-level experience orchestrator: fetches wish data, manages animation state machine | GET /api/wish/:id, all experience sub-components |
| `ExperienceOrchestrator` | Client component | State machine (useReducer): IDLE -> GIFT_BOX -> UNWRAPPING -> SENTENCE -> CONFETTI -> GALLERY -> REACTIONS | ViewWishPage, all animation components |
| `GiftBox` | Client component | Animated gift box with tap-to-open gesture, plays opening sound effect | ExperienceOrchestrator (dispatches TAP_GIFT) |
| `SentenceRevealer` | Client component | Reveals sentences one at a time on tap, with staggered fade-in transitions | ExperienceOrchestrator (dispatches TAP_NEXT) |
| `ConfettiFinale` | Client component | Canvas-confetti explosion + sparkles + "Happy Birthday!" text animation | ExperienceOrchestrator (triggers on last sentence) |
| `PhotoGallery` | Client component | Grid/lightbox display of all uploaded photos with entrance animations | photo URLs from wish data |
| `ReactionBar` | Client component | Emoji reaction picker + multi-tap heart counter, optimistic UI updates | POST /api/wish/:id/reactions |
| `BackgroundMusic` | Client component | Ambient music playback, persists across phase transitions | AudioContext (unlocked on first tap) |
| `FlairChips` | Client component | Displays zodiac sign, birthstone, birth flower as styled pills | Flair data embedded in wish response |
| `ThemeProvider` | Client component | Merges selected theme config + flair accents into CSS custom properties on wrapper div | Theme definitions, flair data |
| `wishRoutes` | Server route | CRUD for wishes: create, read, react, stats | Prisma Client, wishService |
| `photoRoutes` | Server route | Multer-based file upload, static file serving | Multer middleware, filesystem |
| `flairRoutes` | Server route | Birthday flair lookup (zodiac, birthstone, birth flower) | lib/flair.js (in-memory) |
| `wishService` | Server service | Business logic: input validation, ID generation, sentence splitting, DB operations | Prisma Client |
| `statsService` | Server service | View tracking (recordView), reaction aggregation, stats queries | Prisma Client |
| Prisma Client | Data layer | Type-safe database access, schema migrations, query building | SQLite |

## Recommended Project Structure

```
birthday-wish-generator/
├── client/                            # Vite + React 18 SPA
│   ├── src/
│   │   ├── main.jsx                   # ReactDOM.createRoot + RouterProvider
│   │   ├── App.jsx                    # <Routes> with layout route, theme wrapper
│   │   ├── index.css                  # Global styles, CSS custom property definitions
│   │   ├── routes/
│   │   │   ├── CreateWish.jsx         # /create — generator form page
│   │   │   ├── ViewWish.jsx           # /wish/:id — consumer experience page
│   │   │   └── WishStats.jsx          # /wish/:id/stats — generator stats page
│   │   ├── components/
│   │   │   ├── create/
│   │   │   │   ├── WishForm.jsx           # Name, relationship, birth date, message fields
│   │   │   │   ├── PhotoUploader.jsx       # File input, drag/drop zone, preview grid
│   │   │   │   ├── ThemePicker.jsx         # Theme selection cards
│   │   │   │   └── PreviewPanel.jsx        # Post-submit preview + share buttons
│   │   │   ├── experience/
│   │   │   │   ├── ExperienceOrchestrator.jsx  # State machine for unwrap flow
│   │   │   │   ├── GiftBox.jsx                 # Animated 3D-ish gift box
│   │   │   │   ├── SentenceRevealer.jsx        # One-at-a-time sentence display
│   │   │   │   ├── ConfettiFinale.jsx          # Canvas confetti + sparkles
│   │   │   │   ├── PhotoGallery.jsx            # Final photo grid
│   │   │   │   ├── ReactionBar.jsx             # Emoji reactions + heart counter
│   │   │   │   ├── BackgroundMusic.jsx         # Audio playback with Howler
│   │   │   │   └── FlairChips.jsx              # Zodiac/birthstone/flower display
│   │   │   └── shared/
│   │   │       ├── LoadingSpinner.jsx
│   │   │       └── ErrorBanner.jsx
│   │   ├── hooks/
│   │   │   ├── useWish.js              # Fetch wish data (GET /api/wish/:id)
│   │   │   ├── useReactions.js         # Post reactions + optimistic updates
│   │   │   ├── usePhotoUpload.js       # Upload logic + progress tracking
│   │   │   └── useExperienceState.js   # useReducer wrapper around experience machine
│   │   ├── lib/
│   │   │   ├── api.js                  # fetch wrapper with base URL + error handling
│   │   │   ├── experience-machine.js   # Pure state machine: states, transitions, reducer
│   │   │   └── themes.js               # Theme definitions (colors, animations, confetti config)
│   │   └── assets/
│   │       ├── sounds/
│   │       │   └── gift-box-open.mp3
│   │       └── images/
│   │           └── confetti-particles.svg
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/
│   ├── index.js                        # Express app: middleware, route mounting, listen
│   ├── routes/
│   │   ├── wish.js                     # Wish CRUD routes
│   │   ├── photos.js                   # Upload + static file serving
│   │   ├── reactions.js                # Reaction submission endpoint
│   │   └── flair.js                    # Flair lookup endpoint
│   ├── middleware/
│   │   ├── upload.js                   # Multer configuration (disk storage, limits)
│   │   └── errorHandler.js             # Centralized error response formatting
│   ├── services/
│   │   ├── wishService.js              # Wish creation/retrieval business logic
│   │   └── statsService.js             # View tracking + reaction aggregation
│   ├── lib/
│   │   └── flair.js                    # Existing zodiac/birthstone/flower lookup
│   ├── prisma/
│   │   └── schema.prisma               # Database schema
│   ├── uploads/                        # Photo storage directory (gitignored)
│   └── package.json
├── package.json                        # Root: concurrently for dev
└── CLAUDE.md
```

### Structure Rationale

- **`client/src/routes/`** — Page-level components that map 1:1 to React Router routes. Each route owns its entire page layout. Keeps the router definition clean and components focused on a single responsibility.
- **`client/src/components/create/` vs `components/experience/`** — The two flows (creator and consumer) are distinct enough to warrant separate directories. They share no component instances; only hooks and API utilities are shared.
- **`client/src/hooks/`** — Data fetching and mutation logic lives in custom hooks, not in components. Components receive data as props and call mutation functions. This separation makes components testable without mocking fetch.
- **`client/src/lib/experience-machine.js`** — The experience state machine is extracted as a pure module (no React imports) so it can be unit tested independently. `useExperienceState` wraps it into a React hook.
- **`server/routes/` vs `server/services/`** — Routes handle HTTP concerns (parsing request, sending status codes, formatting response). Services handle business logic and database operations. This separation makes services reusable if we later add a WebSocket endpoint, CLI tool, or background job.
- **`server/middleware/upload.js`** — Multer config is isolated so photo upload settings (size limits, file count, destination path, filename strategy) are in one place.

## Architectural Patterns

### Pattern 1: State Machine for Multi-Step Experiences

**What:** The interactive unwrap experience is modeled as an explicit finite state machine with defined states, transitions, and guards. Each state maps to a specific UI configuration.

**When to use:** Any experience with sequential steps that depend on user interaction (taps) or animation completion, where the next state depends strictly on the current state.

**Trade-offs:** More upfront structure than ad-hoc `useState` flags, but eliminates impossible states (e.g., "showing confetti while gift box is still closed") and makes the entire flow trivially debuggable and replayable.

**States for the birthday wish experience:**

```
IDLE ──(data loaded)──> GIFT_BOX
GIFT_BOX ──(user taps)──> UNWRAPPING (animation plays)
UNWRAPPING ──(animation complete)──> SENTENCE (sentenceIndex=0)
SENTENCE ──(user taps, more sentences)──> SENTENCE (sentenceIndex+1)
SENTENCE ──(user taps, last sentence)──> CONFETTI
CONFETTI ──(animation complete)──> GALLERY
GALLERY ──(auto or user taps)──> REACTIONS
REACTIONS ──(user taps replay)──> GIFT_BOX (full reset)
```

**Example:**
```javascript
// lib/experience-machine.js — pure module, zero React imports
export const STATES = {
  IDLE: 'IDLE',
  GIFT_BOX: 'GIFT_BOX',
  UNWRAPPING: 'UNWRAPPING',
  SENTENCE: 'SENTENCE',
  CONFETTI: 'CONFETTI',
  GALLERY: 'GALLERY',
  REACTIONS: 'REACTIONS',
};

export const EVENTS = {
  DATA_LOADED: 'DATA_LOADED',
  TAP_GIFT: 'TAP_GIFT',
  UNWRAP_DONE: 'UNWRAP_DONE',
  TAP_NEXT: 'TAP_NEXT',
  CONFETTI_DONE: 'CONFETTI_DONE',
  GALLERY_DONE: 'GALLERY_DONE',
  TAP_REPLAY: 'TAP_REPLAY',
};

export function experienceReducer(state, action) {
  switch (state.status) {
    case STATES.IDLE:
      return action.type === EVENTS.DATA_LOADED
        ? { status: STATES.GIFT_BOX }
        : state;

    case STATES.GIFT_BOX:
      return action.type === EVENTS.TAP_GIFT
        ? { status: STATES.UNWRAPPING }
        : state;

    case STATES.UNWRAPPING:
      return action.type === EVENTS.UNWRAP_DONE
        ? { status: STATES.SENTENCE, sentenceIndex: 0 }
        : state;

    case STATES.SENTENCE: {
      if (action.type !== EVENTS.TAP_NEXT) return state;
      const nextIdx = state.sentenceIndex + 1;
      return nextIdx < action.totalSentences
        ? { status: STATES.SENTENCE, sentenceIndex: nextIdx }
        : { status: STATES.CONFETTI };
    }

    case STATES.CONFETTI:
      return action.type === EVENTS.CONFETTI_DONE
        ? { status: STATES.GALLERY }
        : state;

    case STATES.GALLERY:
      return action.type === EVENTS.GALLERY_DONE
        ? { status: STATES.REACTIONS }
        : state;

    case STATES.REACTIONS:
      return action.type === EVENTS.TAP_REPLAY
        ? { status: STATES.GIFT_BOX }
        : state;

    default:
      return state;
  }
}
```

### Pattern 2: Animation Sequencing with `AnimatePresence`

**What:** Wrap each experience phase in `<AnimatePresence mode="wait">` with unique React keys to ensure smooth enter/exit transitions between phases. Use Framer Motion `onAnimationComplete` callbacks to dispatch state transitions.

**When to use:** Any flow where components mount/unmount across phases and you need coordinated exit-before-enter transitions.

**Trade-offs:** `mode="wait"` ensures the exiting animation completes before the entering one starts — slower but prevents layout jumping. Desirable for the unwrap experience where phases should feel deliberate, not rushed.

**Example:**
```jsx
// Inside ExperienceOrchestrator
import { AnimatePresence, motion } from 'framer-motion';

function ExperienceOrchestrator({ wish }) {
  const [phase, dispatch] = useReducer(experienceReducer, { status: 'IDLE' });

  useEffect(() => {
    if (wish) dispatch({ type: 'DATA_LOADED' });
  }, [wish]);

  return (
    <AnimatePresence mode="wait">
      {phase.status === 'GIFT_BOX' && (
        <motion.div key="gift-box"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.2, opacity: 0 }}
        >
          <GiftBox onTap={() => dispatch({ type: 'TAP_GIFT' })} />
        </motion.div>
      )}

      {phase.status === 'SENTENCE' && (
        <motion.div key={`sentence-${phase.sentenceIndex}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
        >
          <SentenceRevealer
            text={wish.sentences[phase.sentenceIndex]}
            photo={wish.photos?.[phase.sentenceIndex]}
            onTap={() => dispatch({
              type: 'TAP_NEXT',
              totalSentences: wish.sentences.length,
            })}
          />
        </motion.div>
      )}
      {/* ... other phases ... */}
    </AnimatePresence>
  );
}
```

### Pattern 3: CSS Custom Properties for Theming

**What:** Theme data (colors, fonts, animation parameters) stored in JS config objects. Applied via CSS custom properties on a wrapper element. Flair data (birthstone color, zodiac) merged into the theme at render time.

**When to use:** Dynamic theming across multiple components without a CSS-in-JS runtime or Tailwind plugin.

**Why:** CSS custom properties cascade naturally to all descendants. Changing theme is a single `style` attribute update. Animation keyframes can reference `var(--animation-curve)` for theme-aware motion. No re-renders needed for style changes.

**Example:**
```javascript
// themes.js
export const themes = {
  elegant: {
    colors: { primary: '#C9A96E', bg: '#1A1A2E', accent: '#E8D5B7', text: '#F5F0E8' },
    animation: { curve: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', giftBoxStyle: 'classic' },
    confetti: { colors: ['#C9A96E', '#E8D5B7', '#FFFFFF'], particleCount: 150 },
  },
  playful: {
    colors: { primary: '#FF6B6B', bg: '#FFF5E1', accent: '#4ECDC4', text: '#2D3436' },
    animation: { curve: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', giftBoxStyle: 'bouncy' },
    confetti: { colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF'], particleCount: 200 },
  },
};

// ThemeProvider — merges theme + flair into CSS custom properties
function ThemeProvider({ theme, flair, children }) {
  const vars = {
    '--color-primary': theme.colors.primary,
    '--color-bg': theme.colors.bg,
    '--color-accent': theme.colors.accent,
    '--color-text': theme.colors.text,
    '--color-birthstone': flair?.birthstoneColor || theme.colors.accent,
    '--animation-curve': theme.animation.curve,
  };
  return <div style={vars}>{children}</div>;
}
```

### Pattern 4: Optimistic UI for Reactions

**What:** When a user taps an emoji reaction or the heart button, immediately update the UI (increment count, highlight selection) before the API call completes. If the API fails, roll back to the previous state.

**When to use:** Any UI action where perceived latency degrades the experience. Tapping hearts should feel instantaneous for a playful experience.

**Trade-offs:** Adds complexity around rollback logic. For a v1 app without accounts, a lost reaction is negligible (user taps again). The upside (instant feedback) significantly enhances the playful feel.

**Example:**
```javascript
// hooks/useReactions.js
export function useReactions(wishId, initialReactions = {}) {
  const [reactions, setReactions] = useState(initialReactions);

  async function addReaction(emoji) {
    const previous = reactions;
    setReactions(prev => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }));

    try {
      await api.post(`/api/wish/${wishId}/reactions`, { emoji });
    } catch {
      setReactions(previous); // rollback
    }
  }

  return { reactions, addReaction };
}
```

### Pattern 5: Image Preloading Before Animation

**What:** Preload all photos when the recipient page loads, before the gift box is tapped. Uses the browser's `Image` constructor to eagerly fetch all photo URLs into cache.

**When to use:** Photos that appear during a sequenced animation where loading spinners would break the magic.

**Why:** If photos load lazily during the reveal, the animation stutters or shows placeholders. Preloading ensures photos render instantly when their reveal moment arrives.

```javascript
function useImagePreloader(urls) {
  const [allLoaded, setAllLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!urls?.length) { setAllLoaded(true); return; }

    Promise.all(urls.map(url => new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    })))
      .then(() => { if (!cancelled) setAllLoaded(true); })
      .catch(() => { if (!cancelled) setAllLoaded(true); }); // proceed even if some fail

    return () => { cancelled = true; };
  }, [urls]);

  return allLoaded;
}
```

### Pattern 6: Audio Unlock via First User Gesture

**What:** Initialize all Howler sounds eagerly, but defer `play()` until the first user gesture (gift box tap). Modern browsers require a user gesture before playing audio. The gift box tap is the natural unlock point.

**When to use:** Any web app with background audio, especially on mobile.

**Why:** No separate "enable audio" button needed. The experience starts silent, and audio kicks in naturally when the user interacts.

## Data Flow

### Wish Creation Flow

```
Generator fills form:
  - Recipient name, relationship, birth month/day
  - Sender name
  - Free-text wish message
  - 1-5 photos (each <= 5MB)
  - Selected theme

    │
    ▼
[CreateWishPage] orchestrates submission in sequence:
    │
    ├── Step 1: Upload photos (if any selected)
    │     For each photo:
    │       POST /api/upload  (multipart/form-data)
    │       ← { url: "/uploads/abc-123.jpg", originalName: "..." }
    │     Collect all returned URLs into photoUrls array.
    │
    └── Step 2: Create wish
          POST /api/wish
          Body: { recipientName, relationship, birthMonth, birthDay,
                  senderName, message, theme, photoUrls }
          │
          ▼
      [wishRoutes] → [wishService.createWish()]
          │
          ├── Validates required fields
          ├── Generates unique slug with nanoid (21 chars, URL-safe)
          ├── Splits message into sentences (split on . ! ? followed by space)
          ├── Creates Wish row in SQLite via Prisma
          ├── Creates Photo rows (one per photoUrl, with order index)
          ├── Creates initial WishStats row (openCount=0)
          └── Returns: { id, slug, shareUrl: "/wish/<slug>", sentences, photos, theme, flair }
          │
          ▼
      ← Response to client
          │
          ▼
[PreviewPanel] renders wish preview with:
  - "Copy Link" button (copies /wish/<slug> to clipboard)
  - "Open Link" button (opens /wish/<slug> in new tab)
```

### Wish Viewing Flow

```
Recipient opens shared link: /wish/<slug>

    │
    ▼
[ViewWishPage] mounts → useWish(slug) fires
    │
    ▼
GET /api/wish/:slug
    │
    ▼
[wishRoutes] → [wishService.getWish(slug)]
    │
    ├── Prisma findUnique: Wish + include Photos (orderBy: order)
    ├── [statsService.recordView(slug)] — inserts ViewEvent row in background
    ├── Flair lookup from birthMonth/birthDay
    └── Response: { id, senderName, recipientName, sentences[], photos[],
                     theme, flair, reactions }
    │
    ▼
[ViewWishPage] receives data:
    │
    ├── ThemeProvider wraps page with theme CSS custom properties
    ├── useImagePreloader(photos.map(p => p.url)) — preload all photos
    ├── BackgroundMusic initializes (silent until first gesture)
    ├── ExperienceOrchestrator receives wish data
    │
    ▼
[Experience Sequence]
    │
    STATE: GIFT_BOX
    │   Renders GiftBox component. "A birthday wish from {senderName}"
    │   User taps → TAP_GIFT dispatched
    │
    STATE: UNWRAPPING
    │   Gift box opening animation plays (Framer Motion)
    │   Audio: soft gift-open sound effect
    │   On complete → UNWRAP_DONE dispatched
    │
    STATE: SENTENCE (index 0..N)
    │   SentenceRevealer shows current sentence with fade-in
    │   If photo exists at this index: photo fades in beside/behind text
    │   User taps → TAP_NEXT dispatched
    │   If last sentence → moves to CONFETTI
    │
    STATE: CONFETTI
    │   ConfettiFinale triggers canvas-confetti
    │   "Happy Birthday!" text animation
    │   Sparkle particles
    │   On animation complete → CONFETTI_DONE dispatched
    │
    STATE: GALLERY
    │   PhotoGallery shows all photos in grid with entrance animations
    │   Auto-transitions after 5s or user taps → GALLERY_DONE dispatched
    │
    STATE: REACTIONS
    │   ReactionBar appears with emoji set + heart button
    │   User taps emoji → addReaction(emoji) → optimistic UI update
    │   "Replay" button → TAP_REPLAY dispatched → resets to GIFT_BOX
```

### Reaction Tracking Flow

```
User taps emoji on ReactionBar
    │
    ▼
[useReactions.addReaction(emoji)]
    │
    ├── Optimistic update: increment local count immediately
    │
    ├── POST /api/wish/:slug/reactions
    │     Body: { emoji: "❤️", timestamp: "..." }
    │     │
    │     ▼
    │   [wishService.addReaction(slug, emoji)]
    │     │
    │     ├── Upsert Reaction row (emoji + slug composite key)
    │     ├── Increment count
    │     └── Return updated reaction counts
    │
    └── On error: rollback local count to previous value
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Animation Logic Inside Components

**What:** Scattered `useEffect` chains with `setTimeout` and `setState` across multiple components to sequence animations.

**Why bad:** Impossible to debug — timers fire in unpredictable order. Race conditions between animation completion and state updates. Cannot cleanly reset for replay. Timer-based sequencing breaks on slow devices or when tab is backgrounded.

**Instead:** Centralized state machine (useReducer) in ExperienceOrchestrator, with Framer Motion `onAnimationComplete` callbacks dispatching state transitions. No setTimeout for animation sequencing.

### Anti-Pattern 2: Base64 Photos in the Database

**What:** Storing uploaded photos as base64-encoded strings in SQLite.

**Why bad:** 5 photos x 5MB = 25MB of binary, which becomes ~33MB of base64 text. SQLite performance degrades with large text fields. Every API response that includes wish data sends all photo bytes — massive payloads. Browsers cannot cache base64 data URIs across page loads.

**Instead:** Photos on filesystem (`server/uploads/`), relative paths in database. Express serves them as static files via `express.static`. Browsers cache the static file responses. Migration path to S3/CDN is trivial (just change the URL prefix).

### Anti-Pattern 3: Sequential Integer IDs for Shareable Links

**What:** Using Prisma's default `@id @default(autoincrement())` and exposing it in URLs (`/wish/1`, `/wish/2`).

**Why bad:** Anyone can iterate through IDs and view all wishes. This undermines the "personal, private wish" value proposition. Sequential IDs leak wish creation volume.

**Instead:** Generate a cryptographically random slug on the server. Use `nanoid(21)` or `crypto.randomUUID()`. Store as a separate `slug` field with a unique index. Internal primary key can still be autoincrement (never exposed).

### Anti-Pattern 4: CSS @keyframes for Complex Sequences

**What:** Writing CSS keyframe animations for the gift box opening, sentence reveals, and photo transitions.

**Why bad:** CSS keyframes cannot be sequenced in relation to each other (no "when X finishes, start Y"). Cannot be interrupted for replay. Cannot respond to user tap gestures with variable timing.

**Instead:** Framer Motion for all sequenced and interactive animations. CSS transitions only for simple hover/focus states. Use Framer Motion's `onAnimationComplete` to advance the state machine.

### Anti-Pattern 5: Single Giant Experience Component

**What:** Putting the entire unwrap experience (gift box, sentences, confetti, gallery, reactions) into one `ViewWish.jsx` with dozens of `useState` booleans.

**Why bad:** Impossible to test individual phases. State management becomes a web of boolean flags (`showGiftBox`, `giftBoxOpened`, `currentSentence`, `showConfetti`, `confettiDone`, `showGallery`). Many combinations are invalid but not prevented.

**Instead:** Phase-specific components driven by the state machine. Each component receives only the data it needs and a dispatch callback. Test each phase component in isolation with mock state.

## Scalability Considerations

| Concern | At 100 wishes | At 10K wishes | At 1M wishes |
|---------|--------------|--------------|-------------|
| Photo storage | Filesystem + Express static serving. Fine. | Filesystem still fine. Monitor disk usage. | Migrate to S3-compatible (R2, S3). Swap Express static route for signed URLs. Prisma schema unchanged — still stores paths. |
| Database | SQLite handles 100 rows trivially. | SQLite handles 10K rows easily. Add indexes on slug and createdAt. | Migrate to PostgreSQL. Prisma provider swap is one config line. Schema designed for compatibility. |
| API throughput | Single Express process. Fine. | Single Express process fine for this read/write ratio. | Add load balancer + multiple instances. SQLite won't work — PG migration required. |
| Bandwidth (photos) | Express serves directly. Fine. | Add CDN in front (Cloudflare/CloudFront). Cache static `/uploads/*` at edge. | CDN required. Photos dominate bandwidth costs. |
| Bundle size | Vite code-splits by route. Fine. | Fine. Lazy-load the recipient page (heavy: framer-motion + canvas-confetti + howler). | Fine. Generator page stays lightweight. |

## Build Order Implications

Architecture dependencies drive the following phase structure:

### Phase 1: Data Foundation (Schema + Core API)
**Depends on:** Nothing — greenfield setup
**Build:** Prisma schema + migrations, `wishService.js` (create + read), wish creation endpoint, nanoid slug generation, `statsService.js` (record view).
**Why first:** Everything else reads or writes wish data. The database schema must exist before any API or UI work.
**Key pattern:** Server-side slug generation in `wishService` — not client-side.
**Pitfall to avoid:** Sequential IDs. Use `slug String @unique` with nanoid default from day one.

### Phase 2: Creator Flow (Form + Upload + Preview)
**Depends on:** Phase 1 (wish endpoint exists)
**Build:** `CreateWishPage`, `WishForm`, `PhotoUploader` (Multer config + upload route), `ThemePicker`, `PreviewPanel`, React Router `/create` route, copy-link functionality.
**Why second:** Wishes must be creatable before they can be viewed. Photo upload requires Multer middleware.
**Pitfall to avoid:** Client-side ID generation. Photos upload first (server assigns filenames), then photo URLs are included in wish creation payload.

### Phase 3: Core Experience (View + Animation State Machine)
**Depends on:** Phase 2 (wishes exist in DB for testing)
**Build:** `ViewWishPage`, `ExperienceOrchestrator` (state machine), `GiftBox`, `SentenceRevealer`, React Router `/wish/:slug` route, `AnimatePresence` phase transitions.
**Why third:** Core product experience. Building after creation means real test data exists.
**Key pattern:** State machine (useReducer) from day one — do not start with useState booleans and "refactor later."
**Pitfall to avoid:** setTimeout for animation sequencing. Use Framer Motion `onAnimationComplete`.

### Phase 4: Delight Layer (Confetti + Gallery + Audio + Themes)
**Depends on:** Phase 3 (experience flow works end-to-end)
**Build:** `ConfettiFinale` (canvas-confetti), `PhotoGallery`, `BackgroundMusic` (Howler.js), `FlairChips`, sound effects, `ThemeProvider` with CSS custom properties, theme-flair merge.
**Why fourth:** Enhancements on a working experience. Each can be developed and tested independently.
**Pitfall to avoid:** Audio playing before user gesture. Howler instances created eagerly, `.play()` deferred until gift box tap.

### Phase 5: Reactions + Tracking (Social Proof + Generator Feedback)
**Depends on:** Phase 3 (wish page exists to react to)
**Build:** `ReactionBar` with optimistic UI, reaction API endpoints, view tracking in `statsService`, `WishStats` page at `/wish/:slug/stats`.
**Why fifth:** Valuable but not core to the experience. Proof of engagement for the generator.
**Key pattern:** Optimistic UI (instant heart counter update, rollback on API failure).

### Phase 6: Polish (Loading States + Errors + Mobile + Replay)
**Depends on:** Phases 1-5 complete
**Build:** Loading skeletons, error boundaries, empty states, mobile responsiveness, accessibility, performance audit, replay button, image preloader integration.
**Why last:** Polish crosses all components. Best done when full feature set is in place.

## Integration Points

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Client → Express API | HTTP fetch (JSON) | Vite proxy in dev: `/api` → `localhost:3001`. Production: Express serves built client OR separate origins with CORS. |
| Client → Photo Upload | HTTP fetch (FormData) | Multer parses multipart. Same proxy as JSON API. Progress tracking possible with `XMLHttpRequest` upload events. |
| Express → SQLite | Prisma Client | Single PrismaClient instance (singleton pattern). Critical: `globalThis.prisma` pattern to avoid connection leaks during Vite HMR (module re-evaluation). |
| Express → Filesystem | `fs` via multer `diskStorage` | `server/uploads/` directory. Express `static` middleware serves it. Path stored in DB as relative URL. |
| flair.js → Server routes | Direct import | In-memory lookup, no DB or network. Used by REST routes and MCP server independently. |

### Theme Application Architecture

```
Generator selects theme from ThemePicker (e.g., "playful")
    │
    ▼
Stored in Wish.theme field (string identifier)
    │
    ▼
ViewWishPage reads wish.theme
    │
    ▼
ThemeProvider looks up theme definition from client/src/lib/themes.js
    │
    ├── Theme colors → CSS custom properties on wrapper div
    │     --color-primary, --color-bg, --color-accent, --color-text
    │
    ├── Flair data merged:
    │     --color-birthstone ← birthstone color lookup
    │     Zodiac symbol → FlairChips component
    │
    ├── Animation parameters passed to components:
    │     animationCurve, giftBoxStyle → GiftBox
    │     confettiColors, particleCount → ConfettiFinale
    │
    └── CSS custom properties cascade to all descendants
          No prop drilling needed for colors
```

---
*Architecture research for: Birthday Wish Generator*
*Researched: 2026-06-19*
