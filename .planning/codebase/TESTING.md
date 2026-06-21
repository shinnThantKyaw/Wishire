# Testing

**Analysis Date:** 2026-06-20

## Current State

**No test infrastructure exists.** There are zero test files, zero test dependencies, zero test scripts, and zero test configuration anywhere in the project. This applies to both the client and server codebases.

- No `*.test.*` or `*.spec.*` files (excluding `node_modules/`)
- No `__tests__/` directories
- No test-related dependencies in any `package.json`
- No test scripts in root, client, or server `package.json`
- No test configuration files (no `vitest.config.*`, `jest.config.*`, `.nycrc`, etc.)
- No CI/CD pipeline configuration visible

## Test Runner

**None installed.** Potential options ranked by fit:

| Runner | Fit | Notes |
|--------|-----|-------|
| **Vitest** | Best | Native to Vite ecosystem, shares `vite.config.js`, fast, ESM-first. Would serve both client and server. |
| **Node test runner** | Good for server | Built into Node 18+, zero dependencies, but no snapshot/mocking support for React. |
| **Jest** | Possible | Requires ESM transform config for `"type": "module"`. More setup friction with Vite. |

## Test Files

None exist. The project would need a test directory structure like:

```
client/src/
  __tests__/
    CreatePage.test.jsx
    WishPage.test.jsx
  components/experience/
    __tests__/
      ExperienceOrchestrator.test.jsx
      SentenceRevealer.test.jsx
server/
  __tests__/
    flair.test.js
    wishService.test.js
    wishes.routes.test.js
    photos.routes.test.js
  lib/
    __tests__/
      flair.test.js
```

## Test Scripts

Currently defined scripts across all `package.json` files:

**Root** (`package.json`):
- `dev` -- runs server and client concurrently
- No `test` script

**Client** (`client/package.json`):
- `dev`, `build`, `preview`
- No `test` script

**Server** (`server/package.json`):
- `start`, `mcp`
- No `test` script

## Coverage

No coverage tooling or configuration. Vitest supports `--coverage` out of the box with `@vitest/coverage-v8`.

## Where Tests Would Be Valuable

### Tier 1 -- High Priority (Pure Logic, Easy to Test)

**`server/lib/flair.js`** -- Pure functions, zero side effects, highest ROI:
- `getBirthdayFlair(month, day)` -- returns correct zodiac sign, birthstone, birthstone color, and birth flower for all 12 months
- `getZodiacSign()` -- boundary date testing: Dec 22 (Capricorn start), Jan 19 (Capricorn end), Jan 20 (Aquarius start), all 12 signs
- `inRange()` -- normal ranges (e.g., Aries: 3/21-4/19) and year-wrap ranges (Capricorn: 12/22-1/19)
- Edge cases: month 0, month 13, day 0, day 32, string inputs ("6", "15"), missing inputs, NaN

**`server/services/wishService.js`** -- Core business logic:
- `splitSentences()` -- test with various punctuation patterns, no punctuation (entire text as one sentence), multiple spaces, empty strings, max 6 sentences truncation
- `createWish()` -- validation: missing senderName/recipientName/message throws, message > 1000 chars throws, > 5 photos throws
- `createWish()` -- happy path: creates DB record, returns wish with parsed sentences and flair
- `getWish()` -- returns wish with parsed sentences and flair, records a Stat entry
- `getWish()` -- throws "Wish not found" for nonexistent ID
- `addReaction()` -- atomic upsert: first tap creates, subsequent taps increment
- `getWishStats()` -- returns openCount and reactions

**`server/middleware/upload.js`** -- Multer configuration:
- File size limit (5MB) enforcement
- File count limit (5) enforcement
- MIME type filter (only JPEG, PNG, WebP, GIF)
- `handleUploadError()` -- maps MulterError codes to user-friendly messages

### Tier 2 -- Medium Priority (Integration / Route Tests)

