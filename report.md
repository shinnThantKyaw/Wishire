<!-- ch-3 personal-project report -->
# ch-3 Personal Project — Report

github_username: shinnThantKyaw
personal_repo_url: https://github.com/shinnThantKyaw/Wishire
project_summary: A birthday wish generator that creates an immersive, animated experience with gift box reveal, confetti, photo slideshow, typewriter letter, and 12 theme colors — shareable via a single link.
slides_url: slides/pitch.md

## Methodology

Built using a project-based approach with iterative commits — each feature (gift box, confetti, photo gallery, letter card, hero redesign) was implemented, tested, and committed individually. The git workflow follows a "commit as you build" pattern on the master branch with descriptive commit messages. Claude Code was used throughout for code generation, UI/UX design iteration, CSS debugging, and architecture decisions. The project evolved from a basic form-to-message flow into a premium, multi-phase animated birthday experience across 20+ commits.

## Evidence — Claude Code usage

### MCP
- path: .mcp.json
- what: Two MCP servers — `birthday-facts` (custom Node.js MCP server exposing `get_birthday_flair` tool that returns zodiac sign, birthstone, and birth flower from birth month/day; used to populate flair chips on each wish) and `github` (enables repo management, commits, and issue tracking directly from Claude Code).

### Skill
- path: .claude/skills/birthday-wish-style/SKILL.md
- what: Display conventions for wish text — sentence splitting rules, typography (line-height, font sizing), flair chip formatting (zodiac/birthstone/birthflower as themed pills), and render safety (no dangerouslySetInnerHTML, user content as untrusted text nodes). Applied to LetterCard, FlairChips, and all wish display components.

- path: .claude/skills/framer-motion-patterns/SKILL.md
- what: 8 animation rules for Framer Motion — stable AnimatePresence keys with playCount, `mode="wait"`, variants defined at module level (not inline), `onAnimationComplete` for state dispatch, confetti canvas `pointer-events: none`, shared canvas instance, eager Howl creation with deferred `.play()`. Prevents Pitfall 2 (exit animations not firing). Applied across all 15 experience components.

- path: .claude/skills/photo-upload-security/SKILL.md
- what: Security rules for multer-based photo uploads — crypto.randomUUID() filenames, magic-byte validation via `file-type`, 5MB/5-file limits, controlled serve route with UUID regex, path traversal prevention. Prevents Pitfall 3. Applied to `server/routes/photos.js` and `server/middleware/upload.js`.

- path: .claude/skills/form-creator-flow/SKILL.md
- what: Patterns for the creator form — react-dropzone drag-drop with cumulative file addition, thumbnail previews with blob URL lifecycle cleanup, theme color circle selector, inline validation (validate on submit, clear on change), toast notifications, and memory leak prevention. Applied to CreatePage, PhotoUploader, ThemeSelector.

- path: .claude/skills/ui-ux-pro-max/SKILL.md
- what: UI/UX design intelligence — 67 styles, 96 color palettes, 57 font pairings, accessibility guidelines, and animation patterns. Used for the premium gift box redesign, hero background, CTA button glassmorphism, and overall visual polish across all pages.

### Agent
- path: .claude/agents/project-explainer.md
- what: Maintains a living EXPLAIN.md documenting the full codebase architecture — component tree (WishPage → ExperienceOrchestrator → GiftAnticipation / WishExperience), state machine (IDLE → GIFT_BOX → MAIN), data flow, and remaining work. Used after major features to keep documentation in sync.

- path: .claude/agents/gsd-executor.md
- what: Executes development plans with atomic commits, deviation handling, and state management. Used to implement phases 1–5 of the roadmap — each plan was executed with structured commits and checkpoint protocols.

- path: .claude/agents/gsd-code-reviewer.md
- what: Reviews source files for bugs, security issues, and code quality. Produces structured REVIEW.md with severity-classified findings. Used to audit experience components and API routes.

- path: .claude/agents/gsd-security-auditor.md
- what: Verifies threat mitigations from the plan's threat model exist in implemented code. Checks photo upload security (UUID filenames, magic-byte validation, path traversal prevention) and reaction endpoint safety (debounced increments, input validation).
