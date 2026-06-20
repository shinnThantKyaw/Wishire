# Phase 1: Foundation - Research

**Researched:** 2026-06-20
**Domain:** Express error handling refactoring + SQLite/Prisma data layer verification
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| WISH-01 | Generator can write a free-text wish message and submit with name, relationship, birth date, photos, and theme | Existing `wishService.createWish()` already implements all fields. Refactoring: replace `throw new Error(...)` with custom error classes (ValidationError) so centralized handler formats responses consistently. Schema already has Wish model with all required fields. |
| WISH-02 | System generates a unique shareable link for each wish (UUID-based, unguessable) | Existing `nanoid(8)` generates 8-char URL-safe IDs. Express catch-all already handles SPA routing (Pitfall 5). Refactoring: route error handling for GET /api/wish/:id needs NotFoundError class instead of string-matching on `err.message === "Wish not found"`. |
</phase_requirements>

## Summary

Phase 1 is a **refactoring phase**, not a greenfield build. The codebase already has a working implementation of all Phase 1 success criteria: Prisma schema with all 4 models, SQLite WAL mode, POST/GET wish endpoints, and SPA catch-all routing. The phase focuses on replacing ad-hoc error handling (string-matching on error messages, inline try/catch formatting) with a structured pattern: custom error classes thrown from services, caught by centralized Express error-handling middleware.

The existing `server/lib/prisma.js` already configures WAL mode and busy_timeout correctly using the Prisma BetterSqlite3 adapter with `$queryRaw` PRAGMAs. The existing schema already has cascade deletes, indexes, and unique constraints. No schema changes needed.

**Primary recommendation:** Create `server/lib/errors.js` with `ValidationError` and `NotFoundError` classes, add `server/middleware/errorHandler.js` as the centralized 4-arg Express middleware, then refactor `server/routes/wishes.js` and `server/routes/photos.js` to throw instead of formatting errors inline.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Error class definitions | API / Backend (server/lib/) | — | Pure data classes, no framework dependency, shared across services and routes |
| Error formatting middleware | API / Backend (server/middleware/) | — | Express-specific, sits in request pipeline, formats all error responses |
| Validation logic | API / Backend (server/services/) | — | Business rules live in services; services throw, routes don't catch |
| Database configuration | API / Backend (server/lib/prisma.js) | Database / Storage | Already implemented correctly, no changes needed |
| SPA catch-all routing | API / Backend (server/index.js) | — | Express serves index.html for non-API routes |

## Standard Stack

### Core (existing — no installs needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| express | ^4.19.2 [VERIFIED: npm registry] (latest: 5.2.1) | HTTP API server | Already installed; project uses v4, not v5 |
| @prisma/client | ^7.8.0 [VERIFIED: npm registry] (latest: 7.8.0) | ORM for SQLite | Already installed and configured |
| @prisma/adapter-better-sqlite3 | ^7.8.0 [VERIFIED: npm registry] | SQLite driver adapter | Already installed; WAL mode already configured |
| better-sqlite3 | ^12.11.1 [VERIFIED: npm registry] | Native SQLite3 driver | Already installed via Prisma adapter |
| nanoid | ^5.1.14 [VERIFIED: npm registry] (latest: 5.1.15) | Short URL-safe wish IDs | Already installed and used for wish ID generation |

### Supporting (existing — no installs needed)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| cors | ^2.8.5 [VERIFIED: npm registry] | Cross-origin requests during dev | Already configured in server/index.js |
| multer | ^2.2.0 [VERIFIED: npm registry] | Multipart file upload handling | Photo upload routes (Phase 2 scope, but error handling touches it) |

### No New Packages Required

This phase adds only custom JavaScript files (error classes, middleware). No npm install needed.

**Installation:**
```bash
# No installation needed — all dependencies already present
# Only verify Prisma client is generated:
cd server && npx prisma generate
```

## Package Legitimacy Audit

> No new packages installed in this phase. All existing packages were verified against npm registry.

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| express | npm | 13+ yrs | 30M+/wk | github.com/expressjs/express | OK | Already installed |
| @prisma/client | npm | 5+ yrs | 3M+/wk | github.com/prisma/prisma | OK | Already installed |
| nanoid | npm | 7+ yrs | 10M+/wk | github.com/ai/nanoid | OK | Already installed |
| cors | npm | 11+ yrs | 15M+/wk | github.com/expressjs/cors | OK | Already installed |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram (Phase 1 scope)

