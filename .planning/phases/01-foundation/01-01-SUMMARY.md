---
phase: 01-foundation
plan: 01
subsystem: api
tags: [express, error-handling, middleware, prisma]

# Dependency graph
requires: []
provides:
  - "Error class infrastructure (ValidationError, NotFoundError, DatabaseError)"
  - "asyncHandler utility for Express async route error catching"
  - "Centralized Express error-handling middleware"
  - "Refactored wish service and routes using custom error classes"
affects: [01-foundation, 02-creator-flow, 03-recipient-experience, 04-finale, 05-polish]

# Tech tracking
tech-stack:
  added: []
  patterns: [custom-error-classes, asyncHandler-wrapper, centralized-error-middleware]

key-files:
  created:
    - server/lib/errors.js
    - server/middleware/errorHandler.js
    - server/test/errors.test.js
  modified:
    - server/services/wishService.js
    - server/routes/wishes.js
    - server/index.js

key-decisions:
  - "Used Node.js built-in test runner (node:test) -- no extra dependencies needed"
  - "Placed error classes and asyncHandler in same file (server/lib/errors.js) per RESEARCH.md Open Question #2"

patterns-established:
  - "Custom error classes: ValidationError/NotFoundError/DatabaseError extend Error with .name, .status, .code"
  - "Async route wrapping: all async route handlers wrapped with asyncHandler(fn), no inline try/catch"
  - "Centralized error formatting: errorHandler middleware produces {error, code?} response format"

requirements-completed: [WISH-01, WISH-02]

# Metrics
duration: 3min
completed: 2026-06-20
status: complete
---

# Phase 01 Plan 01: Error Handling Infrastructure Summary

**Structured error classes (ValidationError/NotFoundError/DatabaseError), asyncHandler wrapper, and centralized Express error middleware replacing all ad-hoc try/catch in wish routes**

## Performance

- **Duration:** 3 min
- **Started:** 2026-06-20T23:42:50Z
- **Completed:** 2026-06-20T23:45:22Z
- **Tasks:** 1
- **Files modified:** 6 (3 created, 3 modified)

## Accomplishments
- Created custom error class hierarchy: ValidationError (400), NotFoundError (404), DatabaseError (500) with .name, .status, .code properties
- Built asyncHandler utility that catches rejected promises from async Express route handlers and forwards to next(err)
- Created centralized errorHandler middleware (4-arg Express signature) that formats all errors as {error, code?} responses
- Refactored all 4 wish routes to use asyncHandler wrappers, eliminating all inline try/catch blocks
- Replaced all generic `throw new Error()` in wishService with typed error class instances
- Mounted errorHandler as last middleware in Express app, after SPA catch-all

## Task Commits

Each task was committed atomically:

1. **Task 1: RED - Failing tests for error handling infrastructure** - `e1f1ff6` (test)
2. **Task 1: GREEN - Error handling infrastructure implementation** - `b53c014` (feat)

## Files Created/Modified
- `server/lib/errors.js` - Custom error classes (ValidationError, NotFoundError, DatabaseError) and asyncHandler utility
- `server/middleware/errorHandler.js` - Centralized Express 4-arg error handler middleware
- `server/test/errors.test.js` - 12 tests covering error classes, asyncHandler, and errorHandler middleware
- `server/services/wishService.js` - Refactored: replaced all throw new Error() with custom error class instances
- `server/routes/wishes.js` - Refactored: removed all inline try/catch, wrapped handlers with asyncHandler
- `server/index.js` - Added errorHandler import and mounted as last middleware after SPA catch-all

## Decisions Made
- Used Node.js built-in test runner (node:test) instead of installing jest/vitest -- zero dependencies needed for unit tests
- Placed error classes and asyncHandler in same file per RESEARCH.md Open Question #2 -- they're tightly coupled utilities

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Error handling foundation is in place; all subsequent phases can throw custom error classes and rely on the centralized handler
- Phase 01 Plan 02 (if exists) can build on this infrastructure for photo routes and other endpoints

---
*Phase: 01-foundation*
*Completed: 2026-06-20*

## Self-Check: PASSED
- All 3 created files verified: server/lib/errors.js, server/middleware/errorHandler.js, server/test/errors.test.js
- All 2 task commits verified: e1f1ff6 (test), b53c014 (feat)
