# Feature Research

**Domain:** Interactive birthday wish experience (shareable, animated greeting)
**Researched:** 2026-06-19
**Confidence:** MEDIUM (competitor analysis from training data; project feature decisions from PROJECT.md)

> **Note:** WebSearch, WebFetch, and Write tools were all restricted in this environment. Competitor feature analysis draws from training data through August 2025. Product-specific features (what to build) are drawn from the highly detailed PROJECT.md, which is the authoritative source for this project. Feature categorization (table stakes vs differentiators vs anti-features) is medium confidence for industry patterns, HIGH confidence for this specific project given the clarity of PROJECT.md.

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing = product feels broken or incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Shareable unique link | The entire delivery mechanism. Without it, the product has no purpose. | LOW | UUID v4; Prisma @default(uuid()) can generate at DB level. Unguessable, no enumeration risk. |
| Recipient sees sender name | Social context is everything. Sets emotional frame before anything opens. | LOW | Simple text rendering; stored on wish record. |
| Personalized greeting with recipient name | A generic message without a name feels low-effort. | LOW | Part of the wish form. Sender provides it. |
| Mobile-responsive experience | Birthday links are opened on phones. Gift box must be tappable, text readable, photos viewable on mobile. | MEDIUM | Framer Motion handles touch gestures. CSS Modules with responsive breakpoints. Test on real devices. |
| Photo display | Users expect photos in a birthday greeting. Text-only wish feels incomplete. | MEDIUM | 1-5 photos, filesystem storage via multer. react-dropzone for upload. Framer Motion for transitions. |
| Visual polish (not plain text) | Recipients expect something designed. Even basic theming signals care. | MEDIUM | Themes change colors, backgrounds, animations. CSS custom properties for dynamic theming. |
| Fast load time | Slow-loading wish kills the surprise. Recipients close the tab. | MEDIUM | Vite builds efficient bundles. Photos are bottleneck — serve optimized, lazy-load. No heavy frameworks. |
| Works without account creation | Forcing sign up to view a wish is a conversion-killer. Recipient should never hit a login wall. | LOW | By design: no auth for viewing. The link IS access. |
| Replay ability | Birthday people revisit. A wish you can only see once is frustrating. | LOW | Wish persists in DB. No expiry. Replay button on page. |

### Differentiators (Competitive Advantage)

Features that set this product apart. Not required, but drive emotional impact and shareability.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Gift box unwrap mechanic | Transforms reading a message into opening a present. Core UX thesis. No competitor has this exact mechanic. | HIGH | Multi-stage animation: lid lift, glow reveal, content appears. Framer Motion variants + orchestration. Hardest animation in the app. |
| Sentence-by-sentence reveal | Builds anticipation. Each tap reveals next sentence — recipient controls pacing. Creates moments of surprise. | MEDIUM | Stagger children animation with Framer Motion. Each sentence is a motion.p with sequenced enter. Tap handler advances state. |
| Confetti + sparkle finale | Closing celebration making the experience feel like an event. Confetti IS the emotional payoff. | MEDIUM | canvas-confetti for particle control. Theme-specific confetti colors. Triggers on final sentence reveal. |
| Photo gallery finale | After emotional journey, all photos together create a memory wall moment. Photos woven through narrative AND displayed together at end. | MEDIUM | Photos appear during wish and again as gallery after confetti. Framer Motion AnimatePresence for transitions. |
| Background music + sound effects | Sensory richness. Soft music during experience, pop sound when gift box opens. Creates atmosphere. | MEDIUM | Howler.js for mobile AudioContext unlock via gift box tap gesture. Background track + tap SFX as audio sprites. |
| Emoji reactions + multi-tap heart | Birthday person responds emotionally. Generator sees their wish was loved. Creates feedback loop. | MEDIUM | Fixed reaction bar (6 emojis + heart). POST to /api/wish/:id/reactions. Heart counter increments each tap. |
| Flair-enhanced themes | Zodiac sign, birthstone color, birth flower motif woven into theme. Personal without AI. Uses existing lib/flair.js. | LOW | Flair data already implemented. Themes auto-incorporate birthstone color and zodiac symbol as accent. |
| Human-written wishes (no AI) | Differentiator by subtraction. Industry is racing to AI — this says real words from a real person. Authenticity is competitive advantage. | LOW | Free-text textarea. No generation pipeline. No AI cost. No tone-checker subagent needed. |
| Permanent links, no expiry | Many platforms expire links or delete after viewing. This stays forever — birthday person can revisit anytime. | LOW | No TTL on wishes. Replay always available. |
| Status page for generator | Generator sees open count, reaction counts, timestamps. Closes the loop: did they see it? did they love it? | LOW | GET /api/wish/:id/stats. Simple counts. No real-time — polling or manual refresh. |

