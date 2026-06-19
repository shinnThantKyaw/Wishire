# Research Summary: Birthday Wish Generator

**Domain:** Interactive birthday wish experience web app (React SPA + Express API)
**Researched:** 2026-06-19
**Overall confidence:** MEDIUM (version numbers from training data; web verification tools unavailable)

## Executive Summary

The Birthday Wish Generator is a two-sided web app: a creator flow where someone writes a personal message, uploads photos, and picks a theme to generate a shareable link; and a recipient flow where the birthday person opens that link and experiences an animated gift-box unwrapping sequence with music, sentence-by-sentence reveals, photo transitions, confetti, and emoji reactions.

The technology stack is deliberately simple and well-established. On the frontend, React 18+ with Vite provides the SPA foundation. Framer Motion handles all sequenced animations (gift box open, sentence reveals, photo transitions) because it offers gesture handling, layout animations, and declarative orchestration that CSS alone cannot achieve. canvas-confetti adds the celebratory finale. Howler.js manages background music and sound effects with proper mobile audio unlock behavior. react-dropzone provides photo upload with drag-and-drop UX, while multer on the Express server handles multipart file parsing securely.

On the backend, Express serves a REST API with five endpoints (create wish, get wish, upload photo, submit reaction, get stats). SQLite via Prisma stores structured data with a deliberate schema design that supports future PostgreSQL migration. Photos live on the filesystem with UUID filenames stored as paths in the database — deliberately avoiding base64 storage that would bloat the database and slow API responses.

The architecture emphasizes a centralized animation state machine (useReducer) rather than scattered setTimeout chains, image preloading before the reveal sequence begins, CSS custom properties for dynamic theming, and server-generated UUIDs for unguessable shareable links. The single most impactful architectural decision is using nanoid for wish slugs rather than auto-increment IDs, which prevents enumeration attacks and eliminates collision risk.

Critical pitfalls have been identified and mitigation strategies are documented. The top risks are: SQLite write contention under concurrent reactions (solved by WAL mode + busy_timeout), Framer Motion AnimatePresence keys breaking on replay (solved by including playCount in animation keys), photo upload path traversal (solved by server-generated filenames + magic byte validation), canvas-confetti memory leaks on replay (solved by shared canvas + cleanup lifecycle), and mobile audio autoplay blocking (solved by tying audio to the gift box tap gesture).

## Key Findings

**Stack:** React 18/19 + Vite 5 frontend; Express 4 + Prisma 5 + SQLite backend; Framer Motion 11 (animations), canvas-confetti (confetti), Howler.js (audio), react-dropzone (uploads), multer (server uploads), nanoid (shareable link slugs).

**Architecture:** Two-route SPA (/create, /wish/:id) with REST API. Animation state machine via useReducer with 7 states: IDLE → GIFT_BOX → UNWRAPPING → SENTENCE → CONFETTI → GALLERY → REACTIONS. CSS custom properties for dynamic theming. Photos on filesystem (not DB). Server-generated nanoid slugs for wish IDs.

**Features:** Table stakes = message creation + link sharing + wish viewing. Differentiators = interactive unwrap with gift box animation, photo reveals throughout, confetti finale, emoji reactions, theme selection. Anti-features = AI-generated wishes (deliberately removed in favor of human-written messages), user accounts (designed for but not built in v1).

**Critical pitfall:** Five distinct failure modes that each cause rewrites if not handled from day one: SQLite locking under concurrent writes, Framer Motion exit animations not firing, photo upload path traversal, confetti memory leak on replay, and mobile audio autoplay blocking. All have documented prevention strategies.

## Implications for Roadmap

Based on research, suggested phase structure:

1. **Foundation: Data model + API skeleton** — Establish the Prisma schema, Express routes, and the create-wish + get-wish endpoints. Set WAL mode and busy_timeout from the start. Include the Express catch-all route for SPA routing. Addresses: WISH-01, WISH-02. Avoids: Pitfalls 1 (SQLite locking), 5 (SPA 404).

2. **Creator flow: Form + photo upload** — Build the generator form with react-dropzone, implement multer with proper security (magic byte validation, UUID filenames, file size limits). Addresses: PHOTO-01, PHOTO-02, THEME-01. Avoids: Pitfall 3 (path traversal), base64 storage.

3. **Recipient experience: Gift box + sentence reveals** — Framer Motion state machine orchestrates the gift box open, sentence-by-sentence reveals, and photo transitions. Audio tied to gift box tap gesture for mobile unlock. Addresses: PAGE-01 through PAGE-04, PAGE-07. Avoids: Pitfalls 2 (AnimatePresence), 8 (audio autoplay).

4. **Finale: Confetti + gallery + reactions** — canvas-confetti with shared canvas pattern. Photo gallery with preloaded images. Emoji reaction bar with debounced atomic increments. Addresses: PAGE-05, PAGE-06, PAGE-08, PAGE-09. Avoids: Pitfalls 4 (confetti memory), 7 (reaction race conditions).

5. **Polish: Themes, flair, status page** — Theme system with CSS custom properties and flair auto-enhancement. Generator status page. Mobile responsiveness and performance optimization. Addresses: THEME-02, TRACK-01, TRACK-02, PAGE-10, WISH-03. Avoids: Pitfall 6 (photo load times).

**Phase ordering rationale:** Data model/API must exist first (prerequisite for all UIs). Creator flow must exist before recipient flow can be tested end-to-end. Recipient flow splits into "core experience" and "finale + feedback" because the animation complexity warrants separate integration testing. Polish is deliberately last as enhancements that don't block core value delivery.

**Research flags for phases:**
- Phase 3 (recipient animations): Likely needs deeper research on Framer Motion variant orchestration and mobile gesture handling. Spring configs, stagger delays, and easing curves will need tuning.
- Phase 4 (confetti + audio): May need research on canvas-confetti mobile performance and audio asset sourcing (royalty-free music/SFX).
- Phases 1, 2, 5: Standard patterns, unlikely to need deeper research.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Version numbers from training data (Aug 2025 cutoff), not verified against live npm registry. Architectural choices (which library for which job) are HIGH confidence. |
| Features | HIGH | Feature requirements explicitly defined in PROJECT.md with validated/active/later/out-of-scope breakdown. |
| Architecture | HIGH | Patterns derived from explicit project requirements. State machine, CSS custom properties, image preloading, audio unlock are well-understood. |
| Pitfalls | MEDIUM | Coverage is comprehensive and drawn from known web development failure modes. Specific Framer Motion version behaviors and canvas-confetti edge cases may have evolved. Verify against current docs during implementation. |

## Gaps to Address

- **Live version verification:** All version numbers should be verified against npm registry when `npm install` is run. Use caret ranges to allow patch/minor updates.
- **Audio asset sourcing:** Royalty-free background music and sound effects need to be sourced or created (content/asset task, not technology research).
- **Theme asset creation:** Theme system architecture is defined, but actual theme designs (palettes, patterns, animation personalities) need visual design work.
- **Mobile device testing:** Audio unlock, confetti performance, and touch gesture handling must be tested on real iOS and Android devices. Chrome DevTools device mode is insufficient.
- **Framer Motion `layout` animations:** If the gift box uses `layout` prop for automatic layout animations, additional research on `layoutId` behavior with component swapping may be needed during Phase 3 implementation.

## Sources

- ARCHITECTURE.md — Component boundaries, data flows, build order, patterns
- STACK.md — Library versions, rationale, alternatives, anti-recommendations
- FEATURES.md — Table stakes, differentiators, anti-features, complexity analysis
- PITFALLS.md — 8 critical pitfalls with prevention/detection/recovery, technical debt patterns
