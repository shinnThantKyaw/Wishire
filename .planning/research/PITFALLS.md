# Pitfalls Research

**Domain:** Interactive birthday wish generator (shareable greeting experience with animations, photos, reactions)
**Researched:** 2026-06-19
**Confidence:** MEDIUM (synthesized from training data; web verification tools unavailable)

## Critical Pitfalls

### Pitfall 1: SQLite "database is locked" under concurrent writes

**What goes wrong:**
When the birthday person opens their wish link and reactions/opens are being tracked, and simultaneously the generator checks the stats page, or multiple people open the same wish link near-simultaneously, SQLite throws `SQLITE_BUSY` errors. Prisma wraps these as "database is locked" errors. The default SQLite journal mode (rollback/deletemode) serializes all writes — only one writer at a time. If a write takes longer than the busy timeout (default 5 seconds in Prisma), the request fails entirely.

**Why it happens:**
SQLite uses file-level locking. Unlike Postgres or MySQL which handle row-level concurrency, SQLite locks the entire database file for writes. Prisma's default connection pool opens multiple connections, but only one can hold the write lock. The other connections queue up and fail if the timeout expires. This is the single most reported production issue when people deploy SQLite-backed web apps.

**How to avoid:**
- Set `PRAGMA journal_mode=WAL` (Write-Ahead Logging) — this allows concurrent readers and a single writer without blocking reads. Prisma supports this via the `sqlite` datasource `extensions` or by running it as a migration.
- Set `busy_timeout` to at least 10000ms in the connection string: `file:./dev.db?busy_timeout=10000`
- Keep writes fast and small. Batch reaction increments (e.g., use `updateMany` with an atomic increment rather than read-then-write). Avoid transactions that span HTTP request boundaries.
- Consider using a single Prisma client instance (singleton pattern) rather than creating new clients per request, as the connection pool multiplies the locking surface.
- For reactions (high-frequency writes), consider debouncing on the client side and batching on the server side — queue reaction events and flush them every 2-3 seconds rather than writing per tap.

**Warning signs:**
- Occasional 500 errors on the stats or reactions endpoints that resolve on retry
- Error logs containing "SQLITE_BUSY" or "database is locked"
- Increased latency on write endpoints under even moderate load (10+ concurrent users)

**Phase to address:**
Core storage phase (first phase that introduces SQLite/Prisma). WAL mode and busy_timeout are configuration-only changes that should be in place from the start.

---

### Pitfall 2: Framer Motion `AnimatePresence` exit animations not firing

**What goes wrong:**
When conditionally rendering elements (e.g., showing the next sentence and hiding the previous one, transitioning between gift-box-open state and wish-reveal state), exit animations silently fail. The old element just vanishes instead of animating out. This is the most common Framer Motion support question and bites nearly every project that uses it for sequenced reveals.

**Why it happens:**
`AnimatePresence` only captures exit animations for direct children that are conditionally rendered via React state changes AND have a unique `key` prop. Three common failure modes:
1. **Missing `key` prop:** Without a stable unique key, React reuses the DOM node and Framer Motion can't detect the removal.
2. **Key changes on every render:** If the key is a random ID or array index that shifts, Framer Motion treats it as a new mount rather than an exit.
3. **Parent re-render swallows exit:** If the parent of `AnimatePresence` unmounts (e.g., a route change), exit animations don't run because the entire tree is removed synchronously. This is especially relevant for the `/wish/:id` page — if someone closes the tab or navigates away, exit animations won't fire.

**How to avoid:**
- Every child inside `<AnimatePresence>` must have a stable, meaningful `key`. Use `sentence-${index}` not just `${index}` to avoid collisions across different wish instances.
- For the gift-box to wish-reveal transition: use a single `mode` state machine (`"closed" | "opening" | "revealing" | "complete"`) and swap components inside one `<AnimatePresence mode="wait">` container. The `mode="wait"` ensures exit finishes before enter begins.
- For sentence-by-sentence reveals: store the `currentSentenceIndex` in state, render all sentences up to the current index inside `<AnimatePresence>`, and use `sentence-${idx}` as the key.
- For route-level transitions, accept that exit animations on full page unmount won't fire. Design around it: put the exit animation trigger BEFORE the navigation (e.g., animate out, then call `navigate()` in the `onExitComplete` callback).

