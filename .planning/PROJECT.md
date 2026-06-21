# Project: Birthday Wish Generator

## What This Is

A web app where someone creates a personalized birthday wish — writing their own heartfelt message, uploading photos, choosing a theme — and gets a shareable link. The birthday person opens the link and experiences an interactive surprise: a gift box that opens with animation, the wish revealed sentence by sentence, photos woven throughout, and a confetti finale with a photo gallery. They can react with emojis and hearts. The generator can see if their wish was opened and loved.

## Core Value

**Turning a personal message into a magical, memorable experience.** Not just "happy birthday" in a text — an interactive gift you unwrap like a present, with music, animation, photos, and genuine emotion.

## What Problem It Solves

Generic birthday texts feel low-effort. Even a heartfelt message sent over chat is… just text. This gives that same personal message a delivery mechanism worthy of how much you care — something the birthday person actually *experiences*. No AI writing the words. No generic filler. Just real human sentiment, beautifully delivered.

## How It Works

### Generator Flow
1. Opens the app → sees a form
2. Fills in: birthday person's name, relationship, birth month/day, their own name
3. Writes the wish message manually (free text — their own words)
4. Uploads up to 5 photos of the birthday person (max 5MB each)
5. Picks a visual theme from available options
6. Clicks Generate → sees a preview of the wish + "Copy Link" and "Open Link" buttons
7. Shares the link with the birthday person

### Birthday Person Flow
1. Opens the link → sees a beautiful page with the sender's name ("A birthday wish from Priya")
2. Center of the screen: a gift box
3. Taps the gift box → smooth opening animation + soft sound effect
4. Background music starts playing
5. The wish appears one sentence at a time — each tap reveals the next sentence
6. Photos appear between wish sections with gentle transitions, like memories being revealed
7. Final sentence → confetti explosion + sparkles + "Happy Birthday!" animation
8. All photos display together in a beautiful gallery finale
9. Reaction bar appears: emoji reactions + heart button (tappable multiple times)
10. Replay button to experience it all again

## Architecture

```
Generator's Browser          Birthday Person's Browser
       │                              │
       ▼                              ▼
  React SPA (Vite)             React SPA (Vite)
  /create page                 /wish/:id page
       │                              │
       ▼                              ▼
  ┌─────────────────────────────────────┐
  │        Express API Server            │
  │  POST /api/wish                      │
  │  GET /api/wish/:id                   │
  │  POST /api/wish/:id/reactions        │
  │  GET /api/wish/:id/stats             │
  │  POST /api/upload                    │
  │  GET /uploads/:filename              │
  └──────────┬──────────────────────────┘
             │
       ┌─────┴─────┐
       │   SQLite   │  (Prisma ORM)
       │  wishes    │
       │  photos    │
       │  reactions │
       │  stats     │
       └───────────┘

  /server/uploads/  ← photos stored on filesystem
```

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | React 18 + Vite | Already set up. Great for interactive animations |
| Routing | React Router | /create for generator, /wish/:id for birthday page |
| Animations | CSS + Framer Motion | Gift box, sentence reveals, confetti, photo transitions |
| Backend | Express (Node.js) | Already set up. RESTful API |
| Database | SQLite + Prisma | Zero-config, file-based. Schema designed for future Postgres migration |
| Photo storage | Filesystem (`server/uploads/`) | Simple, fast. SQLite stores paths. Swap to S3 later if needed |
| AI | None | Wishes are human-written. No Claude API needed |
| Flair lookup | In-memory (existing `lib/flair.js`) | Zodiac/birthstone/birth flower from birth date |

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Manual wish writing (not AI) | Authentic, personal, no API cost or complexity | Remove AI generation pipeline. Keep only flair lookup |
| SQLite + Prisma for storage | Zero config, structured, easy Postgres migration path | Schema: wishes, photos, reactions, stats |
| Photos on filesystem, paths in DB | Keeps DB lean, photos served as static files | Upload endpoint → disk → path in SQLite |
| No user accounts (v1) | Keep simple, focused on wish experience | Architecture ready for accounts later |
| Drop tone selector | Generator writes their own words — tone is natural | Form simplified: name, relationship, month, day, message, photos, theme |
| Keep zodiac/flair | Adds personal touch to birthday page without being AI-generated | Flair chips still shown on birthday page |
| Permanent links | Birthday person can revisit anytime | No expiry. Replay always available |
| Status page (not dashboard) | Generator tracks opens/reactions without full account system | GET /api/wish/:id/stats |

## Themes

The generator picks a visual theme that changes:
- Color palette
- Background decorations/patterns
- Gift box style
- Animation personality (bouncy, elegant, playful)
- Confetti colors and sparkle patterns

Themes are auto-enhanced with accents from the birthday person's birthstone color, zodiac symbol, and birth flower motif. Themes keep the experience fresh while maintaining the whimsical, playful vibe.

## Requirements

### Validated

- ✓ React + Vite frontend with Express backend — existing
- ✓ Zodiac/birthstone/birth flower lookup (`lib/flair.js`) — existing
- ✓ Form UI with name, relationship, month, day fields — existing (needs redesign)
- ✓ Proxy setup (/api → Express) — existing

### Active

- [ ] **WISH-01**: Generator can write a free-text wish message and submit with name, relationship, birth date, photos, and theme
- [ ] **WISH-02**: System generates a unique shareable link for each wish
- [ ] **WISH-03**: Generator can preview the wish, copy the link, and open it in a new tab
- [ ] **PAGE-01**: Birthday person sees a dedicated page at /wish/:id with sender name shown upfront
- [ ] **PAGE-02**: Animated gift box in center — tap to open with animation and soft sound
- [ ] **PAGE-03**: Wish sentences appear one at a time, each tap reveals the next
- [ ] **PAGE-04**: Uploaded photos appear between wish sections with gentle transitions
- [ ] **PAGE-05**: Final sentence triggers confetti, sparkles, and "Happy Birthday!" animation
- [ ] **PAGE-06**: After confetti, all photos shown together in a gallery finale
- [ ] **PAGE-07**: Background music plays during the experience
- [ ] **PAGE-08**: Replay button to experience the wish again
- [ ] **PAGE-09**: Emoji reactions (❤️ 😭 😂 🥰 etc.) and multi-tap heart button
- [ ] **PAGE-10**: Birthday page auto-enhanced with zodiac/birthstone/flower accents
- [ ] **PHOTO-01**: Generator can upload 1-5 photos, max 5MB each
- [ ] **PHOTO-02**: Photos stored on server filesystem, paths in SQLite
- [ ] **TRACK-01**: System tracks wish opens (count and timestamps)
- [ ] **TRACK-02**: Generator can view a status page showing open count and reactions
- [ ] **THEME-01**: Generator selects from visual themes that change colors, backgrounds, animations
- [ ] **THEME-02**: Themes auto-incorporate flair data (birthstone color, zodiac symbol)

### Later (designed for, not built)

- User accounts and authentication
- Full dashboard with wish history
- Social sharing from birthday page
- Reply/thank-you notes from birthday person
- More themes and customization
- Audio recording alongside wish text

### Out of Scope

- AI-generated wishes — deliberately removed. Human words only.
- Tone selector (funny/sincere/poetic/roast) — generator writes their own tone
- Real-time notifications — not needed without accounts

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-20 after roadmap creation*
