---
marp: true
paginate: true
transition: fade
# PechaKucha: 6 slides, 20s auto-advance. Do not change the count.
auto-advance: 20
---

<!-- slide 1 -->
# Who's my person?
**Anyone who wants to send a personalized birthday wish.**

Friends, partners, family, coworkers — people who care enough to go beyond a plain "Happy Birthday" text.

They want something **beautiful, emotional, and shareable** — a digital birthday card that feels personal.

---

<!-- slide 2 -->
# Their problem
- Generic birthday messages feel **cold and forgettable**
- Creating something beautiful requires **design skills** most people don't have
- Existing tools are either **too complex** or **too basic**
- No easy way to combine **photos, a personal letter, music, and confetti** into one experience
- Sharing a birthday surprise should be as simple as **sending a link**

---

<!-- slide 3 -->
# What I built
**Wishire** — a birthday wish generator that creates an immersive, animated experience.

- 🎁 Gift box with anticipation → tap to open
- 🎉 Confetti celebration fills the screen
- 📸 Photo slideshow with auto-scroll carousel
- 💌 Typewriter letter reveal with sound effects
- 🎨 12 theme colors to match any personality
- 🎵 Background music throughout the experience

---

<!-- slide 4 -->
# How I built it
- **MCP**: `birthday-facts` server for zodiac signs, birthstones, and birth flowers — real data, not hardcoded. `github` server for repo operations.
- **Skill**: `birthday-wish-style` for sentence splitting, typography, and render safety. `framer-motion-patterns` for consistent animations.
- **Agent**: `project-explainer` to document architecture decisions across the codebase.
- **Stack**: React + Vite, Express + Prisma, Tailwind CSS v4, Framer Motion, Howler.js

---

<!-- slide 5 -->
# Why it matters
- **Emotional impact**: Confetti, music, and a personal letter create a real "wow" moment
- **Accessibility**: No app download — just open a link on any device
- **Personalization**: 12 themes, custom photos, handwritten-style letter — every wish feels unique
- **Shareability**: One link = a complete birthday surprise for WhatsApp, iMessage, or social media
- **Craft**: Clean code, accessibility-first animations, responsive design

---

<!-- slide 6 -->
# Done checklist
- [x] repo public
- [x] MCP + skill + agent used
- [x] report.md in team repo
- [x] 12 themed color palettes
- [x] Photo upload with magic-byte validation
- [x] Confetti, music, typewriter letter
- [x] Responsive design (mobile + desktop)
- [x] Replay functionality
