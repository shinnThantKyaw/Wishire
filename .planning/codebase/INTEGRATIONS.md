# External Integrations

**Analysis Date:** 2026-06-20

## APIs & External Services

### Google Fonts CDN

- **URL:** `https://fonts.googleapis.com` and `https://fonts.gstatic.com`
- **Purpose:** Loads Baloo 2 (display) and Nunito (body) font families
- **Integration point:** `<link>` tags in `client/index.html`
- **Auth:** None (public CDN)
- **Offline fallback:** None -- fonts will fall back to system fonts if CDN is unavailable

### GitHub MCP Server (Remote)

- **URL:** `https://api.githubcopilot.com/mcp`
- **Type:** HTTP MCP server
- **Auth:** Bearer token via `${GITHUB_PAT}` environment variable
- **Configured in:** `.mcp.json`
- **Purpose:** GitHub Copilot MCP integration for Claude Code development tooling
- **Note:** This is a development tooling integration, not a runtime dependency. It is gitignored (`.mcp.json` is in `.gitignore`).

### No other external APIs

- No LLM/AI APIs for wish generation (wishes are human-written)
- No email/SMS delivery services
- No analytics or tracking services
- No CDN for static assets (self-hosted)

## Data Storage

### SQLite (via Prisma ORM)

- **Status:** IMPLEMENTED (not just planned)
- **Driver:** `better-sqlite3` v12.11.1 via `@prisma/adapter-better-sqlite3`
- **Database file:** `server/dev.db` (gitignored via `*.db` pattern)
- **Prisma client singleton:** `server/lib/prisma.js`
- **Schema location:** `server/prisma/schema.prisma`
- **Generated client output:** `server/lib/generated/prisma/`
- **Concurrency:** WAL journal mode + 10-second busy_timeout (Pitfall 1 prevention)

#### Database Models

| Model    | Primary Key         | Purpose |
|----------|---------------------|---------|
| Wish     | `id` (nanoid(8))    | Stores wish metadata, message text, theme, sender/recipient info |
| Photo    | `id` (auto-increment) | Photo filenames linked to wishes (UUID-based filenames on disk) |
| Reaction | `id` (auto-increment) | Emoji reactions per wish with atomic upsert counter |
| Stat     | `id` (auto-increment) | Open tracking -- records each time a wish page is visited |

#### Key relationships

- `Wish` 1:N `Photo` (cascade delete)
- `Wish` 1:N `Reaction` (cascade delete, unique on `[wishId, emoji]`)
- `Wish` 1:N `Stat` (cascade delete)

### Filesystem (Photos)

- **Location:** `server/uploads/` (gitignored except `.gitkeep`)
- **Naming convention:** `<crypto.randomUUID()>.<ext>` for originals, `<uuid>_thumb.<ext>` for thumbnails
- **Thumbnail generation:** sharp resizes to 300px wide, no enlargement
- **Max file size:** 5MB per photo, max 5 photos per request
- **Allowed types:** JPEG, PNG, WebP, GIF (validated via magic bytes, not just extension)
- **Security measures:** UUID filenames, magic-byte validation (`file-type`), path traversal protection, controlled serve route with regex whitelist

## Frontend-Backend Communication

### REST API

All communication is via REST endpoints using `fetch()` (no Axios, no GraphQL, no WebSocket).

| Endpoint | Method | Purpose | Request Body | Response |
|----------|--------|---------|-------------|----------|
| `/api/wish` | POST | Create a new wish | `{ senderName, recipientName, relationship, month, day, message, photos[], theme }` | Wish object with id, sentences, flair |
| `/api/wish/:id` | GET | Fetch a wish by ID | -- | Wish object with photos, reactions, flair; also records a Stat |
| `/api/wish/:id/reactions` | POST | Add/increment an emoji reaction | `{ emoji, count }` | Updated reaction object |
| `/api/wish/:id/stats` | GET | Get wish open stats | -- | `{ id, recipientName, openCount, reactions[] }` |
| `/api/upload` | POST | Upload photos (multipart) | `FormData` with `photos` field (max 5 files) | `[{ originalName, filename, thumbnailFilename }]` |
| `/api/uploads/:filename` | GET | Serve an uploaded photo | -- | Image file (immutable cache headers) |

### Vite Dev Proxy

