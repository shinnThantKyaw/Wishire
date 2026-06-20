# Technology Stack

**Analysis Date:** 2026-06-19

## Languages

**Primary:**
- JavaScript (ES Modules) - Entire project uses ES module syntax (`"type": "module"` in both `client/package.json` and `server/package.json`). JSX used for React components in `client/src/`.

**Secondary:**
- Not applicable — single-language project.

## Runtime

**Environment:**
- Node.js v24.16.0 (detected from nvm path in `.claude/settings.local.json` hook commands)
- No `.nvmrc` file present in repository root (version enforced externally)

**Package Manager:**
- npm (version bundled with Node v24.16.0)
- Lockfiles: `client/package-lock.json` and `server/package-lock.json` present and committed

## Frameworks

**Core:**
- React 18.3.1 - Frontend UI framework (`client/package.json`)
- Express 4.19.2 - Backend API server (`server/package.json`)
- Vite 5.4.1 - Frontend build tool and dev server (`client/package.json`)

**Testing:**
- None detected — no test framework or test files present in the project.

**Build/Dev:**
- concurrently 9.0.0 - Runs server and client dev servers simultaneously from root (`package.json`)
- @vitejs/plugin-react 4.3.1 - Vite plugin for React JSX transform and HMR (`client/package.json`)

## Key Dependencies

**Critical:**
- @modelcontextprotocol/sdk 1.0.0 - MCP server implementation exposing `get_birthday_flair` tool (`server/package.json`)
- cors 2.8.5 - CORS middleware for Express, enables cross-origin requests during development (`server/package.json`)

**Infrastructure:**
- react-dom 18.3.1 - React DOM renderer (`client/package.json`)

## Configuration

**Environment:**
- `server/.env` — expected to contain `ANTHROPIC_API_KEY` for Claude API calls (not yet committed; listed in `.gitignore`)
- `PORT` env var for Express server, defaults to 3001 (`server/index.js:35`)
- No other environment-specific config files detected

**Build:**
- `client/vite.config.js` — Vite configuration with React plugin and `/api` proxy to `http://localhost:3001`
- `.mcp.json` — MCP server registration (birthday-facts server, stdio transport via `node server/mcp-server.js`)
- `.claude/settings.local.json` — Claude Code project settings (hooks, MCP server enablement, permissions)

**No:**
- TypeScript config (project is plain JavaScript)
- ESLint config
- Prettier config
- PostCSS / Tailwind config (project uses vanilla CSS custom properties)

## Platform Requirements

**Development:**
- Node.js v24.x (inferred from hook paths)
- npm for package installation
- Claude Code CLI (for MCP tool integration and AI-assisted development)
- `ANTHROPIC_API_KEY` in `server/.env` for the planned Claude API integration

**Production:**
- No production deployment config detected. The project is a development/demo application. `vite build` command is available but no deploy target is configured.

## Fonts

- Google Fonts: "Baloo 2" (weights 500, 700, 800) and "Nunito" (weights 400, 600, 700) loaded via `<link>` in `client/index.html`
- Preconnect hints to `fonts.googleapis.com` and `fonts.gstatic.com` for performance

---

*Stack analysis: 2026-06-19*