### Anti-Features (Deliberately NOT Built)

Features that seem appealing but create problems for this specific product.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| AI-generated wish text | Make it easier — generator does not have to write anything. Quick option appeal. | Contradicts core value (authentic, human words). Adds Claude API cost, tone-checker overhead, latency. Generic AI text undermines emotional impact. The whole point is that real humans write real words. | Free-text textarea with placeholder guidance. The effort IS the value. |
| Tone selector | Users might want preset tones (funny/sincere/poetic/roast). | Adds form complexity, implies AI tone modification, undermines authenticity. The sender natural voice IS the tone. | The sender writes in their own voice. No tone override needed. |
| User accounts / authentication | Save my wishes, see history, manage everything. | Massive complexity for v1. Auth system, session management, password reset, email verification. Premature for a two-page app where the link IS access. | REST-based with UUID links. Status page via link. Accounts designed for but not built in v1. |
| Public gallery / feed of wishes | Show off creative wishes, get inspired. | Privacy nightmare. Wishes contain personal photos and private sentiments. Public-by-default is dangerous. Moderation burden. | Private link-only sharing. Generator controls who sees the wish. |
| Real-time notifications | Get notified the moment they open it. | Requires WebSockets, push notifications, service workers, background sync. Massive complexity for nice-to-have. Generator can check status page when curious. | Poll-based status page. Simple GET request. No persistent connection needed. |
| Social sharing from recipient page | Let birthday person share wish on Instagram. | Wish was created FOR them. Sharing strips intimacy. Privacy concerns (their photos, someone else is words). | Later phase (v2) with explicit opt-in controls. Definitely not v1. |
| Link expiry / view once | Make it feel exclusive like Snapchat. | Infuriating UX. Birthday people want to revisit. Senders want them to revisit. Expiry destroys permanent value. | Permanent links, always replayable. |
| Group/collaborative wishes | Multiple people sign one card. | Real-time collaboration complexity, merge conflicts, contributor management. Different product category (one-to-one vs many-to-one). | Out of scope. GroupGreeting and Kudoboard already own this space. |
| Video recording alongside text | Record a video message instead of writing. | Storage costs, transcoding, bandwidth, mobile recording UX, playback compatibility. Massive complexity increase not aligned with core value. | Photos only for v1. Video considered for v2+. |
| Rich text editor for wish message | Let me bold, italicize, add emoji formatting. | Adds tiptap/lexical dependency, sanitization burden, rendering complexity. Distracts from content. Plain text beautifully delivered is more powerful. | Plain textarea. The delivery IS the formatting. |

## Feature Dependencies

```
Gift box animation
    ├──requires──> Shareable link (needs a page to live on)
    ├──requires──> Framer Motion (animation engine)
    ├──requires──> Mobile-responsive (tap gesture on phones)
    └──enables──> Audio unlock (gift box tap = user gesture)

Sentence-by-sentence reveal
    ├──requires──> Gift box animation (happens after box opens)
    └──enhances──> Photo transitions (photos between sentences)

Confetti finale
    ├──requires──> Sentence-by-sentence reveal (triggers on final sentence)
    └──requires──> canvas-confetti (imperative animation)

Photo gallery finale
    ├──requires──> Photo upload (photos must exist)
    └──depends_on──> Confetti finale (gallery appears after confetti)

Background music + SFX
    ├──requires──> Gift box animation (tap = AudioContext unlock)
    └──requires──> howler (mobile audio support)

Emoji reactions + heart
    ├──requires──> Shareable link (needs a page to POST to)
    └──enhances──> Status page (reaction counts shown to generator)

Status page
    ├──requires──> Shareable link (needs wish ID)
    ├──requires──> Reactions POST endpoint
    └──requires──> Open tracking

Flair-enhanced themes
    ├──requires──> Zodiac/birthstone/birth flower lookup (lib/flair.js)
    └──enhances──> Visual themes (auto-incorporates flair data)

Photo upload
    ├──requires──> multer (server-side handling)
    ├──requires──> react-dropzone (client-side dropzone)
    └──enables──> Photo display in wish + gallery finale

Shareable link
    ├──requires──> UUID generation
    └──enables──> Everything (the entire recipient experience)
```

