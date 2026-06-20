# Testing

## Current State
**No test infrastructure exists.** There are no test runners, no test files, and no test scripts configured in this project.

## Test Runner
- **None configured.** Neither Jest, Vitest, nor any other test runner is installed.
- `server/package.json` has no test-related dependencies
- `client/package.json` has no test-related dependencies
- No test scripts in root `package.json` either

## Test Files
- No `*.test.*` files found (except inside `node_modules/`)
- No `*.spec.*` files found
- No `__tests__/` directories

## Test Scripts
- Root `package.json`: no `test` or `test:*` scripts
- `server/package.json`: no `test` script (only `"start": "node index.js"`)
- `client/package.json`: no `test` script (only `dev`, `build`, `preview`)

## Coverage
No test coverage configuration or tooling exists.

## Where Tests Would Be Valuable

### `server/lib/flair.js` — High Priority
Pure logic functions with no side effects. Very testable:
- `getBirthdayFlair(month, day)` — test all 12 months for correct birthstone/flower
- `getZodiacSign()` — test boundary dates (Dec 22 → Capricorn, Jan 20 → Aquarius, etc.)
- `inRange()` — test normal ranges and year-wrap ranges (Capricorn)
- Edge cases: invalid months (0, 13), invalid days (0, 32), string inputs, missing inputs

### `server/index.js` — Medium Priority
API route handler:
- POST `/api/wish` with valid body → 200 with wish + flair
- POST `/api/wish` with missing name → 400
- POST `/api/wish` with invalid tone → 400
- POST `/api/wish` with missing month/day → what happens? (no validation)

### `client/src/App.jsx` — Medium Priority
React component with form state and API interaction:
- Form submission with valid data
- Loading state during API call
- Error state on API failure
- Result display with flair chips

## Recommended Approach
Since the client uses **Vite**, the natural test runner is **Vitest** (Vite-native, same config, fast). For the server, **Vitest** works equally well or **Node's built-in test runner** (Node 18+) would work with zero dependencies.