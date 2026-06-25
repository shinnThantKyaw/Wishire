# Discussion Log: Phase 1 - Foundation

**Date:** 2026-06-20

## Areas Discussed

### Error Handling Patterns

**Presented options:**
1. Simple: `{error, code?}` (Recommended)
2. RFC 7807 Problem Details
3. Keep current — don't change

**User selected:** Simple: `{error, code?}` (Recommended)

**Follow-up: Error visibility**
- Options: Always surface / Dev only / Always hide
- User selected: Always surface (Recommended)
- Rationale: Small project, no auth, hiding errors makes debugging harder

**Follow-up: Error handler pattern**
- Options: Centralized middleware (Recommended) / Keep per-route try/catch
- User selected: Centralized middleware (Recommended)
- Rationale: DRY, consistent. Routes throw custom errors, middleware formats response.

## Areas Not Discussed (User Skipped)

- API contract & validation — user chose not to discuss
- Database schema refinements — user chose not to discuss

## Deferred Ideas

None — discussion stayed within phase scope.

---

*Phase: 1-Foundation*
*Discussion date: 2026-06-20*