### Dependency Notes

- **Gift box animation requires shareable link:** The animation lives on /wish/:id. Until wishes can be created and retrieved by ID, there is nowhere to put the animation.
- **Gift box animation enables audio unlock:** Mobile browsers block AudioContext until user gesture. Gift box tap is natural unlock point — no separate enable audio button needed.
- **Sentence reveals require gift box animation:** Gift box opening is first interaction. Sentences reveal after. Sequencing matters.
- **Confetti requires sentence reveals:** Confetti triggers when last sentence appears. Need sentence tracking state machine before confetti trigger.
- **Photo upload enables all photo features:** Photos must be stored and served before they can appear in wish or gallery.
- **Shareable link enables everything:** No link = no recipient page = no features work. This is the foundational feature, must be built first.

## MVP Definition

### Launch With (v1)

Minimum viable product — what is needed for one person to create a wish and another to experience it.

- [ ] **Shareable unique link** — Foundational feature. Must be first.
- [ ] **Gift box unwrap mechanic** — Core UX thesis. Without it the product has no reason to exist.
- [ ] **Sentence-by-sentence reveal** — Core emotional mechanic. Builds the experience arc.
- [ ] **Confetti + sparkle finale** — Emotional payoff moment. Without it the experience just ends.
- [ ] **Photo upload (1-5) + display** — Table stakes. Photos woven into the experience.
- [ ] **Photo gallery finale** — The memory wall closing moment.
- [ ] **Mobile-responsive experience** — Non-negotiable. Birthday links open on phones.
- [ ] **Visual themes (at least 2-3)** — Visual polish. Even basic theming signals care.
- [ ] **Flair-enhanced themes** — Uses existing lib/flair.js. Low cost, high personalization.
- [ ] **Background music + gift box SFX** — Sensory richness. AudioContext unlock via gift box tap.
- [ ] **Replay button** — Table stakes for recipient. Must have.
- [ ] **Emoji reactions + heart** — Closes feedback loop. Generator knows their wish was loved.
- [ ] **Status page for generator** — Shows opens and reactions. Closes the loop.
- [ ] **Sender name + recipient name displayed** — Social context. Table stakes.

### Add After Validation (v1.x)

Features to add once the core experience loop is proven.

- [ ] **Additional themes** — More variety validated by actual usage of initial themes.
- [ ] **Photo lightbox in gallery** — If users upload multiple photos, proper lightbox enhances gallery finale.
- [ ] **More emoji in reaction bar** — Expand from initial 6 based on which get used most.
- [ ] **Background music track selection** — Let generator pick from 3-5 tracks instead of one default.
- [ ] **Animation polish pass** — Tweak easings, timings, sparkle patterns based on real usage feedback.
- [ ] **Photo reordering in form** — Drag to reorder uploaded photos before submission.

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **User accounts and authentication** — Enables wish history, management across devices.
- [ ] **Full dashboard with wish history** — Requires accounts. Generator sees all wishes, stats, trends.
- [ ] **Social sharing from recipient page** — With explicit opt-in and privacy controls.
- [ ] **Reply/thank-you notes from birthday person** — Closes the loop in the other direction.
- [ ] **Audio recording alongside wish text** — Voice messages add emotional warmth. Storage complexity trade-off.
- [ ] **Video upload** — Short video clips woven into the experience. Major storage cost.
- [ ] **Scheduled delivery** — Set a future date for the wish to become accessible.
- [ ] **Printable version** — PDF generation for those who want a physical keepsake.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Shareable unique link | HIGH | LOW | P1 |
| Sender + recipient name display | HIGH | LOW | P1 |
| Gift box unwrap mechanic | HIGH | HIGH | P1 |
| Sentence-by-sentence reveal | HIGH | MEDIUM | P1 |
| Confetti + sparkle finale | HIGH | MEDIUM | P1 |
| Photo upload + display | HIGH | MEDIUM | P1 |
| Photo gallery finale | HIGH | MEDIUM | P1 |
| Mobile-responsive experience | HIGH | MEDIUM | P1 |
| Visual themes (2-3) | MEDIUM | MEDIUM | P1 |
| Flair-enhanced themes | MEDIUM | LOW | P1 |
| Background music + SFX | MEDIUM | MEDIUM | P1 |
| Replay button | MEDIUM | LOW | P1 |
| Emoji reactions + heart | MEDIUM | MEDIUM | P1 |
| Status page for generator | MEDIUM | LOW | P1 |
| Additional themes | MEDIUM | LOW | P2 |
| Photo lightbox | LOW | LOW | P2 |
| More emoji reactions | LOW | LOW | P2 |
| Music track selection | LOW | MEDIUM | P2 |
| Animation polish pass | MEDIUM | MEDIUM | P2 |
| Photo reordering in form | LOW | MEDIUM | P2 |
| User accounts | MEDIUM | HIGH | P3 |
| Dashboard with history | MEDIUM | HIGH | P3 |
| Social sharing | LOW | MEDIUM | P3 |
| Reply notes | LOW | MEDIUM | P3 |
| Audio recording | MEDIUM | HIGH | P3 |
| Video upload | LOW | HIGH | P3 |
| Scheduled delivery | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch — core experience incomplete without these
- P2: Should have — adds polish and delight, but product works without them
- P3: Nice to have — future consideration after validation