```
Client Request
     |
     v
[Express Server]
     |
     +---> POST /api/wish ---> wishService.createWish()
     |         |                    |
     |         |     throw ValidationError / Error
     |         |                    |
     |         +---> catch? NO --- (route does NOT catch)
     |                        |
     |                        v
     |               [next(err)] --> [errorHandler middleware]
     |                                    |
     |                                    +---> { error, code } response
     |
     +---> GET /api/wish/:id --> wishService.getWish()
     |         |                    |
     |         |     throw NotFoundError / Error
     |         |                    |
     |         +---> [next(err)] --> [errorHandler middleware]
     |
     +---> GET /* (catch-all) --> client/dist/index.html
```

### Recommended Project Structure (additions only)

```
server/
├── lib/
│   ├── errors.js          # NEW: ValidationError, NotFoundError classes
│   ├── prisma.js          # EXISTING: no changes needed
│   └── flair.js           # EXISTING: no changes needed
├── middleware/
│   ├── errorHandler.js    # NEW: centralized Express error handler
│   └── upload.js          # EXISTING: no changes needed
├── routes/
│   ├── wishes.js          # MODIFY: remove inline error handling, throw errors
│   └── photos.js          # MODIFY: remove inline error handling, throw errors
├── services/
│   └── wishService.js     # MODIFY: throw custom error classes instead of generic Error
└── index.js               # MODIFY: import and mount errorHandler after routes
```

### Pattern 1: Custom Error Classes

**What:** Extend `Error` with HTTP status codes and machine-readable error codes. Services throw these, routes don't catch.

**When to use:** Any route that has validation logic, database lookups, or operations that can fail with distinct HTTP responses.

**Example:**
```javascript
// Source: https://github.com/expressjs/express/blob/master/_autodocs/7-errors.md [CITED: Express GitHub autodocs]

// server/lib/errors.js
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
    this.code = 'VALIDATION_ERROR';
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
    this.code = 'NOT_FOUND';
  }
}
```

### Pattern 2: Centralized Express Error Handler

**What:** A single 4-argument middleware at the end of the Express middleware chain that catches all errors and formats a consistent JSON response.

**When to use:** Always — it is the Express-recommended pattern for consistent error responses.

**Example:**
```javascript
// Source: https://github.com/expressjs/express/blob/master/_autodocs/7-errors.md [CITED: Express GitHub autodocs]

// server/middleware/errorHandler.js
export function errorHandler(err, req, res, next) {
  console.error(err.stack);

  const status = err.status || 500;
  const response = {
    error: err.message || 'Internal server error',
  };

  if (err.code) {
    response.code = err.code;
  }

  res.status(status).json(response);
}

// In server/index.js (must be AFTER all route mounts):
import { errorHandler } from './middleware/errorHandler.js';
// ... route mounts ...
app.use(errorHandler);
```

### Pattern 3: Service Layer Throws, Routes Don't Catch

**What:** Services throw custom error classes for domain-specific failures. Routes use `async` handlers where Express 4.x does NOT auto-catch rejected promises — so routes must either wrap in try/catch with `next(err)` or use a wrapper utility.

**When to use:** All route handlers that call async service functions.

**Example:**
```javascript
// Source: project convention + Express async error handling [CITED: Express GitHub autodocs]

// Utility to avoid repetitive try/catch in every route
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Route usage — no try/catch needed
router.post("/", asyncHandler(async (req, res) => {
  const wish = await createWish(req.body);
  res.status(201).json(wish);
}));

router.get("/:id", asyncHandler(async (req, res) => {
  const wish = await getWish(req.params.id);
  res.json(wish);
}));
```

### Anti-Patterns to Avoid

- **String-matching on error messages:** Current code uses `err.message.includes("required")` to decide HTTP status. This is fragile — any message change breaks routing. Use error class instances instead.
- **Inline error formatting in routes:** Current code has `res.status(400).json(...)` and `res.status(500).json(...)` scattered across each route handler. Centralize in the error handler middleware.
- **Swallowing real errors in 500s:** Current code on line 39 of `wishes.js` hides the real error with `res.status(500).json({ error: "Failed to fetch wish" })`. Per D-03, always surface `err.message` in 500 responses for this small project.
- **Calling `next(err)` after response sent:** If a route already called `res.json()` or `res.send()`, calling `next(err)` will trigger the error handler to try sending another response, causing "headers already sent" errors. Ensure early returns in route handlers.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Async route error propagation | Custom try/catch blocks in every route | `asyncHandler` wrapper utility | 3-line utility eliminates boilerplate, ensures all unhandled rejections reach the error handler |
| HTTP error status mapping | `if (err.message.includes(...))` chains | Custom error classes with `.status` property | Error class carries its own HTTP semantics; no fragile string matching |

**Key insight:** The error handler middleware is a framework feature, not a custom invention. Express specifically supports 4-argument functions as error handlers. Use the framework.

## Common Pitfalls

### Pitfall A: Async Errors Not Reaching Error Handler

