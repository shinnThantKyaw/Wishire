# File Structure

**Analysis Date:** 2026-06-20

## Directory Tree

```
birthday-wish-generator/
├── CLAUDE.md                    # Project instructions for Claude Code
├── README.md                    # Project readme
├── package.json                 # Root: concurrently script to run server+client
├── .mcp.json                    # MCP server registration (birthday-facts)
├── .gitignore
│
├── .claude/
│   ├── settings.json            # Claude Code project settings
│   ├── settings.local.json      # Local settings (hooks, MCP enablement)
│   ├── gsd-core/                # GSD framework (v1.5.0)
│   ├── hooks/                   # Claude Code hooks (gsd-*)
│   ├── agents/
│   │   └── tone-checker.md      # Subagent: reviews wish tone
│   └── skills/
│       ├── birthday-wish-style/
│       │   └── SKILL.md         # House style rules for wish generation
│       ├── framer-motion-patterns/
│       │   └── SKILL.md         # Framer Motion conventions (Rule 3, etc.)
│       └── photo-upload-security/
│           └── SKILL.md         # Photo upload security rules
│
├── .planning/
│   ├── PROJECT.md               # Project vision, requirements, architecture
│   ├── config.json              # GSD planning config
│   ├── codebase/                # Codebase analysis documents (this folder)
│   │   ├── STACK.md
│   │   ├── INTEGRATIONS.md
│   │   ├── ARCHITECTURE.md
│   │   ├── STRUCTURE.md
│   │   ├── CONVENTIONS.md
│   │   ├── TESTING.md
│   │   └── CONCERNS.md
│   └── research/
│       ├── ARCHITECTURE.md      # Pre-build research
│       ├── FEATURES.md
│       ├── PITFALLS.md          # 8 documented pitfalls
│       ├── STACK.md
│       └── SUMMARY.md
│
├── server/
│   ├── package.json             # Express, Prisma, multer, sharp, file-type, nanoid, howler
│   ├── index.js                 # Express app: middleware, routes, static serve, SPA catch-all
│   ├── mcp-server.js            # MCP server: get_birthday_flair tool via stdio
│   ├── prisma/
│   │   └── schema.prisma        # DB schema: Wish, Photo, Reaction, Stat
│   ├── lib/
│   │   ├── flair.js             # Zodiac/birthstone/birthflower lookup (shared with MCP)
│   │   ├── prisma.js            # Prisma client singleton (WAL mode)
│   │   └── generated/prisma/    # Prisma generated client (gitignored)
│   ├── routes/
│   │   ├── wishes.js            # /api/wish CRUD + reactions + stats
│   │   └── photos.js            # /api/upload + /api/uploads/:filename
│   ├── services/
│   │   └── wishService.js       # Business logic: create, get, react, stats
│   ├── middleware/
│   │   └── upload.js            # Multer config: UUID filenames, 5MB limit, MIME filter
│   └── uploads/                 # Photo storage on filesystem (gitignored)
│
├── client/
│   ├── package.json             # React, React Router, Framer Motion, Howler
│   ├── index.html               # HTML shell: Google Fonts, root div
│   ├── vite.config.js           # Vite: React plugin, /api proxy to :3001
│   └── src/
│       ├── main.jsx             # React entry: BrowserRouter + App mount
│       ├── App.jsx              # Router: /→/create, /create, /wish/:id
│       ├── index.css            # All CSS: custom properties, BEM classes, responsive
│       ├── hooks/
│       │   └── useReducedMotion.js  # prefers-reduced-motion media query hook
│       ├── components/
│       │   └── ErrorBoundary.jsx    # React error boundary for /wish/:id
│       └── experience/
│           ├── ExperienceOrchestrator.jsx  # State machine: 5 phases, music, replay
│           ├── GiftBox.jsx                # CSS gift box, tap-to-open animation
│           ├── SentenceRevealer.jsx       # Framer Motion sentence reveal
│           ├── ConfettiFinale.jsx         # Canvas confetti explosion
│           ├── PhotoGallery.jsx           # Photo grid display
│           ├── FlairChips.jsx             # Zodiac/birthstone/flower badges
│           ├── ReactionBar.jsx            # Emoji reactions + heart button
│           ├── ShareButton.jsx            # Clipboard share
│           └── BackgroundMusic.jsx        # (exists but music handled in orchestrator)
│
└── slides/
    └── pitch.md                 # Project pitch deck
```

## Key Files

### Entry Points
| File | Role |
|------|------|
| `server/index.js` | Express server entry. Configures middleware, mounts routes, serves static files, SPA catch-all. |
| `client/src/main.jsx` | React entry. Wraps App in BrowserRouter, mounts to `#root`. |
| `client/src/App.jsx` | Route definitions. `/` redirects to `/create`. |
| `server/mcp-server.js` | MCP server entry. Registers `get_birthday_flair` tool, connects via stdio. |

### Core Business Logic
| File | Role |
|------|------|
| `server/services/wishService.js` | All CRUD: createWish, getWish, addReaction, getWishStats. Sentence splitting, Prisma queries. |
| `server/lib/flair.js` | Pure functions: getBirthdayFlair, getZodiacSign, inRange. Data tables for zodiac, birthstones, birthstone colors, birth flowers. |
| `server/lib/prisma.js` | Prisma singleton with WAL mode enabled. |

### Experience Components
| File | Role |
|------|------|
| `client/src/components/experience/ExperienceOrchestrator.jsx` | Central state machine. Manages 5 phases, music (Howler), replay, reduced motion. |
| `client/src/pages/WishPage.jsx` | Fetches wish, applies theme CSS vars, renders ExperienceOrchestrator. |
| `client/src/pages/CreatePage.jsx` | Form UI, photo upload, wish creation, success screen with share link. |

### Security-Critical
| File | Role |
|------|------|
| `server/middleware/upload.js` | Multer config: UUID filenames, 5MB/file limit, 5 files max, MIME filter. |
| `server/routes/photos.js` | Upload handler: magic-byte validation, thumbnail generation, UUID-regex serve guard, path traversal prevention. |

## Configuration Files

| File | Purpose |
|------|---------|
| `package.json` (root) | `npm run dev` runs server+client via concurrently |
| `client/package.json` | React 18, React Router, Framer Motion, Howler, Vite |
| `server/package.json` | Express, Prisma, multer, sharp, file-type, nanoid, cors |
| `client/vite.config.js` | React plugin, `/api` proxy to `localhost:3001` |
| `.mcp.json` | Registers `birthday-facts` MCP server (stdio transport) |
| `server/prisma/schema.prisma` | SQLite schema: Wish, Photo, Reaction, Stat models |
| `.gitignore` | Excludes node_modules, .env, uploads/, prisma generated |

## Source Organization

**Client**: Flat component structure. Pages in `pages/`, experience components in `components/experience/`, hooks in `hooks/`. Single CSS file for everything.

**Server**: Layered — routes → services → prisma + lib. Middleware separated. MCP server is a standalone entry point sharing `lib/flair.js`.

**Shared**: Only `lib/flair.js` is shared between Express API and MCP server. No other code sharing between client and server.

---

*Structure analysis: 2026-06-20*