**Warning signs:**
- Elements "blink" or vanish instead of animating out during development
- Animation sequence feels jumpy — some transitions work, others don't
- Console warnings about missing keys in React dev mode

**Phase to address:**
Gift box and wish reveal animation phase (PAGE-02, PAGE-03). This is where `AnimatePresence` first appears and must be set up correctly from the start.

---

### Pitfall 3: Photo upload path traversal and file overwrite vulnerabilities

**What goes wrong:**
An attacker uploads a file named `../../../etc/passwd` or overwrites another user's photos by guessing sequential filenames. The server writes the file outside the uploads directory or corrupts existing data. Even with naive sanitization, edge cases like null bytes (`photo.php%00.jpg`) or double extensions (`photo.jpg.exe`) bypass simple filters.

**Why it happens:**
The project stores photos on the filesystem with paths in SQLite. Without deliberate security measures, the Express `multer` middleware (or equivalent) will happily write files using the original filename or a predictable naming scheme. Path traversal characters in filenames (`../`) resolve relative to the upload directory. Predictable filenames (sequential IDs, timestamps) let attackers enumerate and overwrite.

**How to avoid:**
- **Generate server-side filenames:** Use `crypto.randomUUID()` or `nanoid` to create unpredictable filenames. Never trust the client-provided filename for storage. Store the original filename in the database for display purposes only.
- **Validate file type server-side:** Check the magic bytes (file signature), not the extension. Use `file-type` npm package or read the first few bytes. JPEG starts with `FF D8 FF`, PNG with `89 50 4E 47`. Reject anything that doesn't match an allowlist of image types.
- **Restrict the upload directory:** Configure multer's `destination` to an absolute path outside the web root. Before writing, resolve the full path and verify it starts with the allowed base directory.
- **Add a size check middleware:** Use multer's `limits.fileSize` (5MB = 5 * 1024 * 1024). But also add an Express-level body size limit (`express.json({ limit: '6mb' })`) because multer's limit only applies to file fields — a malicious payload in the JSON body can bypass it.
- **Serve uploads through a controlled route:** Don't expose `/uploads/` as a static directory directly. Use `GET /api/uploads/:filename` with a controller that validates the filename format (UUID only, no path separators) before reading from disk.

**Warning signs:**
- Original filenames used directly for disk storage
- Static serving of the uploads directory via `express.static`
- No magic-byte validation on uploaded files
- Sequential or timestamp-based filenames

**Phase to address:**
Photo upload phase (PHOTO-01, PHOTO-02). Security must be built in from the first implementation — retrofitting is painful.

---

### Pitfall 4: canvas-confetti memory leak on repeated triggers and mobile frame drops

**What goes wrong:**
The confetti finale runs smoothly the first time, but after the user hits "Replay" (PAGE-08) and triggers the confetti again, the browser tab becomes sluggish, the confetti stutters, and on mobile the page may crash entirely. Memory profiling shows unreleased canvas contexts and orphaned `requestAnimationFrame` loops.

**Why it happens:**
`canvas-confetti` creates a full-screen canvas element and runs a `requestAnimationFrame` loop for the duration of the particle animation. The default `fire()` call creates particles that last ~3-5 seconds. If you call `fire()` again before the previous batch has fully settled, two animation loops run concurrently. On replay, if you don't clean up the previous canvas, a new one gets created on top. After 3-4 replays on mobile, the GPU memory is exhausted.

Additionally, the default particle count (`particleCount: 200`) and spread (`spread: 100`) are tuned for desktop. On mobile, 200 particles at 60fps can drop to 15fps, making the "magical finale" feel broken instead of celebratory.