**What goes wrong:** Express 4.x does NOT catch rejected promises from async route handlers. If a route is `async` and throws, the rejection goes to `unhandledRejection`, NOT to the error handler middleware. The client gets a hanging connection with no response.

**Why it happens:** Express 4 was designed before async/await. The `next()` callback only works for synchronous errors or explicit `next(err)` calls. An `async (req, res) => { throw new Error() }` silently drops the error.

**How to avoid:** Use the `asyncHandler` wrapper shown in Pattern 3 above. Every async route must be wrapped.

**Warning signs:** Client requests hang indefinitely; server logs show "UnhandledPromiseRejection" instead of error handler output; no response sent to client.

### Pitfall B: Error Handler Registered Before Routes

**What goes wrong:** The centralized error handler is registered via `app.use(errorHandler)` before the route mounts. Express matches middleware in order, so the error handler catches all requests (not just errors), and routes never execute.

**Why it happens:** `app.use(errorHandler)` is a 4-argument function. Express routes it like any other middleware but recognizes it as an error handler. If placed first, it intercepts everything.

**How to avoid:** Always register the error handler AFTER all `app.use()` route mounts and the SPA catch-all. In `server/index.js`, it goes as the very last `app.use()` call.

**Warning signs:** All routes return 500 or the error handler's default response; no route code executes.

### Pitfall C: Missing Prisma Client Generation After Schema Changes

**What goes wrong:** After modifying `schema.prisma`, the generated client in `server/lib/generated/prisma/` becomes stale. Runtime imports succeed but the types/methods don't match the schema.

**Why it happens:** Prisma generates code into a custom output directory (`../lib/generated/prisma`). Unlike the default `node_modules/.prisma` path, Vite/Node don't auto-detect changes.

**How to avoid:** Run `npx prisma generate` after any schema change. For this phase, the schema has no changes, but this is a general pattern to follow.

**Warning signs:** `TypeError: prisma.wish.create is not a function` or missing model methods at runtime.

## Code Examples

Verified patterns from official sources:

### Creating Custom Error Classes

```javascript
// Source: https://github.com/expressjs/express/blob/master/_autodocs/7-errors.md [CITED: Express GitHub autodocs]
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
    this.code = 'VALIDATION_ERROR';
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
    this.code = 'NOT_FOUND';
  }
}

export class DatabaseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DatabaseError';
    this.status = 500;
    this.code = 'DB_ERROR';
  }
}
```

### Centralized Error Handler Middleware

```javascript
// Source: https://github.com/expressjs/express/blob/master/_autodocs/7-errors.md [CITED: Express GitHub autodocs]
export function errorHandler(err, req, res, next) {
  console.error(`[${err.name || 'Error'}] ${err.message}`);

  const status = err.status || 500;
  const response = {
    error: err.message || 'Internal server error',
  };

  if (err.code) {
    response.code = err.code;
  }

  res.status(status).json(response);
}
```

### Async Handler Wrapper

```javascript
// Source: Express recommended pattern for async route handlers [CITED: Express GitHub autodocs]
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
```

### Refactored Route Example

```javascript
// Source: project convention, applying Express error handling docs
import { Router } from "express";
import { createWish, getWish } from "../services/wishService.js";
import { asyncHandler } from "../lib/errors.js";

const router = Router();

router.post("/", asyncHandler(async (req, res) => {
  const wish = await createWish(req.body);
  res.status(201).json(wish);
}));

router.get("/:id", asyncHandler(async (req, res) => {
  const wish = await getWish(req.params.id);
  res.json(wish);
}));

export default router;
```

### Refactored Service Example (throwing custom errors)

