# Phase 2: Creator Flow - Context

**Gathered:** 2026-06-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Generator form + photo upload — complete wish creation experience. This covers the form UI (name, relationship, birth month/day, message textarea, theme selector), photo upload with drag-and-drop and thumbnail previews, wish creation API call, and success state with preview card and share buttons.

**Key flow change:** After wish creation, the user stays on CreatePage and sees an inline success state (not navigation to the wish page). The success state shows a small preview card, copy link button, and open link button.

</domain>

<decisions>
## Implementation Decisions

### Success Flow
- **D-01:** After clicking "Create," user stays on CreatePage. The form is replaced by an inline success state.
- **D-02:** Success state shows: success message, small preview card, Copy Link button, Open Link button.
- **D-03:** Preview card is compact (~200px tall): recipient name, first line of message, theme color swatch.
- **D-04:** No new route needed — state change within CreatePage component.

### Photo Upload Display
- **D-05:** Selected photos display as thumbnail previews with file names and remove buttons.
- **D-06:** User sees exactly what they're uploading before clicking Create.
- **D-07:** Follow `photo-upload-security` skill for all backend security (UUID filenames, magic-byte validation, controlled serve route).

### Theme Selector
- **D-08:** Theme selector uses color circles showing each theme's primary color.
- **D-09:** Click a circle to select, theme name displays below the selected circle.
- **D-10:** Five themes available: sunrise, ocean, lavender, forest, midnight.

### Form Validation
- **D-11:** Inline validation errors displayed near each field.
- **D-12:** Required fields: recipient name, birth month, birth day, message.
- **D-13:** Optional fields: sender name (can be anonymous), relationship, photos (0-5).

### Skills & Infrastructure
- **D-14:** Create new skill `form-creator-flow` capturing: drag-drop pattern, thumbnail previews, theme color circles, success state card, form validation patterns.
- **D-15 [informational]:** Current MCPs sufficient: `birthday-facts` for zodiac lookup, `context7` for documentation.
- **D-16 [informational]:** Subagents to use: Security Reviewer (audit photo upload against `photo-upload-security`), UI Implementer (build form components).

### Claude's Discretion
- File locations for new components (following existing `client/src/components/` structure)
- Specific validation error messages (user-friendly, non-technical)
- Thumbnail generation approach (use existing `sharp` dependency)
- Form field ordering and layout details (follow `ui-ux-pro-max` skill)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Architecture & Data Model
- `.planning/codebase/ARCHITECTURE.md` — System overview, request flows, data model, key patterns
- `.planning/codebase/STACK.md` — Technology stack, versions, configuration
- `.planning/codebase/CONVENTIONS.md` — File structure, naming, component patterns

### Research & Pitfalls
- `.planning/research/PITFALLS.md` — 8 critical pitfalls (Pitfall 3: photo upload security)
- `.planning/codebase/CONCERNS.md` — Known concerns and security issues

### Skills (MUST follow)
- `.claude/skills/photo-upload-security/SKILL.md` — UUID filenames, magic-byte validation, controlled serve route
- `.claude/skills/ui-ux-pro-max/SKILL.md` — Accessibility, touch targets, responsive design, typography
- `.claude/skills/form-creator-flow/SKILL.md` — **TO BE CREATED** — drag-drop, thumbnails, theme selector, success state, validation

### Existing Implementation
- `client/src/pages/CreatePage.jsx` — Current form implementation (to be refactored)
- `server/middleware/upload.js` — Multer config with UUID filenames, 5MB limit, MIME filter
- `server/routes/photos.js` — Upload endpoint and controlled serve route
- `server/services/wishService.js` — Business logic, validation, sentence splitting
- `server/lib/flair.js` — Zodiac/birthstone/birthflower lookup (pure functions)

### Phase 1 Context
- `.planning/phases/01-foundation/01-CONTEXT.md` — Error handling patterns, custom error classes

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `server/middleware/upload.js`: Multer config already has UUID filenames (`crypto.randomUUID()`), 5MB limit, MIME filter — no changes needed for security
- `server/lib/flair.js`: Zodiac/birthstone/birthflower lookup — pure functions, called during wish creation to embed flair data
- `client/src/pages/CreatePage.jsx`: Existing form component — needs refactoring for new success flow and photo thumbnails
- `sharp` dependency: Already installed for thumbnail generation (300px wide, without enlargement)

### Established Patterns
- Routes use `Router()` from Express, mounted in `server/index.js`
- Services throw custom error classes (`ValidationError`, `NotFoundError`) from Phase 1
- Routes catch errors with try/catch and throw to centralized error handler
- React components use functional style with hooks (`useState`, `useEffect`, `useCallback`)
- CSS uses BEM-like convention with CSS custom properties for theming

### Integration Points
- `POST /api/upload` — Photo upload endpoint (already exists, may need refinement)
- `POST /api/wish` — Wish creation endpoint (already exists)
- `client/src/pages/CreatePage.jsx` — Main form component (refactor target)
- `client/src/components/` — Component directory for new photo uploader, theme selector, success state

### New Components to Create
- `client/src/components/create/PhotoUploader.jsx` — Drag-drop with thumbnail previews
- `client/src/components/create/ThemeSelector.jsx` — Color circle theme picker
- `client/src/components/create/SuccessState.jsx` — Preview card with copy/open buttons
- `.claude/skills/form-creator-flow/SKILL.md` — New skill capturing form patterns

</code_context>

<specifics>
## Specific Ideas

**User's specific flow request:**
> "User click create button → the successfully create page is shown, there will be preview (just small preview) or just success message and two buttons: copy link and open link"

**Photo upload display:**
> "Thumbnails with remove buttons — Show image previews, file names, remove buttons. User sees exactly what they're uploading."

**Theme selector:**
> "Color circles — Circular swatches showing each theme's primary color. Click to select, shows theme name below."

These are concrete UX decisions, not vague preferences. Implement them directly.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 2-Creator Flow*
*Context gathered: 2026-06-20*
