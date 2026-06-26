<!-- ch-3 personal-project report -->
# ch-3 Personal Project — Report

github_username: shinnThantKyaw
personal_repo_url: https://github.com/shinThantKyaw/wishire
project_summary: A birthday wish generator that creates an immersive, animated experience with gift box reveal, confetti, photo slideshow, typewriter letter, and 12 theme colors — shareable via a single link.
slides_url: slides/pitch.md

## Methodology

Built using a project-based approach with iterative commits — each feature (gift box, confetti, photo gallery, letter card, hero redesign) was implemented, tested, and committed individually. The git workflow follows a "commit as you build" pattern on the master branch with descriptive commit messages. Claude Code was used throughout for code generation, UI/UX design iteration, CSS debugging, and architecture decisions. The project evolved from a basic form-to-message flow into a premium, multi-phase animated birthday experience across 20+ commits.

## Evidence — Claude Code usage

### MCP
- path: .mcp.json
- what: Two MCP servers — `birthday-facts` (provides real zodiac signs, birthstones, and birth flowers based on birth date via a local Node.js server) and `github` (enables repo management, commits, and issue tracking directly from Claude Code). The birthday-facts server was used to dynamically fetch flair data for each wish, while the github server manages the project repository.

### Skill
- path: .claude/skills/birthday-wish-style/SKILL.md
- what: Defines rules for wish display — sentence splitting (split on `. `, `! `, `? `), typography (p/span with line-height 1.6–1.8), flair chip formatting (zodiac/birthstone as pills), and render safety (user-generated content treated as untrusted, no dangerouslySetInnerHTML). Ensures all wish text displays consistently and safely.

### Skill (secondary)
- path: .claude/skills/framer-motion-patterns/SKILL.md
- what: 8 animation rules — stable AnimatePresence keys, `mode="wait"`, variants at module level, `onAnimationComplete` for state transitions, `playCount` in keys for replay, confetti canvas `pointer-events: none`, shared canvas instance, eager Howl creation with deferred play. Applied across all 15 experience components.

### Agent
- path: .claude/agents/project-explainer.md
- what: Documents architecture decisions and explains the project structure. Used to maintain a clear understanding of the component tree (WishPage → ExperienceOrchestrator → GiftAnticipation / WishExperience), state machine (IDLE → GIFT_BOX → MAIN), and data flow across the codebase.