**`server/routes/wishes.js`** -- API integration tests (requires supertest or similar):
- `POST /api/wish` -- valid body returns 201 with wish object
- `POST /api/wish` -- missing required fields returns 400
- `POST /api/wish` -- message > 1000 chars returns 400
- `GET /api/wish/:id` -- existing ID returns 200 with wish
- `GET /api/wish/:id` -- nonexistent ID returns 404
- `POST /api/wish/:id/reactions` -- valid emoji returns 200 with count
- `POST /api/wish/:id/reactions` -- missing emoji returns 400
- `GET /api/wish/:id/stats` -- returns openCount and reactions

**`server/routes/photos.js`** -- Upload integration tests:
- `POST /api/upload` -- valid file returns 200 with filename and thumbnailFilename
- `POST /api/upload` -- invalid MIME (by magic bytes) returns 400 and deletes file
- `GET /api/uploads/:filename` -- valid UUID filename returns file with cache headers
- `GET /api/uploads/:filename` -- path traversal attempt returns 400
- `GET /api/uploads/:filename` -- non-UUID format returns 400

### Tier 3 -- Lower Priority (Component Tests)

**`client/src/components/experience/SentenceRevealer.jsx`**:
- Renders current sentence text
- Shows progress dots matching sentence count
- Active dot reflects currentIndex
- Final sentence gets special class
- Tap hint hidden on last sentence
- Reduced motion: no tap hint shown

**`client/src/components/experience/FlairChips.jsx`**:
- Returns null when flair is undefined
- Renders three chips (zodiac, birthstone, birthflower)
- Birthstone chip has dynamic border color from flair data

**`client/src/components/experience/PhotoGallery.jsx`**:
- Returns null when photos array is empty or undefined
- Renders correct number of photo items
- Uses thumbnailFilename when available

**`client/src/components/ErrorBoundary.jsx`**:
- Renders children when no error
- Renders error UI when child throws
- "Try Again" button resets error state

**`client/src/pages/CreatePage.jsx`**:
- Form renders all fields
- Validation: empty senderName shows error
- Validation: empty recipientName shows error
- Validation: empty message shows error
- Photo count limit (5) enforced
- Success screen shows wish URL and copy button

### Tier 4 -- E2E (Browser Automation)

**Full user flow** (Playwright or Cypress):
1. Navigate to /create
2. Fill form (sender, recipient, relationship, birth date, message, theme)
3. Submit -> redirected to success screen with wish URL
4. Navigate to wish URL
5. Gift box appears -> tap to open
6. Sentences reveal one by one on tap
7. Confetti fires
8. Gallery + reactions appear
9. Replay button restarts experience

## Recommended Approach

### Setup

Use **Vitest** as the universal test runner -- it is the natural fit for a Vite project:

```bash
# Install
cd client && npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
cd ../server && npm install -D vitest supertest
```

**`client/vite.config.js`** -- add test config:
```js
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.js',
  },
  server: {
    proxy: { "/api": "http://localhost:3001" },
  },
});
```

### Scripts

Add to `package.json` files:

```json
// Root
"test": "concurrently \"npm:test:server\" \"npm:test:client\"",
"test:server": "cd server && npm test",
"test:client": "cd client && npm test"

// client/package.json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"

// server/package.json
"test": "vitest run",
"test:watch": "vitest"
```

### Implementation Priority

1. **Start with `server/lib/flair.js`** -- pure functions, instant feedback, ~10 test cases
2. **Add `server/services/wishService.js`** -- requires Prisma mocking (in-memory SQLite or mock), ~15 test cases
3. **Add route integration tests** -- requires test database setup, ~12 test cases
4. **Add component tests** -- requires jsdom + Testing Library, ~15 test cases
5. **Add E2E tests last** -- highest setup cost, optional for a small project

### Test Database Strategy

For `wishService` and route tests:
- Use a separate SQLite file (e.g., `test.db`) or in-memory database
- Reset between tests with `prisma.wish.deleteMany()` in `beforeEach`
- Prisma's `@prisma/adapter-better-sqlite3` supports in-memory via `file::memory:`

### Estimated Coverage Targets

Given the project's small size (15 JS/JSX files, ~1500 lines of application code):
- **Tier 1** alone would cover the most critical paths: flair logic, wish creation/validation, sentence splitting
- **Tier 1 + 2** would give solid confidence in the API layer
- Achieving 80%+ line coverage is realistic with Tiers 1-3
