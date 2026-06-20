# External Integrations

**Analysis Date:** 2026-06-19

## APIs & External Services

**Claude API (Anthropic):**
- Planned integration for wish generation in `server/index.js` (currently a placeholder)
- SDK/Client: Not yet integrated — intended to be called directly via HTTP from the `/api/wish` route
- Auth: `ANTHROPIC_API_KEY` env var in `server/.env` (not committed; `.gitignore` lists `.env`)
- Status: TODO placeholder at `server/index.js:20-29`; the route currently returns a static placeholder string

**Google Fonts:**
- Font loading for "Baloo 2" and "Nunito" typefaces
- Loaded via `<link>` tags in `client/index.html:7-14`
- Preconnect hints to `fonts.googleapis.com` and `fonts.gstatic.com`
- No API key required; public CDN

## Data Storage

**Databases:**
- None — the application is fully stateless. Wishes are generated on-the-fly and not persisted.

**File Storage:**
- Local filesystem only. No cloud storage service.

**Caching:**
- None — every request generates a fresh response.

## Frontend-Backend Communication

**Proxy Architecture:**
- Vite dev server (`client/vite.config.js:6-9`) proxies all `/api` requests to `http://localhost:3001` (the Express server)
- Frontend runs on port 5173 (Vite default); backend on port 3001
- This avoids CORS issues during development despite the `cors` middleware being present

**Request Flow:**
1. User fills form in `client/src/App.jsx` and clicks "Generate wish"
2. `fetch("/api/wish", { method: "POST", body: JSON.stringify(form) })` at `client/src/App.jsx:33-37`
3. Vite proxies to Express at `server/index.js:11` (`app.post("/api/wish", ...)`)
4. Express validates input, calls `getBirthdayFlair(month, day)` from `server/lib/flair.js`
5. Response JSON: `{ wish, flair }` with `flair` containing `zodiacSign`, `birthstone`, `birthFlower`

**Dev Server Wiring:**
- Root `package.json` uses `concurrently` to run both servers:
  - `npm run dev:server` → `cd server && npm start` → `node index.js` (port 3001)
  - `npm run dev:client` → `cd client && npm run dev` → `vite` (port 5173)

## MCP Server Integration (birthday-facts)

**Definition:**
- Registered in `.mcp.json` as `birthday-facts`
- Transport: stdio (`command: "node"`, `args: ["server/mcp-server.js"]`)
- Enabled in `.claude/settings.local.json` under `enabledMcpjsonServers: ["birthday-facts"]`

**MCP Server Implementation:**
- File: `server/mcp-server.js`
- Uses `@modelcontextprotocol/sdk` v1.0.0
- Creates a `Server` instance with name `"birthday-facts"` and version `"1.0.0"`
- Connects via `StdioServerTransport` (runs as a child process of Claude Code)

**Exposed Tool:**
- `get_birthday_flair` — looks up zodiac sign, birthstone, and birth flower for a given month/day
  - Input: `{ month: number (1-12), day: number (1-31) }`
  - Output: `{ zodiacSign, birthstone, birthFlower }` (JSON string in MCP `TextContent`)

**Shared Logic:**
- Both the MCP server and the Express route use the same helper: `server/lib/flair.js`
- `getBirthdayFlair(month, day)` is imported by both `server/mcp-server.js:7` and `server/index.js:3`
- Data tables for zodiac ranges, birthstones, and birth flowers are hardcoded in `server/lib/flair.js`

## Claude Code Integration Points

**Skill:**
- `.claude/skills/birthday-wish-style/SKILL.md` — defines house style rules for wish generation
- Applied whenever wish text is generated or reviewed
- Defines structure (2-4 sentences), tone modes (funny, sincere, poetic, chaotic-roast), personalization rules, and hard constraints (no generic filler, no copyrighted content, audience-appropriate)

**Subagent:**
- `.claude/agents/tone-checker.md` — subagent named `tone-checker`
- Reviews generated wishes for tone problems before they ship
- Checks for: generic AI filler, mean vs affectionate tone, mismatched formality, awkward flair insertion, length
- Returns `APPROVED` or `REVISE: <instruction>` — does not rewrite wishes itself
- Meant to be invoked after every wish generation, especially for `funny` and `chaotic-roast` tones

**Hooks:**
- `.claude/hooks/` contains GSD (Guided Structured Development) framework hooks:
  - `gsd-check-update.js` — SessionStart hook for update checks
  - `gsd-session-state.sh` — SessionStart hook for state initialization
  - `gsd-update-banner.js` — SessionStart hook for banner display
  - `gsd-context-monitor.js` — PostToolUse, SubagentStop, Stop, PreCompact hook for context monitoring
  - `gsd-prompt-guard.js` — PreToolUse hook for prompt safety
  - `gsd-read-guard.js` — PreToolUse hook for read safety
  - `gsd-read-injection-scanner.js` — PostToolUse hook for injection scanning on Read
  - `gsd-workflow-guard.js` — PreToolUse hook for workflow enforcement
  - `gsd-graphify-update.sh` — PostToolUse hook for graph updates on Bash
  - `gsd-phase-boundary.sh` — PostToolUse hook for phase tracking on Write/Edit
  - `gsd-validate-commit.sh` — PreToolUse hook for commit validation on Bash
  - `gsd-config-reload.js` — FileChanged hook for config hot-reload
  - `gsd-cursor-post-tool.js`, `gsd-cursor-session-start.js` — cursor integration hooks
  - `gsd-statusline.js` — status line updates
  - `gsd-ensure-canonical-path.js`, `gsd-worktree-path-guard.js` — path safety hooks
- All hook paths reference Node at `/home/dell/.nvm/versions/node/v24.16.0/bin/node` (absolute nvm path)

**GSD Core:**
- `.claude/gsd-core/VERSION` indicates GSD framework v1.5.0
- `.claude/package.json` sets type to `"commonjs"` for the `.claude/` directory
- `.claude/gsd-file-manifest.json` and `.claude/gsd-install-state.json` track GSD installation state
- `.claude/.gsd-profile` — GSD profile configuration

**MCP Tools (available to Claude Code):**
- `get_birthday_flair` from `birthday-facts` server — used when Claude Code needs to generate a wish with real zodiac/birthstone/flower details

## Environment Configuration

**Required env vars:**
- `ANTHROPIC_API_KEY` — for Claude API integration (planned, not yet wired in code)
- `PORT` — optional, defaults to 3001 for the Express server

**Secrets location:**
- `server/.env` — intended location for `ANTHROPIC_API_KEY`
- Listed in `.gitignore` — never committed

## Webhooks & Callbacks

**Incoming:**
- `POST /api/wish` — the sole API endpoint, accepts JSON body with `name`, `relationship`, `tone`, `month`, `day`

**Outgoing:**
- None currently implemented. The planned Claude API call would be an outgoing HTTP request from the server.

## CI/CD & Deployment

**Hosting:**
- No deployment configuration. Project is a local development application.

**CI Pipeline:**
- None configured.

---

*Integration audit: 2026-06-19*
