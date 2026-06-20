# 🎂 Birthday Wish Generator

A small React + Node app that generates a short, personalized birthday wish — funny, sincere, poetic, or chaotic-roast — using real zodiac/birthstone/birth-flower flair pulled from a custom MCP tool.

## What's already here

```
.mcp.json                              # registers the custom birthday-facts MCP server
.claude/skills/birthday-wish-style/    # house style rules for generated wish copy
.claude/agents/tone-checker.md         # subagent that reviews wishes before they ship
server/                                # Express API + MCP server
client/                                # React (Vite) frontend
slides/pitch.md                        # 6-slide pitch template
report.md                              # report template (copy this into your team repo)
```

The form, the API route, the MCP tool, the skill, and the subagent are all wired together — but the actual AI-generated wish text is still a placeholder. **That's the part you build with Claude Code.**

## 1. Install Claude Code (if you haven't)

```bash
curl -fsSL https://claude.ai/install.sh | bash   # macOS/Linux/WSL
```
Windows: see [the install docs](https://docs.claude.com/en/docs/claude-code/overview) for the PowerShell/CMD one-liners.

## 2. Install project dependencies

```bash
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

## 3. Run it

```bash
npm run dev
```
This starts the API on `http://localhost:3001` and the frontend on `http://localhost:5173`. Open the frontend — the form works end-to-end right now, just with a placeholder wish.

## 4. Start Claude Code and build the real feature

```bash
claude
```

On first run it'll ask to approve the project-scoped MCP server from `.mcp.json` — say yes. Then try something like:

> Wire `/api/wish` in `server/index.js` up to the Claude API. Follow the rules in `.claude/skills/birthday-wish-style/SKILL.md` for tone, length, and structure. Use the `flair` data already being looked up in that route. After generating the wish, run it past the `tone-checker` subagent — if it comes back `REVISE`, regenerate once with that feedback before sending the response.

From there, keep iterating conversationally — ask it to polish the UI, add a "copy to clipboard" button, handle edge cases, whatever you want to add.

You'll need an `ANTHROPIC_API_KEY` in `server/.env` for the real API call (not committed — it's in `.gitignore`).

## Assignment checklist

- [ ] Public GitHub repo, built with Claude Code
- [ ] 3 ⭐️ from teammates who actually tried it
- [ ] `.mcp.json`, `.claude/skills/birthday-wish-style/SKILL.md`, `.claude/agents/tone-checker.md` committed
- [ ] Fill in `slides/pitch.md` with real screenshots, keep 6 slides
- [ ] Fill in `report.md`, then push it to your **team repo** at `ch-3/<your-github-username>/report.md`