**How to avoid:**
- **Always keep a ref to the confetti instance** and call its cleanup. `canvas-confetti` returns a Promise that resolves when the animation completes. Track whether an animation is in flight and don't start a new one until it resolves.
- **Wrap confetti in a `useEffect` cleanup:** Create the canvas on mount, store a ref, and remove it in the cleanup function. On replay, destroy the old canvas before creating a new one.
- **Reduce particles on mobile:** Use `window.innerWidth < 768` to switch to `particleCount: 80` and `spread: 70`. Test on a real device, not just Chrome DevTools device mode.
- **Use a single shared canvas:** Instead of letting `canvas-confetti` create its own canvas each time, create one `<canvas>` element in your component that covers the viewport (`position: fixed; inset: 0; pointer-events: none; z-index: 9999`), get its context, and pass it as `confetti.create(canvas, { resize: true })`. Reuse this instance across replays.
- **Call `confetti.reset()` before `confetti()`** on replay to clear any stuck particles.

**Warning signs:**
- Tab memory usage climbs on each replay (visible in Chrome Task Manager, Shift+Esc)
- Confetti animation becomes choppy on second or third replay
- Mobile Safari crashes or reloads the page after confetti
- Multiple overlapping `<canvas>` elements visible in DevTools Elements panel

**Phase to address:**
Confetti finale phase (PAGE-05). The shared canvas approach and mobile-aware particle counts should be part of the initial implementation.

---

### Pitfall 5: React Router direct URL access returning 404 on production

**What goes wrong:**
The generator shares a link like `https://birthdaywish.app/wish/abc123`. The birthday person taps it. Instead of seeing the gift box, they get a 404 page — or worse, the raw JSON response from the SPA's fallback. This happens because the production server (or static host) doesn't know that `/wish/abc123` should serve `index.html`.

**Why it happens:**
React Router handles routing client-side. When the user navigates within the app (clicking "Open Link"), the SPA intercepts the click and renders the correct component without a server request. But when someone opens a shared link directly, the browser makes a GET request to `/wish/abc123`. The server doesn't have a file at that path and returns 404. This is the classic SPA routing problem and the #1 reason shareable links break in production.

Express is already set up to serve the Vite build, but only if it's configured to fall back to `index.html` for unknown routes.

**How to avoid:**
In the Express server configuration, add a catch-all route AFTER all API routes but BEFORE the 404 handler:
```js
// After all API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});
```
For development, Vite's dev server handles this automatically. For production, this single line is the difference between working shareable links and broken ones.

Also, verify that the API routes are matched first (Express matches routes in order of registration). If the catch-all comes before `/api/wish/:id`, the API breaks.

**Warning signs:**
- Shareable links work in `npm run dev` but return 404 or blank page in production build
- Direct URL access fails but in-app navigation works
- The page flashes raw HTML or JSON before rendering

**Phase to address:**
Shareable link generation phase (WISH-02). This must work before anyone shares a link.

---

### Pitfall 6: Photo-heavy wish pages causing 10+ second load times on mobile

**What goes wrong:**
The birthday person opens their wish on a phone with a slow 4G connection. The page load spinner sits for 8-12 seconds while 5 photos at up to 5MB each (25MB total) download sequentially before anything renders. By the time it loads, the surprise is ruined.

**Why it happens:**
The naive approach renders `<img src={photoUrl}>` for all photos. The browser discovers all image URLs during the initial HTML parse and starts downloading them all. On a slow connection, even with parallel downloads, 25MB of images blocks the critical rendering path. The gift box animation is ready but hidden behind a loading state tied to all assets being loaded.