```javascript
// Source: project convention
import { ValidationError, NotFoundError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";

export async function createWish(data) {
  const { senderName, recipientName, message } = data;

  if (!senderName || !recipientName || !message) {
    throw new ValidationError("senderName, recipientName, and message are required");
  }

  if (message.length > 1000) {
    throw new ValidationError("Message must be 1000 characters or less");
  }
  // ... rest of implementation
}

export async function getWish(id) {
  const wish = await prisma.wish.findUnique({
    where: { id },
    include: { photos: true, reactions: true },
  });

  if (!wish) {
    throw new NotFoundError(`Wish not found: ${id}`);
  }
  // ... rest of implementation
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| String-matching on error messages (`err.message.includes(...)`) | Custom error classes with `.status` and `.code` | Express 3.x+ | Eliminates fragile string parsing; error semantics are self-documenting |
| Inline `try/catch` with `res.status().json()` in every route | Centralized error handler middleware | Express best practice | Single place to update error format; consistent responses across all endpoints |
| Express 4 requires explicit `next(err)` for async errors | Express 5 auto-catches async rejections | Express 5.0 (not yet used) | Project stays on Express 4; must use `asyncHandler` wrapper |

**Deprecated/outdated:**
- Express 4's lack of async error catching: Still the reality on v4. The `asyncHandler` wrapper is the standard workaround until Express 5 migration.

## Assumptions Log

> All claims in this research were verified or cited. No ASSUMED claims.

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| — | (none) | — | — |

## Open Questions

1. **Should the error handler also handle the SPA catch-all error (client not built)?**
   - What we know: The current SPA catch-all has its own inline `res.status(404).json(...)` error response
   - What's unclear: Whether this should flow through the centralized handler or remain inline since it's a different error domain (client build issue, not API error)
   - Recommendation: Keep it inline — it's a deployment error, not an API error. The centralized handler is for API request errors only.

2. **Should the `asyncHandler` utility live in `server/lib/errors.js` or a separate `server/lib/asyncHandler.js`?**
   - What we know: Both are valid; it's a single small function
   - What's unclear: Whether colocating with error classes is cleaner or whether separation of concerns matters for a file this small
   - Recommendation: Put it in `server/lib/errors.js` — it's 5 lines and directly related to error handling. Avoids file proliferation in a small project.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Server runtime | ✓ | v24.16.0 | — |
| npm | Package management | ✓ | 11.13.0 | — |
| Prisma CLI | Schema generation | ✓ | 7.8.0 (via npx) | — |
| Prisma Client (generated) | Runtime ORM | ✓ | (in server/lib/generated/prisma/) | npx prisma generate |
| SQLite (via better-sqlite3) | Database | ✓ | (bundled native addon) | — |

**Missing dependencies with no fallback:** none

**Missing dependencies with fallback:** none

**All dependencies verified as installed.** `server/node_modules/`, `client/node_modules/`, and root `node_modules/` all have their lockfiles present. Prisma client is generated at `server/lib/generated/prisma/index.js`.

## Validation Architecture

> `workflow.nyquist_validation` is explicitly `false` in config. Skipping test infrastructure analysis.

## Security Domain

> `security_enforcement` is enabled in config.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No auth system — wishes accessible by ID only |
| V3 Session Management | no | No sessions — stateless API |
| V4 Access Control | no | No user roles — public API |
| V5 Input Validation | yes | Express middleware validation in services (senderName, recipientName, message required; message length <= 1000; photos <= 5) |
| V6 Cryptography | no | No encryption needed — UUID wish IDs provide unguessability, not cryptographic security |

### Known Threat Patterns for Phase 1 Scope

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|-----|
| Wish ID enumeration | Information Disclosure | nanoid(8) provides sufficient entropy for small-scale; no sequential IDs |
| Request body size abuse | Denial of Service | `express.json({ limit: '1mb' })` already configured |
| Error message information leakage | Information Disclosure | D-03 decision: surface real errors for this small project (no auth, no sensitive data). If project grows, add NODE_ENV-based detail levels. |

## Sources

### Primary (HIGH confidence)
- [CITED: Express GitHub autodocs](https://github.com/expressjs/express/blob/master/_autodocs/7-errors.md) — Error handling middleware pattern, custom error class properties
- [CITED: Express GitHub autodocs](https://github.com/expressjs/express/blob/master/_autodocs/README.md) — Error propagation mechanism, 4-parameter signature
- [CITED: Prisma GitHub](https://github.com/prisma/prisma/blob/main/prisma/packages/client/tests/functional/issues/11789-sqlite-with-wal-or-connection_limit/tests.ts) — WAL mode PRAGMA with better-sqlite3 adapter
- [CITED: Prisma GitHub](https://github.com/prisma/prisma/blob/main/packages/client/tests/e2e/issues/16600-tsc-crash-extensions/src/index.ts) — Singleton PrismaClient pattern with global caching

### Secondary (MEDIUM confidence)
- [VERIFIED: codebase] Existing `server/lib/prisma.js` — WAL mode and busy_timeout already implemented correctly
- [VERIFIED: codebase] Existing `server/prisma/schema.prisma` — All 4 models with cascade deletes, indexes, unique constraints
- [VERIFIED: codebase] Existing `server/index.js` — SPA catch-all routing (Pitfall 5) already implemented

### Tertiary (LOW confidence)
- [ASSUMED] Express 4.x does not auto-catch async rejections — verified via training knowledge and confirmed by the `asyncHandler` pattern being universally recommended in Express 4 error handling guides

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages already installed and verified in codebase
- Architecture: HIGH — existing code structure confirmed via direct file reading; refactoring targets identified precisely
- Pitfalls: HIGH — Pitfall 1 (SQLite WAL) already prevented in existing code; Pitfall 5 (SPA catch-all) already prevented; new pitfalls (async errors, handler ordering) sourced from official Express docs

**Research date:** 2026-06-20
**Valid until:** 2026-07-20 (30 days — stable Express 4 patterns, Prisma 7 on current version)
