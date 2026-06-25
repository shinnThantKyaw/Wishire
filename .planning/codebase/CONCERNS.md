# Concerns & Technical Debt

**Analysis Date:** 2026-06-20

## Critical Issues

**None identified.** The application is functional and the security posture for photo uploads is solid (UUID filenames, magic-byte validation, path traversal prevention).

## Security Concerns

### Low Risk
- **No rate limiting on API endpoints.** `POST /api/wish` and `POST /api/upload` have no rate limiting. At small scale this is fine, but a malicious actor could spam wish creation or upload attempts.
- **No CSRF protection.** The app uses `cors()` middleware with default (allow-all) config. Since there are no auth cookies, CSRF impact is minimal, but the wide-open CORS policy could be tightened for production.
- **Reaction endpoint trusts client count.** `POST /api/wish/:id/reactions` accepts `{ emoji, count }` from the client. The server does `Math.max(1, Math.floor(Number(count) || 1))` which caps at floor, but a client could send large counts. Consider capping at a reasonable max (e.g., 100 per request).

### Informational
- **Prisma error codes surfaced to client.** `wishService.createWish()` includes `err.code` in the error response. This leaks internal database error codes. Fine for dev, strip for production.
- **No Content-Security-Policy headers.** The app serves static files without CSP headers. Not critical for a personal project but worth noting.

## Performance Risks

- **No image optimization on upload.** Original photos are stored at full size. Only a 300px thumbnail is generated. If someone uploads a 5MB photo, the birthday person downloads the full 5MB when viewing the gallery. Consider generating a display-size version (e.g., 800px) alongside the thumbnail.
- **Photos served from app server.** `GET /api/uploads/:filename` serves files directly from the Express process. For production with many concurrent users, a CDN or object storage (S3) would be better. Fine for the intended small-scale use.
- **Confetti canvas performance.** `ConfettiFinale` uses canvas-based confetti. On low-end mobile devices with many particles, this could cause frame drops. The `prefers-reduced-motion` check skips confetti entirely, which is good.
- **SQLite concurrent writes.** SQLite with WAL mode handles concurrent reads well but serializes writes. For the expected scale (a few wishes shared among friends), this is a non-issue.

## Missing Features (Planned but Not Built)

Per `.planning/PROJECT.md`, these are designed for but not yet implemented:

| Feature | Status | Impact |
|---------|--------|--------|
| WISH-01: Photo upload in create flow | ✅ Built | Done |
| WISH-02: Unique shareable link | ✅ Built | Done |
| WISH-03: Preview + copy link | ✅ Built | Done |
| PAGE-01–10: Birthday experience | ✅ Built | Done |
| PHOTO-01–02: Photo upload + storage | ✅ Built | Done |
| TRACK-01: Open tracking | ✅ Built | Done (Stat model) |
| TRACK-02: Status page for generator | ❌ Not built | Generator can't see open count or reactions |
| THEME-01: Visual themes | ✅ Built | 5 themes with CSS var override |
| THEME-02: Flair auto-enhancement | ✅ Built | Birthstone color merged into theme |
| Social sharing from birthday page | ✅ Built | ShareButton (clipboard) |
| Audio recording | ❌ Not built | Out of scope for v1 |

**Gap**: TRACK-02 (status page) is the main missing feature. The backend supports it (`GET /api/wish/:id/stats`) but there's no frontend page to view it.

## Technical Debt

- **No tests.** Zero test infrastructure. The most valuable targets are `flair.js` (pure logic) and `wishService.js` (business logic). See TESTING.md for recommendations.
- **No linting or formatting.** No ESLint, Prettier, or Biome configured. Code style is enforced manually. Risk of inconsistency grows with contributors.
- **Single CSS file.** `index.css` is 1248 lines and growing. All styles for all components live in one file. Works for this project size but would benefit from splitting if it grows.
- **BackgroundMusic.jsx exists but isn't used.** Music is handled directly in ExperienceOrchestrator via Howler. `BackgroundMusic.jsx` component appears to be dead code.
- **No TypeScript.** Plain JavaScript throughout. Type safety relies on developer discipline. Not a problem at this scale but catches bugs that JSDoc or TS would catch.
- **Prisma generated code in .gitignore.** The `server/lib/generated/prisma/` directory is gitignored, meaning `npx prisma generate` must run before the server starts. No postinstall script handles this.
- **Hardcoded theme definitions.** Themes are defined in both `CreatePage.jsx` (for the form selector) and `WishPage.jsx` (for CSS var application). If a theme is added, both files must be updated. Should be a shared constant.

## Dependency Risks

- **Prisma 6.x**: Stable, well-maintained. SQLite provider is mature.
- **Framer Motion**: Major version updates occasionally break APIs. Currently using v11+ which is stable.
- **Howler.js**: Maintenance-light project. Last major update was years ago. Works fine but if a breaking browser update occurs, fixes may be slow. Alternative: native Web Audio API.
- **sharp**: Native binary dependency. Can cause install issues on some platforms. Well-maintained by lovell.
- **file-type**: ESM-only, good maintenance. Used for magic-byte validation — critical security dependency.
- **nanoid**: Tiny, well-maintained, ESM-only. No concerns.

## Scalability Limits

| Concern | Current Limit | Mitigation |
|---------|---------------|------------|
| SQLite | ~100 concurrent writes/sec | WAL mode. Fine for expected scale. Swap to Postgres if needed (Prisma makes this a config change). |
| Filesystem photos | Limited by disk space | Fine for personal use. S3 for production. |
| nanoid(8) | ~3.5M unique IDs before collision risk becomes meaningful | Sufficient for a birthday wish app. |
| No CDN | All assets served from Express | Fine for small scale. Add Cloudflare/CDN for production. |
| No pagination | `getWishStats` loads all reactions | Fine — reaction count is small per wish. |

## Recommendations

1. **Add a postinstall script** for `prisma generate` to avoid "forgot to generate" errors:
   ```json
   "postinstall": "cd server && npx prisma generate"
   ```

2. **Extract themes to a shared constant** to eliminate the dual-definition between CreatePage and WishPage.

3. **Delete `BackgroundMusic.jsx`** if it's confirmed dead code.

4. **Add `POST /api/wish/:id/open`** or similar for TRACK-02 status page — the backend already supports it, just needs a frontend.

5. **Consider image resize on upload** to generate a display-size (800px) version alongside the thumbnail, reducing bandwidth for the birthday person.

6. **Add basic rate limiting** (e.g., `express-rate-limit`) if the app is ever exposed beyond localhost.

---

*Concerns analysis: 2026-06-20*