**How to avoid:**
- **Generate thumbnails on upload:** When a photo is uploaded, use `sharp` to create a 300px-wide thumbnail alongside the original. Store both paths. The wish page loads thumbnails first (they're ~30-50KB each) and lazy-loads full-resolution images only when the photo gallery finale appears (PAGE-06).
- **Use `loading="lazy"` and explicit `width`/`height` attributes** to prevent layout shift.
- **Show the gift box immediately:** Don't block the initial render on image loading. The gift box, sender name, and first sentence can render with just text. Load photos in the background.
- **Progressive image loading:** Use a tiny blurred placeholder (can be a 10px base64 encoded version stored at upload time, or a CSS blur-up technique) that transitions to the full image.
- **Set a `max-age` Cache-Control header** on uploaded photos (e.g., 1 year) since the filename is a UUID and content never changes.

**Warning signs:**
- Lighthouse Performance score below 50 on mobile simulation
- Largest Contentful Paint (LCP) over 4 seconds
- Users on throttled connections see a white screen for multiple seconds before anything renders

**Phase to address:**
Photo upload phase (PHOTO-01, PHOTO-02) and wish display phase (PAGE-04). Thumbnail generation must happen at upload time; lazy loading is a display concern.

---

### Pitfall 7: Reaction counting without debouncing causing write storms and inaccurate counts

**What goes wrong:**
The heart button on PAGE-09 lets users tap multiple times. If each tap fires an immediate POST to `/api/wish/:id/reactions`, a user tapping rapidly 10 times in 2 seconds sends 10 HTTP requests. On the server, 10 concurrent SQLite writes contend for the lock (see Pitfall 1). Some fail with 500s. The user sees the heart count jump around inconsistently. Worse, if `increment: 1` is used, a failed request that the client retries produces a double-count.

**Why it happens:**
The naive implementation treats each tap as an independent event. No client-side batching, no idempotency, no debouncing. Combined with SQLite's write serialization, this creates a perfect storm of race conditions and user-visible inconsistency.

**How to avoid:**
- **Client-side debounce with local state:** Maintain an `optimisticCount` in React state. Update it immediately on tap (for instant UI feedback). Batch-send the accumulated count every 2-3 seconds or when the user stops tapping for 800ms. Use a `useRef` to track the `pendingDelta` and flush it in a `useEffect` cleanup or interval.
- **Server-side: use `updateMany` with atomic increment:** Instead of reading the current count, adding 1, and writing back (which is a race condition), use Prisma's atomic increment:
  ```js
  await prisma.wish.update({
    where: { id },
    data: { heartCount: { increment: delta } }
  });
  ```
  This is a single atomic operation that SQLite handles correctly even under WAL mode.
- **Use upsert for reaction rows:** For per-reaction-type counts (emoji reactions), use `upsert` with an atomic increment on the count field rather than a separate create-or-update logic.
- **Add idempotency keys:** If the client retries a failed batch, the server should recognize "I already processed batch-X" and not double-count. Store the last processed `idempotencyKey` per wish.

**Warning signs:**
- Rapid tapping produces fewer reactions than expected (requests silently failing)
- Reaction count decreases after appearing to increase (stale read-then-write race)
- Multiple 500 errors in the network tab when tapping the heart button quickly

**Phase to address:**
Reactions phase (PAGE-09). Client-side debouncing and server-side atomic increments should be the initial implementation, not an optimization.

---

### Pitfall 8: Background audio autoplay blocked by browser policy

**What goes wrong:**
PAGE-07 specifies that background music plays during the experience. On page load, `new Audio(url).play()` is called. On Chrome, Safari, and Firefox, the promise rejects with `NotAllowedError: play() failed because the user didn't interact with the document first`. The music never starts, and depending on error handling, the entire wish experience might stall waiting for audio that never plays.

**Why it happens:**
All modern browsers block autoplaying audio before user interaction. This is by design to prevent annoying ads. The policy requires a user gesture (click, tap, keypress) on the page before audio can play. Since the birthday person's first interaction is tapping the gift box (PAGE-02), audio must be initiated from that event handler.

**How to avoid:**
- **Tie audio start to the gift box tap:** In the `onClick` handler for the gift box, call `audio.play()` directly (or through a ref created earlier). The user gesture "unlocks" the audio context.
- **Pre-create the `Audio` object early** (e.g., in a `useEffect` on mount) but don't call `.play()` until the tap. This avoids the delay of fetching the audio file when the gift box opens.
- **Handle the play() rejection gracefully:** Wrap in a try/catch. If it fails, show a subtle "tap for sound" indicator rather than crashing the experience.
- **For replay (PAGE-08):** The first tap already unlocked audio for the page session. Replay should work without additional user gesture. But reset the audio to `currentTime = 0` before playing again.
- **Use a single audio track:** Don't layer multiple Audio instances for sound effects (gift box open sound) and background music. Use one `<audio>` element for background music and short `Audio` instances for SFX. Coordinating them avoids the "audio context limit" on mobile Safari.

**Warning signs:**
- Console warning: "The AudioContext was not allowed to start"
- Music plays in development (where browser policies are sometimes relaxed) but not in production
- Safari on iOS never plays audio despite working on desktop

**Phase to address:**
Gift box animation phase (PAGE-02). This is where the first user interaction happens and audio must be initialized.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Using `express.static` for `/uploads/` directly | Two-line setup | Path traversal exposure, no access logging, no auth. Every uploaded file is world-readable at a guessable URL if filenames aren't random. | Only if combined with UUID filenames AND a strict `express.static` `setHeaders` that adds `X-Content-Type-Options: nosniff`. Better to use a controller route. |
| Storing photos as Base64 in SQLite | No filesystem management, "everything in one place" | 25MB of Base64 (33MB encoded) in SQLite bloats the DB file, slows all queries, makes backups huge. SQLite has a 2GB default max but performance degrades well before that. | Never for photos. Use filesystem + DB path reference. |
| Client-side `fetch` with no error handling for reactions | Faster to build | Silent failures. User thinks their heart tap counted but it didn't. Undermines the emotional experience. | Never for user-visible state. At minimum, show optimistic update and log errors. |
| Hard-coding the 5-photo, 5MB limits only in frontend validation | Faster to ship | Malicious clients can bypass entirely. Server has no protection. Disk fills up, DB gets corrupted paths. | Never. File limits must be enforced server-side. Frontend validation is UX convenience only. |
| Using `Date.now()` as filename | No UUID dependency | Collisions under concurrent uploads. Predictable — attackers can enumerate. Time-based filenames leak upload timestamps. | Never. Use `crypto.randomUUID()`. |
| Not backing up the uploads directory | One less thing to configure | Photo loss is permanent and irrecoverable. The DB has paths but the files are gone. Worse than pure data loss — it's a broken experience that taunts users with missing images. | Only during initial local development. Before first user, set up backup (even if it's just a cron job that `rsync`s to another disk). |
| Single `PrismaClient` instance created per request | No need to think about lifecycle | Connection pool exhaustion. Each PrismaClient opens its own connection pool. Under load, hundreds of connections to SQLite cause "database is locked" storms. | Never. Use the singleton pattern (one `PrismaClient` per process, shared via module-level export). |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Framer Motion + React Router | Animating route transitions without `AnimatePresence` wrapping `<Routes>` or `<Outlet>`. Exit animations of the leaving route never fire. | Accept that full-route exit animations are unreliable. Instead, animate within the page component (e.g., gift box exit before navigating). Or use `useLocation` to track route changes and manage transitions manually. |
| Express body parser + multer | Setting `express.json({ limit: '50mb' })` globally, allowing huge JSON payloads. Or conversely, forgetting to increase the limit above the default 100KB when photo metadata (file data in JSON) needs more room. | Use `express.json({ limit: '1mb' })` for general routes (wish text won't exceed this). For upload, multer handles the multipart parsing and has its own `fileSize` limit. Do NOT send photos as base64 in JSON. Use `multipart/form-data`. |
| canvas-confetti + React useState | Creating a new confetti instance on every render cycle because it's initialized inside the component body without `useRef` or `useMemo`. | Create the confetti instance once with `useRef`: `const confettiRef = useRef(confetti.create(canvasEl, { resize: true }))`. Then call `confettiRef.current(...)` in event handlers. |
| Prisma + SQLite migrations | Using `prisma migrate dev` which creates migration files, but forgetting that SQLite doesn't support `ALTER TABLE ... ALTER COLUMN` in the same way. Prisma recreates the entire table for some alterations, which loses data if not handled. | Always test migrations with a copy of production data. For any migration that Prisma flags as "requires table recreation," verify no data loss occurs. For a greenfield project, this is less critical but becomes a problem once real wishes exist. |
| React re-renders + Framer Motion | Using inline object/array values in animation props (e.g., `animate={{ opacity: 1 }}`). React creates a new object reference on every render, causing Framer Motion to restart animations. | Define animation variants outside the component (at module level) or memoize them with `useMemo`. Use the `variants` prop with named variants rather than inline `animate` objects for complex animations. |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Full-size photos in the wish reveal | Slow page load, layout shift as images load, high data usage on mobile. Lighthouse flags enormous network payloads. | Generate 300px thumbnails at upload time using `sharp`. Serve thumbnails for the wish reveal, full-size only for the gallery finale. | With even 2-3 photos at 5MB each and a mobile visitor. |
| No `Cache-Control` on uploaded photos | Browser re-downloads photos on every replay. User sees a flash of empty images on revisit. | Set `Cache-Control: public, max-age=31536000, immutable` on GET `/api/uploads/:filename` responses. Filenames are UUIDs — they never change. | On first replay. Gets worse with each revisit. |
| Confetti animation on main thread during photo loading | Confetti stutters or freezes while photos decode. The "magical moment" feels broken. | Defer confetti by 500ms after the final sentence appears. This gives images time to decode. Use `requestIdleCallback` or a simple `setTimeout`. Trigger confetti after images in the current viewport are loaded. | On mobile devices with slower image decoders. |
| All photos loaded as `<img>` in initial HTML | Browser opens 5+ concurrent connections to download photos. On HTTP/1.1 (some proxies, older mobile networks), this saturates the connection limit and blocks API calls. | Use `loading="lazy"` on all photos except the first one shown. Intersection Observer for photos that appear later in the wish reveal. | On HTTP/1.1 connections or congested mobile networks. |
| Express serving large static files without streaming | Large photo response blocks the Node.js event loop. Other requests queue up. | Ensure `res.sendFile()` is used (it streams internally) rather than `fs.readFileSync()` + `res.send()`. Consider a CDN in front for production. | Under any concurrent load — even 10 users viewing wish pages. |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| No file type validation (extension-only check) | Attacker uploads a `.jpg` that is actually an HTML file with `<script>` tags. Served with the wrong MIME type, it executes in the browser. | Validate magic bytes with `file-type` package. Only allow `image/jpeg`, `image/png`, `image/webp`, `image/gif`. Reject everything else at the server level, not just in the frontend. |
| Not limiting upload count server-side | Attacker bypasses the frontend "5 photos" limit and uploads 1000 files, filling the disk and causing a denial of service. | Enforce the max file count in multer config (`limits: { files: 5 }`). Track per-IP or per-session upload counts as a secondary defense. |
| Wish ID enumeration | Sequential or short numeric IDs let anyone iterate through `/wish/1`, `/wish/2`, etc. and read private birthday wishes. | Use `crypto.randomUUID()` for wish IDs (not auto-increment integers). UUIDv4 provides 122 bits of entropy — enumeration is computationally infeasible. |
| No CORS configuration on the API | Any website can make requests to the API, potentially scraping wishes or spamming reactions. | Configure CORS to allow only the frontend origin. Since this is a single-domain app, use `cors({ origin: process.env.FRONTEND_URL })`. |
| XSS in wish text rendering | Generator writes `<img src=x onerror=alert(1)>` as a wish message. If rendered with `dangerouslySetInnerHTML`, it executes when the birthday person opens it. | NEVER use `dangerouslySetInnerHTML` for user-generated content. Render wish text as plain text in `<p>` or `<span>` tags. React escapes text content by default. |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Blocking the entire page behind a loading spinner until all assets load | The birthday person stares at a spinner for 5-10 seconds. The surprise is already dead before they see anything. | Show the sender's name and gift box immediately. Load assets progressively. The gift box should be tappable within 1-2 seconds of page load, even if photos are still loading. |
| Not handling the "gift box already opened" state | If the birthday person opens the link, experiences the wish, and comes back later, they see the gift box again. Tapping it either replays the whole thing from scratch (confusing) or does nothing (broken). | Detect if the wish has been previously opened (via a localStorage flag or server-side `opened` count). Show a "You've received a wish from Priya" landing page with a "Replay" button instead of the gift box. |
| Tap-to-reveal without visual affordance | The birthday person doesn't know they need to tap to reveal the next sentence. They wait, thinking it's an auto-playing animation. Nothing happens. They get confused and leave. | Show a subtle pulsing indicator ("tap to continue") after each sentence appears. Use a gentle arrow or shimmer effect. Auto-advance after 8 seconds as a fallback. |
| Confetti blocking interaction | The confetti canvas is full-screen with `pointer-events: auto` (the default). The user can't tap the reaction buttons underneath. | Set the confetti canvas to `pointer-events: none`. All user interaction passes through to the elements below. |
| No loading state after photo upload | Generator clicks "Generate," photos are uploading (potentially 25MB on a slow connection), and nothing happens. They think it's broken and leave. | Show upload progress (multer doesn't provide this natively, but you can track `xhr.upload.onprogress` on the client side via `axios` or raw `XMLHttpRequest`). Show a progress bar or "Uploading 3 of 5 photos..." status. |
| Share link that's too long or ugly | A UUID-based link like `/wish/550e8400-e29b-41d4-a716-446655440000` is 36 characters. Hard to share via text message, looks intimidating. | Consider using `nanoid` with a shorter alphabet (8-10 characters) for the public-facing ID: `/wish/k8x2Pm9Q`. Keep the UUID as the primary key internally if needed. Balance uniqueness with shareability. |

