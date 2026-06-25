# Phase 1: Foundation - Context

**Gathered:** 2026-06-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Data model + API skeleton — wishes can be created and retrieved. This covers the Prisma schema (Wish, Photo, Reaction, Stat models), Express API routes (POST /api/wish, GET /api/wish/:id), SQLite WAL mode configuration, and SPA catch-all routing.

**Note:** The codebase already has a working implementation of all Phase 1 requirements. This context captures refinement decisions for the existing code, not greenfield build decisions.

</domain>

<decisions>
## Implementation Decisions

### Error Handling
- **D-01:** Error response format: `{error: string, code?: string}` — always include human-readable `error`, optionally include machine-readable `code`
- **D-02:** Error codes to use: `VALIDATION_ERROR` (400), `NOT_FOUND` (404), `DB_ERROR` (500), `UPLOAD_ERROR` (400/500)
- **D-03:** Always surface real error messages in 500 responses — do not hide behind generic "Internal server error". This is a small project with no auth; hiding errors makes debugging harder with no security benefit.
- **D-04:** Add centralized Express error-handling middleware (final `app.use((err, req, res, next) => ...)` handler). Routes throw custom error classes (`ValidationError`, `NotFoundError`), middleware formats the response consistently.
- **D-05:** Replace string-matching on error messages (current: `err.message.includes("required")`) with proper error class instances (`throw new ValidationError("...")`)

### Claude's Discretion
- Error handler middleware file location (e.g., `server/middleware/errorHandler.js`)
- Custom error class file location (e.g., `server/lib/errors.js`)
- Whether to add request IDs for debugging (low priority, can add later)
- Whether to add `NODE_ENV`-based error detail levels (deferred — always surface for now)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Architecture & Data Model
- `.planning/codebase/ARCHITECTURE.md` — System overview, request flows, data model, key patterns
- `.planning/codebase/STACK.md` — Technology stack, versions, configuration
- `.planning/codebase/STRUCTURE.md` — File structure, entry points, source organization

### Research
- `.planning/research/PITFALLS.md` — 8 critical pitfalls (Pitfall 1: SQLite locking, Pitfall 5: SPA 404)
- `.planning/research/ARCHITECTURE.md` — Component boundaries, build order

### Existing Implementation
- `server/prisma/schema.prisma` — Current Prisma schema (Wish, Photo, Reaction, Stat)
- `server/index.js` — Express server setup, routes, SPA catch-all
- `server/services/wishService.js` — Business logic, validation, sentence splitting
- `server/routes/wishes.js` — API routes (current error handling to refactor)
- `server/routes/photos.js` — Upload routes (current error handling to refactor)
- `server/lib/prisma.js` — Prisma singleton with WAL mode

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `server/lib/prisma.js`: Prisma singleton already configured with WAL mode and busy_timeout — no changes needed
- `server/lib/flair.js`: Zodiac/birthstone/birthflower lookup — pure functions, no changes needed
- `server/prisma/schema.prisma`: Schema already has all 4 models with cascade deletes, indexes, and unique constraints — no changes needed
- `server/middleware/upload.js`: Multer config with UUID filenames, 5MB limit, MIME filter — no changes needed

### Established Patterns
- Routes use `Router()` from Express, mounted in `server/index.js`
- Services throw generic `Error` — needs refactoring to throw custom error classes
- Routes catch errors with try/catch and format responses inline — needs refactoring to throw to centralized handler
- `nanoid(8)` for wish IDs, `crypto.randomUUID()` for photo filenames

### Integration Points
- `server/index.js` line 13: Error handler middleware goes AFTER all route mounts (after line 18)
- `server/routes/wishes.js`: Replace inline error handling with `throw new ValidationError(...)` / `throw new NotFoundError(...)`
- `server/routes/photos.js`: Same refactoring pattern

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for error handling middleware and custom error classes.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 1-Foundation*
*Context gathered: 2026-06-20*