- Development: frontend on `http://localhost:5173`, backend on `http://localhost:3001`
- Vite proxies `/api/*` to `http://localhost:3001` (configured in `client/vite.config.js`)
- Production: Express serves `client/dist/` as static files with SPA catch-all

### Request limits

- JSON body limit: 1MB (`express.json({ limit: "1mb" })`)
- Photo upload limit: 5MB per file, 5 files per request (multer config)

## MCP Server Integration

### birthday-facts MCP Server

- **Implementation:** `server/mcp-server.js`
- **Transport:** stdio (StdioServerTransport)
- **Server name:** `birthday-facts`, version `1.0.0`
- **Configured in:** `.mcp.json` under `mcpServers.birthday-facts`
- **Run command:** `node server/mcp-server.js`

#### Exposed Tools

| Tool Name | Description | Inputs | Output |
|-----------|-------------|--------|--------|
| `get_birthday_flair` | Look up zodiac sign, birthstone, and birth flower for a birth month/day | `{ month: number (1-12), day: number (1-31) }` | `{ zodiacSign, birthstone, birthstoneColor, birthFlower }` |

#### Implementation details

- Logic lives in `server/lib/flair.js` -- pure function, no external API calls
- Zodiac calculation handles year-boundary wrapping (Capricorn: Dec 22 - Jan 19)
- Data is hardcoded arrays: 12 birthstones, 12 birth flowers, 12 zodiac ranges, 12 birthstone colors
- The same `getBirthdayFlair()` function is also used by the REST API (`server/services/wishService.js`) to enrich wish responses

## Claude Code Integration Points

### `.mcp.json`

Configures two MCP servers for the Claude Code development environment:

1. **birthday-facts** (stdio) -- the project's own MCP tool for zodiac/birthstone/flower lookup
2. **github** (HTTP) -- GitHub Copilot MCP for repository operations, authenticated via `GITHUB_PAT` env var

### `.claude/` directory

- `.claude/settings.json` -- project-level Claude Code settings (gitignored)
- `.claude/skills/` -- contains skill definitions:
  - `birthday-wish-style/SKILL.md` -- wish display formatting rules (sentence splitting, typography, flair chip formatting, render safety)
  - `photo-upload-security/SKILL.md` -- photo upload security patterns (UUID filenames, magic-byte validation, controlled serve route)
  - `framer-motion-patterns/SKILL.md` -- animation patterns and pitfalls (AnimatePresence keys, variants at module level, replay reset)
- `CLAUDE.md` -- project instructions for Claude Code, defines stack, commands, conventions

### Planning directory

- `.planning/research/` -- contains research docs including `PITFALLS.md` (8 documented pitfalls)
- `.planning/codebase/` -- this document and the stack analysis

## Environment Configuration

### Environment variables

| Variable | Where Used | Purpose | Default |
|----------|-----------|---------|---------|
| `PORT` | `server/index.js` | Express server port | `3001` |
| `NODE_ENV` | `server/lib/prisma.js` | Controls Prisma log level and singleton caching | `undefined` (development) |
| `GITHUB_PAT` | `.mcp.json` | GitHub API authentication for MCP server | Required for GitHub MCP |

### .env files

- Root `.env` exists (gitignored)
- `server/.env` exists (gitignored)
- No `.env.example` or `.env.template` is committed for onboarding

### No environment-specific configs

- No `.env.development`, `.env.production`, `.env.staging` files
- Single `vite.config.js` handles both dev and production (proxy only applies in dev mode)

## Webhooks & Callbacks

- **None** -- no outbound webhooks, no callback URLs, no push notifications
- The application is purely request/response (no real-time features, no WebSocket, no Server-Sent Events)

## CI/CD & Deployment

- **No CI/CD pipeline** -- no GitHub Actions, GitLab CI, CircleCI, or similar
- **No deployment config** -- no Vercel (`vercel.json`), Netlify (`netlify.toml`), Railway, or Dockerfile
- **No build scripts for production** -- `client/package.json` has `vite build` but no production deployment orchestration
- **Production serving** -- Express serves `client/dist/` with a catch-all SPA route (`server/index.js:22-34`), implying a manual build-then-run deployment model
- **Database migrations** -- Prisma schema exists but no migration files are committed; `prisma generate` is needed to create the client in `server/lib/generated/prisma/`
