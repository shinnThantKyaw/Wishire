# Wishire 🎂

> Beautiful birthday wishes, sent with love.

<img src="client/public/SSs/LandingPage.png" alt="Wishire Landing Page" width="100%" />

---

## Live Demo

- **Frontend:** [wishire-eight.vercel.app](https://wishire-eight.vercel.app)
- **Backend API:** [wishire-production.up.railway.app](https://wishire-production.up.railway.app)

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
- 🖼️ **Drag & Drop Photo Upload** — up to 5 photos, JPEG/PNG/WebP/GIF, 5MB each, uploaded to Cloudinary with auto-generated thumbnails
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
- 🐘 **PostgreSQL + Prisma** — production database with migrations
- ☁️ **Cloudinary** — cloud-based photo storage with automatic thumbnail generation
- 📊 **View Tracking** — records each wish open
- 👍 **Emoji Reactions** — atomic upsert, supports multi-tap
- 📏 **Auto Sentence Splitting** — message split into max 6 sentences for staggered display
- 🔧 **MCP Server** — `get_birthday_flair` tool for AI assistants

### Security
- 🛡️ **Magic-Byte Validation** — file type verified by actual bytes, not extensions
- 🚫 **Path Traversal Prevention** — resolved path + UUID format validation
- 🧹 **XSS Prevention** — React text nodes, no dangerouslySetInnerHTML
- 🔐 **CORS** — configurable allowed origin via `CLIENT_URL` environment variable

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
| Database | PostgreSQL + Prisma |
| File Upload | Cloudinary (upload + thumbnails) |
| Hosting — Frontend | Vercel |
| Hosting — Backend | Railway |

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
┌──────────────┐        ┌──────────────────┐        ┌────────────┐
│   React App   │───────▶│   Express API     │───────▶│ PostgreSQL │
│   (Vercel)    │◀───────│   (Railway)       │◀───────│  (Railway) │
└──────────────┘        └──────────────────┘        └────────────┘
                               │
                        ┌──────┴──────┐
                        │  Cloudinary │
                        │ (images)    │
                        └─────────────┘
```

**Request flow:**
1. React SPA on Vercel serves the frontend
2. API calls (`/api/*`) are proxied from Vercel to Railway via `vercel.json` rewrites
3. Express on Railway handles API requests and runs Prisma migrations on deploy
4. Photos are uploaded directly to Cloudinary (not stored on the server)

---

## Installation

### Prerequisites
- Node.js 18+
- PostgreSQL running locally

### Setup

```bash
# Clone the repo
git clone https://github.com/shinnThantKyaw/Wishire.git
cd Wishire

# Install dependencies
cd server && npm install
cd ../client && npm install

# Set up environment variables
cd ../server
cp .env.example .env   # or create .env manually (see below)

# Run database migrations
npx prisma migrate deploy

# Start development servers (from project root)
cd ..
npm run dev
```

App opens at `http://localhost:5173`

---

## Environment Variables

### Server (`server/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `CLOUDINARY_URL` | Yes | — | Cloudinary config (`cloudinary://key:secret@cloud`) |
| `CLIENT_URL` | No | `*` | Allowed CORS origin (set to your Vercel URL in production) |
| `PORT` | No | `3001` | API server port (Railway sets this automatically) |

### Example `server/.env`

```env
DATABASE_URL=postgresql://user:password@localhost:5432/wishire
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
CLIENT_URL=http://localhost:5173
```

---

## Deployment

### Backend — Railway

1. Push your repo to GitHub
2. Create a new project on [railway.com](https://railway.com) → **Deploy from GitHub repo**
3. Add a **PostgreSQL** database service
4. Configure your service:
   - **Root Directory:** `server`
   - **Health Check Path:** `/api/health`
5. Set environment variables:
   - `DATABASE_URL=${{Postgres.DATABASE_URL}}`
   - `CLOUDINARY_URL=your-cloudinary-url`
   - `NODE_ENV=production`
6. Railway auto-detects the `Dockerfile` and deploys

### Frontend — Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
4. Deploy — `vercel.json` handles API proxying to Railway automatically

---

## Folder Structure

```
Wishire/
├── client/
│   ├── src/
│   │   ├── pages/           # Home, Create, Success, Wish
│   │   ├── components/
│   │   │   ├── experience/  # GiftBox, LetterCard, PhotoSlideshow, etc.
│   │   │   ├── create/      # PhotoUploader, ThemeSelector
│   │   │   └── home/        # HeroBackground, CTAButton
│   │   ├── hooks/           # useReducedMotion, useMouseParallax
│   │   └── index.css        # All styles (Tailwind + custom)
│   ├── public/
│   │   └── assets/          # Images, audio, favicons
│   └── vercel.json          # Vercel config (API proxy + SPA routing)
├── server/
│   ├── routes/              # wishes, photos
│   ├── services/            # Business logic (wishService)
│   ├── middleware/           # Upload (multer), error handling
│   ├── lib/                 # Prisma client, Cloudinary, flair data, errors
│   ├── prisma/              # Schema + migrations
│   ├── index.js             # Express entry point
│   ├── prisma.config.ts     # Prisma configuration
│   └── Dockerfile           # Railway deployment
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