## Competitor Feature Analysis

| Feature | JibJab | Paperless Post | GroupGreeting/Kudoboard | Our Approach |
|---------|--------|----------------|------------------------|--------------|
| Animated cards | Yes (video-based, face-mapping) | Yes (static with envelope animation) | No (static boards) | Interactive gift box unwrap — not a card, an experience |
| Photo upload | Limited (face photo for animation) | Yes (card background) | Yes (board posts) | 1-5 photos woven into unfolding narrative + gallery finale |
| Custom message | Pre-written jokes only | Yes (free text, limited length) | Yes (each signer writes) | Full free-text, human-written, no AI, no length limit |
| Group signing | No | Yes (RSVP-based) | Yes (core feature) | No — one-to-one, personal, intimate |
| Shareable link | Yes | Yes | Yes | Yes (UUID, permanent, no expiry) |
| Reactions/likes | No | No | Limited (Kudoboard has likes) | Emoji reactions + multi-tap heart, visible to generator |
| Music/sound | Yes (in animations) | No | No | Background music + sound effects with mobile unlock |
| Mobile experience | App-based | Web, basic | Web, basic | Mobile-first responsive web with tap gestures |
| AI-generated content | No (pre-scripted) | No | No | Deliberately NO AI. Human words only. |
| Replay | Yes | Yes (while link active) | Yes | Yes, always, permanently |
| Status tracking | No | Yes (open tracking, paid) | Yes (board views) | Yes — open count, reaction count, timestamps |
| Free tier | Limited, watermarked | Yes (basic) | Yes (basic board) | Fully free v1, no paywalls |

### Key Competitive Insights

1. **No one does the unwrap a gift mechanic.** JibJab has animated cards, Paperless Post has envelope animations, but nobody has a gift box you tap to open with a staged reveal. This is the differentiation moat.

2. **Everyone is rushing to AI; this project goes the opposite direction.** GroupGreeting and others are adding AI writing assistants. Human words only is a genuine differentiator in the 2025-2026 landscape.

3. **Reactions are under-served.** Paperless Post has no reactions. GroupGreeting has basic likes. An emoji reaction bar + multi-tap heart is a genuine gap in the market.

4. **Most platforms monetize the recipient.** Paperless Post charges for premium cards. JibJab shows ads or watermarks on free. This project has no recipient-facing monetization — the experience is pure.

5. **Permanent links are not standard.** Many platforms expire links or gate them behind accounts. Permanent, always-accessible wishes are a differentiator.

## Sources

- **PROJECT.md** — Authoritative source for product vision, user flows, and scope decisions. All feature decisions validated against this document.
- **STACK.md** — Technology stack research (React, Framer Motion, canvas-confetti, howler, react-dropzone, Prisma+SQLite). Feature complexity estimates based on chosen stack capabilities.
- **CLAUDE.md** — Project conventions, existing MCP setup, skill references.
- **birthday-wish-style/SKILL.md** — Wish structure rules (2-4 sentences, flair weaving, tone modes) — informs sentence reveal pacing and anti-feature decisions around AI generation.
- **Training data (August 2025)** — Competitor feature analysis for JibJab, Paperless Post, GroupGreeting, and Kudoboard. Industry UX patterns for animated card reveals and celebration UIs.
- **Confidence:** MEDIUM overall. Feature categorization for THIS project is HIGH confidence (validated against detailed PROJECT.md). Competitor feature analysis is MEDIUM confidence (training data, not verified against live products). Exact competitor pricing/tiers may have changed since training cutoff.

---
*Feature research for: Birthday Wish Generator — interactive wish experience app*
*Researched: 2026-06-19*