## "Looks Done But Isn't" Checklist

- [ ] **Photo upload:** Often missing server-side file type validation — verify magic byte checking, not just extension filtering
- [ ] **Shareable links:** Often missing the Express catch-all route — verify direct URL access to `/wish/:id` works in production build (`npm run build && npm run preview`)
- [ ] **Replay (PAGE-08):** Often only resets the text state but not the confetti canvas, audio position, or photo animation states — verify a full second playthrough is identical to the first
- [ ] **Confetti finale:** Often works on desktop but not mobile — verify on a real iOS Safari and Android Chrome device, not just DevTools emulation
- [ ] **Background music:** Often plays in Chrome but not Safari — verify audio plays after the gift box tap on iOS Safari
- [ ] **Photo gallery finale (PAGE-06):** Often broken when fewer than 5 photos are uploaded — verify with 1, 3, and 5 photos
- [ ] **Error states:** Often untested — verify what happens when: the API is unreachable, a photo fails to load (broken image), the wish ID doesn't exist, or the database file is missing
- [ ] **Mobile responsive:** Often tested only at iPhone 12 size — verify at iPhone SE (375px), iPad (768px), and a large desktop (1920px). The gift box and confetti must work at all sizes.
- [ ] **Reaction persistence:** Often uses in-memory state that resets on page refresh — verify heart count and emoji reactions survive a page reload
- [ ] **WAL mode:** Often forgotten until the first production incident — verify `PRAGMA journal_mode` returns `wal` in production, not `delete`

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| SQLite locking (Pitfall 1) | LOW | Add `?busy_timeout=10000` to connection string, enable WAL mode via migration. No data migration needed. Deploy and monitor. |
| AnimatePresence missing keys (Pitfall 2) | MEDIUM | Audit every `<AnimatePresence>` child for stable `key` props. Add keys where missing. Test each animation transition in isolation. May require restructuring component tree if keys were fundamentally wrong. |
| Photo path traversal (Pitfall 3) | HIGH | If already in production with user uploads: audit existing files for path traversal, rename all files to UUIDs, update all DB path references, add validation middleware. If pre-production: implement once, verify with penetration testing. |
| Canvas-confetti memory leak (Pitfall 4) | LOW | Implement shared canvas pattern, add cleanup in useEffect return. Test with 10+ replays. No data migration needed. |
| SPA 404 (Pitfall 5) | LOW | Add the `app.get('*', ...)` catch-all route. Verify with production build. No data impact. |
| Photo load times (Pitfall 6) | HIGH | If already in production: retroactively generate thumbnails for all existing uploads via a migration script. Add `loading="lazy"` to existing templates. If pre-production: implement at upload time from the start. |
| Reaction race conditions (Pitfall 7) | MEDIUM | Replace read-then-write with atomic increments. Add client-side debouncing. May need to reconcile any inconsistent counts from before the fix. |
| Audio autoplay (Pitfall 8) | LOW | Move `audio.play()` from page load to gift box click handler. Test across browsers. |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| SQLite locking (Pitfall 1) | Core setup (first data phase) | Run `PRAGMA journal_mode` in production, confirm WAL. Load-test reactions endpoint with 20 concurrent requests. |
| AnimatePresence exits (Pitfall 2) | Gift box animation (PAGE-02) and sentence reveal (PAGE-03) | Test every animation transition in the flow. Verify no elements "blink" instead of animating. |
| Photo path traversal (Pitfall 3) | Photo upload (PHOTO-01, PHOTO-02) | Run a security test: attempt to upload a file with `../` in the filename, verify rejection. Check magic byte validation. |
| Confetti memory leak (Pitfall 4) | Confetti finale (PAGE-05) | Open Chrome Task Manager, trigger confetti 5 times, verify no memory growth. Test on real mobile device. |
| React Router 404 (Pitfall 5) | Shareable link (WISH-02) | Build production, run `npm run preview`, open a `/wish/test-id` URL directly. Verify page loads. |
| Photo load times (Pitfall 6) | Photo upload (PHOTO-01) and wish display (PAGE-04) | Lighthouse audit with throttled 4G. LCP must be under 2.5s. Verify thumbnails are generated. |
| Reaction races (Pitfall 7) | Reactions (PAGE-09) | Rapid-tap heart button 20 times. Verify final count equals 20. Check server logs for errors. |
| Audio autoplay (Pitfall 8) | Gift box animation (PAGE-02) | Test on iOS Safari and Chrome. Verify music starts on gift box tap. No console errors. |

## Sources

- Framer Motion documentation: AnimatePresence, exit animations, and layout animations patterns
- Prisma documentation: SQLite datasource configuration, connection management, and concurrent write handling
- SQLite official documentation: WAL mode, busy timeout, and concurrent access patterns
- React Router documentation: Client-side routing, catch-all patterns for SPAs, direct URL access handling
- canvas-confetti GitHub repository: Canvas reuse patterns, cleanup, and mobile considerations
- Multer documentation: File upload security, limits configuration, path handling
- Web Audio API / browser autoplay policies (Chrome, Safari, Firefox)
- OWASP: File upload security guidelines, path traversal prevention

---
*Pitfalls research for: Interactive birthday wish generator*
*Researched: 2026-06-19*
*Note: Research synthesized from training data due to web search tool unavailability. Confidence: MEDIUM. Verify all claims against current library documentation before implementation.*
