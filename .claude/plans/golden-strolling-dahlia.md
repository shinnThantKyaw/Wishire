# Phase 1: Core Foundation

## Context

The project has a basic React Vite frontend with a generator form and an Express backend with a placeholder `/api/wish` endpoint. There is no database, no routing between pages, no photo upload, and no wish display page. Phase 1 builds the foundation: database, generator form redesign, shareable links, and the basic birthday page.

**Requirements covered:** WISH-01, WISH-02, WISH-03, PAGE-01, PHOTO-01, PHOTO-02, TRACK-01

## Pitfalls to Address

- Pitfall 1 (SQLite locked): WAL mode + busy_timeout from the start
- Pitfall 3 (Photo upload security): UUID filenames, magic-byte validation, controlled serve route
- Pitfall 5 (SPA 404): Express catch-all for direct URL access

## Steps

1. Install dependencies (server: prisma, multer, file-type, nanoid, sharp; client: react-router-dom)
2. Set up Prisma + SQLite with WAL mode and schema (Wish, Photo, Reaction, Stat)
3. Redesign generator form (remove tone, add senderName, message textarea, photo upload)
4. Build photo upload pipeline (UUID filenames, magic-byte validation, thumbnails, controlled serve)
5. Build wish API (POST /api/wish, GET /api/wish/:id, POST /api/wish/:id/reactions)
6. Set up React Router (/create, /wish/:id)
7. Build birthday page (sender name, flair chips, wish text, photos)
8. Express catch-all for SPA routes (Pitfall 5)
9. Wire everything together, test end-to-end

## Verification

- `npm run dev` starts both servers
- Generator form creates a wish with photos
- Shareable link opens birthday page directly
- Direct URL access works (catch-all)
- WAL mode configured in Prisma
