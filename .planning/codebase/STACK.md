# Technology Stack

**Analysis Date:** 2026-06-20

## Languages

| Language  | Usage                          | Version Constraint |
|-----------|--------------------------------|--------------------|
| JavaScript (ES Modules) | All source code -- client and server | ES2022+ via Vite and Node |

- **No TypeScript** -- the entire project uses plain `.js` and `.jsx` files with `"type": "module"` in all three `package.json` files.
- **No JSX typing** -- React components use `.jsx` extension but no type annotations.
- **No linter** -- no ESLint, Biome, or Prettier configuration exists.
- **No formatter config** -- no `.prettierrc`, `.eslintrc`, or `biome.json`.
- **No testing framework** -- no test files, no Jest/Vitest/Playwright config.

## Runtime

| Runtime | Version | Purpose |
|---------|---------|---------|
| Node.js | 20+ (inferred from ESM + `crypto.randomUUID`) | Server-side execution |
| Browser | Modern evergreen | Client-side execution |

- Node runs both the Express API server and the MCP stdio server.
- The Vite dev server also runs on Node during development.

## Frameworks

### Frontend (client/)

| Framework / Library | Version   | Purpose |
|---------------------|-----------|---------|
| React               | ^18.3.1  | UI component library |
| React DOM           | ^18.3.1  | DOM rendering |
| React Router DOM    | ^7.18.0  | Client-side SPA routing (two routes: CreatePage, WishPage) |
| Framer Motion       | ^12.40.0 | Page transitions, sentence reveal animations, gift box animation |
| Vite                | ^5.4.1   | Dev server, HMR, production bundler |
| @vitejs/plugin-react | ^4.3.1  | JSX transform and Fast Refresh for Vite |

### Backend (server/)

| Framework / Library | Version   | Purpose |
|---------------------|-----------|---------|
| Express             | ^4.19.2  | HTTP API server (REST endpoints) |
| Prisma              | ^7.8.0   | ORM for SQLite database |
| @prisma/client      | ^7.8.0   | Prisma runtime client |
| @prisma/adapter-better-sqlite3 | ^7.8.0 | Driver adapter for SQLite via better-sqlite3 |
| better-sqlite3      | ^12.11.1 | Native SQLite3 driver (used via Prisma adapter) |
| @modelcontextprotocol/sdk | ^1.0.0 | MCP server SDK for tool exposure |

## Key Dependencies

### Client-side

| Package         | Version  | Why it exists |
|-----------------|----------|---------------|
| canvas-confetti | ^1.9.4   | Confetti particle effect on wish reveal (ConfettiFinale component) |
| framer-motion   | ^12.40.0 | All animations: sentence-by-sentence reveal, gift box opening, page transitions, flair chips |
| howler          | ^2.2.4   | Background music playback on wish page (BackgroundMusic component) |
| react-router-dom| ^7.18.0  | SPA routing between /create and /wish/:id |

### Server-side

| Package         | Version  | Why it exists |
|-----------------|----------|---------------|
| cors            | ^2.8.5   | Cross-origin requests during dev (Vite on 5173, Express on 3001) |
| multer          | ^2.2.0   | Multipart form-data file upload handling |
| nanoid          | ^5.1.14  | Short 8-character unique wish IDs (not UUID-length) |
| file-type       | ^22.0.1  | Magic-byte validation of uploaded photo files |
| sharp           | ^0.35.2  | Thumbnail generation (300px wide, without enlargement) |
| crypto (built-in) | Node built-in | UUID generation for photo filenames (`crypto.randomUUID()`) |

### Root devDependencies

| Package      | Version  | Why it exists |
|--------------|----------|---------------|
| concurrently | ^9.2.3   | Runs Express and Vite dev servers in parallel via `npm run dev` |

## Configuration

| File | Purpose |
|------|---------|
| `client/vite.config.js` | Vite config with React plugin; proxy `/api` to `http://localhost:3001` |
| `server/prisma/schema.prisma` | Prisma schema: Wish, Photo, Reaction, Stat models on SQLite |
| `server/lib/prisma.js` | Prisma client singleton with WAL mode and busy_timeout PRAGMAs |
| `.mcp.json` | MCP server config: `birthday-facts` (stdio, local) and `github` (HTTP, remote) |
| `.gitignore` | Ignores `node_modules/`, `dist/`, `.env`, `.mcp.json`, `*.db*`, `client/dist/`, `server/uploads/*` |

### Vite proxy config

```js
server: {
  proxy: {
    "/api": "http://localhost:3001",
  },
}
```

All `/api/*` requests from the dev frontend are forwarded to Express. No CORS issues during development because of this proxy.

### Prisma configuration

- Generator output: `server/lib/generated/prisma/` (custom output path, not default `node_modules/.prisma`)
- Datasource: SQLite (provider = "sqlite")
- WAL mode and 10-second busy_timeout enabled via PRAGMA after connection

### Notable configuration gaps

- **No `.env` template** -- `.env` files exist on disk but are gitignored; no `.env.example` for onboarding.
- **No Docker / docker-compose** -- no containerization config.
- **No CI/CD** -- no GitHub Actions, no deployment pipeline config.
- **No tsconfig** -- no TypeScript.
- **No postcss.config / tailwind.config** -- no Tailwind CSS; styling is plain CSS (`client/src/index.css`).

## Platform Requirements

| Requirement | Details |
|-------------|---------|
| Node.js | 20+ (ESM throughout, `crypto.randomUUID`, Prisma 7) |
| npm | Any recent version (no pnpm/yarn lockfiles) |
| SQLite | Bundled via `better-sqlite3` native addon -- requires C++ build toolchain |
| sharp | Requires native image processing libraries (libvips) -- platform-dependent install |
| OS | Windows (WSL2), macOS, or Linux -- no platform-specific code |
| Disk | `server/uploads/` stores photos on filesystem; `server/dev.db` is the SQLite database |

## Fonts

| Font | Weights | Source | Used in |
|------|---------|--------|---------|
| Baloo 2 | 500, 700, 800 | Google Fonts (loaded via `<link>` in `index.html`) | Display headings, wish title text |
| Nunito | 400, 600, 700 | Google Fonts (loaded via `<link>` in `index.html`) | Body text, UI elements |

Both fonts are loaded from Google Fonts CDN via `fonts.googleapis.com` with `preconnect` hints. No local font files are bundled.

## What is NOT present

- **No TypeScript** -- zero `.ts` or `.tsx` files, no `tsconfig.json`
- **No CSS framework** -- no Tailwind, no Bootstrap, no CSS Modules; plain global CSS
- **No linter / formatter** -- no ESLint, Prettier, or Biome config
- **No test framework** -- no Jest, Vitest, Playwright, or any test files
- **No state management library** -- no Redux, Zustand, Jotai; uses React component state and URL params
- **No API client library** -- no Axios; uses native `fetch()`
- **No authentication** -- no auth system; wishes are accessible by ID
- **No CI/CD config** -- no GitHub Actions, Vercel, or Netlify config
- **No Docker** -- no Dockerfile or docker-compose
- **No SSR / SSG** -- pure client-side SPA with Vite build
- **No AI for wish generation** -- wishes are human-written; no LLM integration for text generation
