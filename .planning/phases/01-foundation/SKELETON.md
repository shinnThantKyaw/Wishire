# Walking Skeleton — Birthday Wish Generator

**Phase:** 1
**Generated:** 2026-06-20

## Capability Proven End-to-End

A user can POST a wish to /api/wish and GET it back by ID, with all API errors returning consistent structured JSON responses.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Vite + React 18 (client), Express 4 (server) | Already implemented; SPA with two routes (/create, /wish/:id) |
| Data layer | SQLite via Prisma 7 + better-sqlite3 adapter | Zero-config, file-based, WAL mode for concurrency, easy Postgres migration path |
| Auth | None — wishes accessible by UUID-based ID only | nanoid(8) provides sufficient unguessability for a small-scale gift app |
| Deployment target | Local dev (concurrently runs Vite + Express) | No CI/CD or cloud deployment configured yet |
| Directory layout | client/ + server/ monorepo; server uses lib/ middleware/ routes/ services/ | Conventional Express structure with clear separation of concerns |
| Error handling | Custom error classes (ValidationError, NotFoundError, DatabaseError) + centralized Express 4-arg middleware | per D-01 through D-05; replaces string-matching and inline try/catch with structured error flow |

## Stack Touched in Phase 1

- [x] Project scaffold (Vite, Express, Prisma, concurrently) — already exists
- [x] Routing — POST /api/wish, GET /api/wish/:id, POST /api/upload, GET /api/uploads/:filename — already exists
- [x] Database — Prisma schema with Wish, Photo, Reaction, Stat models; CRUD operations in wishService — already exists
- [x] UI — CreatePage and WishPage components with React Router — already exists
- [x] Dev environment — `npm run dev` runs both servers via concurrently — already exists
- [x] Error handling refactor — custom error classes, centralized middleware, asyncHandler wrapper — **this phase**

## Out of Scope (Deferred to Later Slices)

- Photo upload magic-byte validation refactoring (touches Phase 2 photo routes)
- Recipient experience animations (Phase 3)
- Confetti, gallery, reactions (Phase 4)
- Theme system, flair, status page (Phase 5)
- Testing framework setup (no test runner exists; deferred)
- Linting/formatting setup (no ESLint/Prettier configured; deferred)

## Subsequent Slice Plan

Each later phase adds one vertical slice on top of this skeleton without altering its architectural decisions:

- Phase 2: Creator Flow — generator form + photo upload with drag-and-drop
- Phase 3: Recipient Experience — gift box animation + sentence-by-sentence reveal
- Phase 4: Finale — confetti + gallery + emoji reactions
- Phase 5: Polish — themes, flair enhancements, open tracking, mobile responsiveness
