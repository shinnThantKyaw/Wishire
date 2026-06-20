# Birthday Wish Generator

React (Vite) frontend + Node/Express backend that generates a short, personalized birthday wish.

## To Do
- write the answers you answer me in the answers.md file everytime i ask something

## Stack
- `client/` — Vite + React frontend
- `server/` — Express API (`/api/wish`)
- `server/mcp-server.js` — MCP server exposing `get_birthday_flair` (zodiac sign / birthstone / birth flower)

## Conventions
- All wish display must follow `.claude/skills/birthday-wish-style/SKILL.md` (sentence splitting, typography, flair chip formatting, render safety).
- All photo upload code must follow `.claude/skills/photo-upload-security/SKILL.md` (UUID filenames, magic-byte validation, controlled serve route). Prevents Pitfall 3.
- All animation code must follow `.claude/skills/framer-motion-patterns/SKILL.md` (AnimatePresence keys, variants at module level, onAnimationComplete, replay reset). Prevents Pitfall 2.
- The 8 documented pitfalls in `.planning/research/PITFALLS.md` must be reviewed before each build phase.
- Keep this a small project — resist scope creep.

## Commands
- `npm install && cd server && npm install && cd ../client && npm install` — install everything (first time only)
- `npm run dev` (from root) — runs the API and the frontend together
