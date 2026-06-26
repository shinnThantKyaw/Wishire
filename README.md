# Wishire 🎂

> Beautiful birthday wishes, sent with love.

<img src="client/public/SSs/LandingPage.png" alt="Wishire Landing Page" width="100%" />

---

## Live Demo

Coming soon — deployed demo will be linked here.

---

## About

Create unforgettable birthday surprise pages with heartfelt messages, cherished photos, beautiful animations, and music. Share a single link, and they'll unwrap a magical gift box filled with your love.

---

## Features

### Core Experience
- 🎁 **3D Gift Box Reveal** — premium animated gift box with spring-based lid opening, 28-particle burst, bow, ribbons, and constellation pattern
- 🎉 **7-Wave Confetti Celebration** — timed multi-directional confetti bursts (center, left, right, rain, fans, final shower)
- 📸 **Photo Memories Slideshow** — auto-advancing carousel (3.5s) with dot indicators, prev/next, hover-to-pause, wrap-around
- 💌 **Typewriter Letter Card** — expandable card with character-by-character reveal (40ms/char), blinking cursor, skip button, chime SFX
- 🎵 **Audio System** — background birthday music (looped), whoosh SFX on gift open, chime on letter finish, pause/resume toggle
- 🔄 **Replay Experience** — recipient can re-experience the full surprise from the gift box

### Creator Flow
- 📝 **Rich Wish Form** — sender/recipient name, relationship picker, birth date, message (10K chars with live counter)
- 🖼️ **Drag & Drop Photo Upload** — up to 5 photos, JPEG/PNG/WebP/GIF, 5MB each, thumbnail previews
- 🎨 **12 Theme Colors** — Lavender, Sunrise, Ocean, Forest, Rose, Midnight, Amber, Teal, Fuchsia, Sky, Emerald, Slate
- 👥 **Relationship Picker** — 5 icon-based options (Friend, Family, Coworker, Partner, Custom) with spring animations
- ✅ **Inline Validation** — validate-on-submit, clear-on-change, per-field errors + toast notifications

### Personalization
- ♈ **Zodiac Sign** — auto-calculated from birth month/day
- 💎 **Birthstone** — month-based with hex color
- 🌸 **Birth Flower** — month-based flower
- 🏷️ **Flair Chips** — zodiac, birthstone, birth flower displayed as themed pills

### Animations & Effects
- 🖱️ **Mouse Parallax** — landing page decorations respond to cursor
- ✨ **Floating Sparkles** — 14 emoji decorations with theme-aware hue rotation
- 🌟 **Glow Orbs** — breathing gradient orbs across backgrounds
- 💫 **Staggered Section Reveals** — all experience sections animate in sequence
- ⭐ **Premium CTA Button** — glassmorphism, shine sweep, icon wiggle, sparkle particles
- 💀 **Skeleton Loading** — shimmer placeholders while data loads

### Sharing & Success
- 🔗 **Shareable Link** — unique short URL (`/wish/{id}`) with nanoid
- 📋 **Copy to Clipboard** — clipboard API with execCommand fallback
- 🎊 **Success Confetti** — burst when wish is created

### Backend & Data
- 🗄️ **SQLite + Prisma** — WAL journal mode for concurrent reads/writes
- 📊 **View Tracking** — records each wish open
- 👍 **Emoji Reactions** — atomic upsert, supports multi-tap
- 📏 **Auto Sentence Splitting** — message split into max 6 sentences for staggered display
- 🔧 **MCP Server** — `get_birthday_flair` tool for AI assistants

### Security
- 🔒 **UUID Filenames** — uploads stored with crypto.randomUUID()
- 🛡️ **Magic-Byte Validation** — file type verified by actual bytes
- 🚫 **Path Traversal Prevention** — resolved path + UUID format validation
- 🧹 **XSS Prevention** — React text nodes, no dangerouslySetInnerHTML

### Accessibility
- ♿ **Reduced Motion** — 25+ animations disabled via prefers-reduced-motion
- ⌨️ **Keyboard Accessible** — gift box Enter/Space, focus-visible outlines, aria-labels
- 📱 **Touch Aware** — parallax disabled on touch, mobile-adaptive particle counts
- 👆 **44px Touch Targets** — minimum size for interactive elements

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite, Tailwind CSS v4 |
| Animations | Framer Motion |
| Audio | Howler.js |
| Confetti | canvas-confetti |
| Backend | Node.js + Express |
| Database | Prisma + SQLite |
| File Upload | Sharp (thumbnails) + file-type (validation) |

---

## Screenshots

<div align="center">

**Landing Page**
<img src="client/public/SSs/LandingPage.png" alt="Landing Page" width="100%" />

**Landing Page (Full)**
<img src="client/public/SSs/LandingPageFull.png" alt="Landing Page Full" width="100%" />

**Create Wish Form**
<img src="client/public/SSs/CreateForm.png" alt="Create Form" width="100%" />

**Shareable Link (Success)**
<img src="client/public/SSs/SuccessPage.png" alt="Success Page" width="100%" />

**Gift Box Reveal**
<img src="client/public/SSs/GiftBoxPage.png" alt="Gift Box" width="100%" />

**Celebration Page**
<img src="client/public/SSs/WishViewPage.png" alt="Wish View" width="100%" />

</div>

---

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────┐
│   React App   │────▶│  Express API  │────▶│  SQLite   │
│  (Vite :5173) │◀────│  (:3001)      │◀────│ (Prisma) │
└──────────────┘     └──────────────┘     └──────────┘
                             │
                     ┌───────┴───────┐
                     │  File Upload  │
                     │  + Thumbnails │
                     └───────────────┘
```

---

## Installation

```bash
git clone https://github.com/shinnThantKyaw/Wishire.git
cd Wishire
npm install && cd server && npm install && cd ../client && npm install
cd ..
npm run dev
```

App opens at `http://localhost:5173`

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3001` | API server port |

No `.env` file needed for local development — SQLite and file uploads work out of the box.

---

## Folder Structure

```
birthday-wish-generator/
├── client/
│   ├── src/
│   │   ├── pages/           # Home, Create, Success, Wish
│   │   ├── components/
│   │   │   ├── experience/  # GiftBox, LetterCard, PhotoSlideshow, etc.
│   │   │   ├── create/      # PhotoUploader, ThemeSelector
│   │   │   └── home/        # HeroBackground, CTAButton
│   │   ├── hooks/           # useReducedMotion, useMouseParallax
│   │   └── index.css        # All styles (Tailwind + custom)
│   └── public/
│       └── assets/          # Images, audio, favicons
├── server/
│   ├── routes/              # wishes, photos
│   ├── services/            # Business logic
│   ├── middleware/           # Upload, error handling
│   ├── lib/                 # Prisma client, flair data
│   └── index.js             # Express entry point
└── .mcp.json                # MCP servers config
```

---

## Future Improvements

- Social sharing (WhatsApp, iMessage)
- Custom theme builder
- E2E tests with Playwright
- Email delivery with scheduled sends
- Visitor statistics dashboard

---

## License

MIT — feel free to fork and make it your own.

---

## Author

[shinnThantKyaw](https://github.com/shinnThantKyaw)
