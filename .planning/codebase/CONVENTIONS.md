# Coding Conventions

## File Extensions
- `.jsx` — React components (`App.jsx`, `main.jsx`)
- `.js` — Server code and config files (`server/index.js`, `server/lib/flair.js`, `vite.config.js`)
- `.md` — Documentation and agent/skill definitions
- `.json` — Package manifests and configuration

## Module System
- ES modules throughout (`"type": "module"` in both `client/package.json` and `server/package.json`)
- Bare specifiers for npm packages: `import express from "express"`
- Relative paths with explicit `.js` extensions: `import { getBirthdayFlair } from "./lib/flair.js"`
- Default exports for components: `export default function App()`
- Named exports for utilities: `export function getBirthdayFlair(month, day)`

## Naming Conventions
- **Components**: PascalCase (`App`) with default export
- **Functions**: camelCase (`getBirthdayFlair`, `getZodiacSign`, `update`)
- **Constants**: UPPER_SNAKE_CASE (`TONES`, `RELATIONSHIPS`, `BIRTHSTONES`, `BIRTH_FLOWERS`, `ZODIAC_RANGES`)
- **Files**: kebab-case for config/docs (`.gitignore`, `.mcp.json`), camelCase for source (`main.jsx`, `vite.config.js`)
- **Directories**: kebab-case (`birthday-wish-style`, `gsd-core`, `tone-checker`)

## CSS Conventions
- Custom properties on `:root` with semantic names:
  - Colors: `--cream` (#fff8ef), `--ink` (#2b1d14), `--coral` (#ff6f59), `--gold` (#ffb84d), `--mint` (#2bb39c)
  - Surfaces: `--card` (#ffffff), `--border` (#f1e4d3)
- BEM-like class naming:
  - `.hero__eyebrow` — element inside `.hero` block
  - `.flair__chip` — element inside `.flair` block
  - `.result__wish` — element inside `.result` block
  - `.form__row` — element inside `.form` block
- Single CSS file (`index.css`) — no CSS-in-JS or CSS modules
- No CSS framework/tailwind dependency

## Frontmatter Patterns
YAML `---` delimited blocks in `.claude/agents/*.md` and `.claude/skills/*/SKILL.md`:
```yaml
---
name: tone-checker
description: Reviews a generated birthday wish...
tools: Read, Grep, Glob
---
```
Common fields: `name`, `description`, `tools` (on agents), `allowed-tools` (on commands).

## Project Conventions (from CLAUDE.md)
- All generated wish copy must follow `.claude/skills/birthday-wish-style/SKILL.md`
- Run generated wishes through `tone-checker` subagent before returning them
- Especially critical for `funny` and `chaotic-roast` tones
- Keep project scope small — resist scope creep
- Commit `.mcp.json`, skills, and agent definitions

## Linting / Formatting
- No ESLint, Prettier, Biome, or any formatter config present
- No `.editorconfig` file
- No lint scripts in any `package.json`

## Import Order
Observed in `App.jsx` and `server/index.js`:
1. Framework/libraries first (`react`, `express`, `cors`)
2. Local modules next (`./lib/flair.js`)
3. No explicit grouping enforced — happens naturally
