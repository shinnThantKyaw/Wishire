# Phase 2: Creator Flow - Research

**Researched:** 2026-06-21
**Domain:** React form with drag-drop photo upload, theme selector, and inline success state
**Confidence:** HIGH

## Summary

Phase 2 refactors the existing `CreatePage.jsx` to deliver the full creator flow: a form with inline validation, a drag-and-drop photo uploader with thumbnail previews and remove buttons, a color-circle theme selector, and an inline success state with a compact preview card and share buttons.

The codebase already has a working implementation of most Phase 2 functionality. The current `CreatePage.jsx` has a working form, photo selection (via plain `<input type="file">`), theme selector, and success state. The server already has UUID-named photo uploads with magic-byte validation and thumbnail generation via `sharp`. The key work is: (1) replacing the file input with `react-dropzone` for drag-and-drop, (2) improving the theme selector from swatch strips to color circles per D-08/D-09, (3) adding inline validation errors per D-11, (4) making sender name optional per D-13, (5) refining the success state to a compact preview card per D-03, and (6) extracting reusable components (`PhotoUploader`, `ThemeSelector`, `SuccessState`).

**Primary recommendation:** Install `react-dropzone` as the sole new client dependency. Refactor CreatePage into sub-components. All server-side photo upload infrastructure is already secure and needs no changes.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PHOTO-01 | Generator can upload 1-5 photos, max 5MB each, with drag-and-drop support | react-dropzone useDropzone hook provides maxFiles, maxSize, accept types. Server multer already enforces limits. |
| PHOTO-02 | Photos stored on server filesystem with UUID filenames, paths in SQLite | Already implemented: multer uses crypto.randomUUID(), sharp generates 300px thumbnails, Prisma stores paths. No changes needed. |
| THEME-01 | Generator selects from visual themes that change colors, backgrounds, animations | Existing THEMES array in CreatePage has 5 themes with color arrays. Refine to single-primary-color circles per D-08/D-09. |
| WISH-03 | Generator can preview the wish, copy the link, and open it in a new tab | Existing success state already has copy link and open link. Refine to compact preview card per D-03. Clipboard API with execCommand fallback already implemented. |
</phase_requirements>

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** After clicking "Create," user stays on CreatePage. The form is replaced by an inline success state.
- **D-02:** Success state shows: success message, small preview card, Copy Link button, Open Link button.
- **D-03:** Preview card is compact (~200px tall): recipient name, first line of message, theme color swatch.
- **D-04:** No new route needed -- state change within CreatePage component.
- **D-05:** Selected photos display as thumbnail previews with file names and remove buttons.
- **D-06:** User sees exactly what they're uploading before clicking Create.
- **D-07:** Follow `photo-upload-security` skill for all backend security (UUID filenames, magic-byte validation, controlled serve route).
- **D-08:** Theme selector uses color circles showing each theme's primary color.
- **D-09:** Click a circle to select, theme name displays below the selected circle.
- **D-10:** Five themes available: sunrise, ocean, lavender, forest, midnight.
- **D-11:** Inline validation errors displayed near each field.
- **D-12:** Required fields: recipient name, birth month, birth day, message.
- **D-13:** Optional fields: sender name (can be anonymous), relationship, photos (0-5).
- **D-14:** Create new skill `form-creator-flow` capturing: drag-drop pattern, thumbnail previews, theme color circles, success state card, form validation patterns.
- **D-15:** Current MCPs sufficient: `birthday-facts` for zodiac lookup, `context7` for documentation.
- **D-16:** Subagents to use: Security Reviewer (audit photo upload against `photo-upload-security`), UI Implementer (build form components).

### Claude's Discretion
- File locations for new components (following existing `client/src/components/` structure)
- Specific validation error messages (user-friendly, non-technical)
- Thumbnail generation approach (use existing `sharp` dependency)
- Form field ordering and layout details (follow `ui-ux-pro-max` skill)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Form UI (name, relationship, dates, message) | Browser / Client | -- | React component state, no server needed until submit |
| Photo drag-and-drop + thumbnail preview | Browser / Client | -- | react-dropzone handles client-side selection; previews are blob URLs |
| Photo upload to server | Browser / Client | API / Backend | Client POSTs FormData; server multer saves to disk |
| Photo security (UUID names, magic-byte, serve route) | API / Backend | -- | Server-only concern; client validation is UX convenience only |
| Theme selector UI | Browser / Client | -- | Pure CSS/state interaction, no API involved |
| Form validation (client-side) | Browser / Client | -- | Inline error display, UX layer |
| Form validation (server-side) | API / Backend | -- | wishService.createWish validates required fields |
| Wish creation + DB storage | API / Backend | Database / Storage | wishService creates Wish+Photo records in SQLite |
| Success state + share buttons | Browser / Client | -- | Post-submit UI using returned wish data |
| Clipboard copy | Browser / Client | -- | navigator.clipboard API with execCommand fallback |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-dropzone | 15.0.0 | Drag-and-drop file upload with react hook | 11M+ weekly downloads, React-specific, MIT license, maintained actively [VERIFIED: npm registry] |
| react | ^18.3.1 | UI library | Already in project [VERIFIED: package.json] |
| express | ^4.19.2 | API server | Already in project [VERIFIED: package.json] |
| multer | ^2.2.0 | Multipart file upload | Already in project [VERIFIED: package.json] |
| sharp | ^0.35.2 | Image thumbnail generation | Already in project [VERIFIED: package.json] |
| file-type | ^22.0.1 | Magic-byte validation | Already in project [VERIFIED: package.json] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| canvas-confetti | ^1.9.4 | Confetti effect | Already installed; not used in this phase |
| framer-motion | ^12.40.0 | Animations | Already installed; optional for success state transition |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-dropzone | Custom useDropzone with native HTML5 drag events | react-dropzone handles edge cases (browser quirks, file type detection, accessibility). 11M weekly downloads. Not worth hand-rolling. |
| react-dropzone | react-uploader / filepond | More complex, heavier. react-dropzone is the standard React choice. |

**Installation:**
```bash
cd client && npm install react-dropzone
```

**Version verification:**
```bash
npm view react-dropzone version    # returns 15.0.0
```
[VERIFIED: npm registry]

## Package Legitimacy Audit

> **Required** whenever this phase installs external packages. Run the Package Legitimacy Gate protocol before completing this section.

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| react-dropzone | npm | 8+ years | 11.4M/week | github.com/react-dropzone/react-dropzone | OK | Approved |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

*react-dropzone is the only new package. All other dependencies are already installed.*

## Architecture Patterns

### System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        CreatePage.jsx                            │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────┐ │
│  │  Form State  │  │ PhotoUploader│  │    ThemeSelector        │ │
│  │  (useState)  │  │ (useDropzone)│  │  (color circles)        │ │
│  │              │  │              │  │                         │ │
│  │ senderName   │  │ drag-drop    │  │  [sun] [oce] [lav]     │ │
│  │ recipientName│  │ thumbnails   │  │  [for] [mid]           │ │
│  │ month/day    │  │ remove btns  │  │    sunrise selected    │ │
│  │ message      │  │ file list    │  └─────────────────────────┘ │
│  └──────┬───────┘  └──────┬───────┘                              │
│         │                 │                                      │
│         │    validate     │  upload files                        │
│         │    + submit     │  POST /api/upload                    │
│         ▼                 ▼                                      │
│  ┌──────────────────────────────┐    ┌──────────────────────────┐│
│  │    generate() handler        │───>│    SuccessState          ││
│  │  1. client validation        │    │  compact preview card    ││
│  │  2. POST /api/upload (photos)│    │  copy link button        ││
│  │  3. POST /api/wish (create)  │    │  open link button        ││
│  │  4. setCreatedWish(result)   │    │  "create another" link   ││
│  └──────────────────────────────┘    └──────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
                           │
                    Vite proxy /api
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                      Express Server                              │
│                                                                  │
│  POST /api/upload                                                │
│    multer.diskStorage (UUID filenames)                            │
│    → magic-byte validation (file-type)                           │
│    → thumbnail generation (sharp, 300px)                         │
│    → return [{filename, thumbnailFilename, originalName}]        │
│                                                                  │
│  POST /api/wish                                                  │
│    wishService.createWish(req.body)                              │
│    → validate required fields                                    │
│    → split message into sentences                                │
│    → create Wish + Photo records in SQLite                       │
│    → return wish with flair data                                 │
└──────────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure
```
client/src/
  pages/
    CreatePage.jsx               # REFACTOR: form orchestration, success state rendering
  components/
    create/
      PhotoUploader.jsx           # NEW: drag-drop zone + thumbnail previews
      ThemeSelector.jsx           # NEW: color circle theme picker
      SuccessState.jsx            # NEW: compact preview card + share buttons
      FormField.jsx               # NEW (optional): reusable field wrapper with inline error
  index.css                       # ADD: new CSS classes for photo uploader, theme circles, success card
```

### Pattern 1: react-dropzone with Cumulative File Addition

**What:** The `useDropzone` hook manages drag-and-drop state. Since `onDrop` replaces files by default, the component must merge new files with existing ones in state, respecting the 5-file cap.

**When to use:** Any file upload component that supports drag-and-drop with a max file count.

**Example:**
```javascript
// Source: react-dropzone documentation + project needs
import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";

export default function PhotoUploader({ photos, onPhotosChange, maxFiles = 5 }) {
  const onDrop = useCallback((acceptedFiles) => {
    // Merge new files with existing, cap at maxFiles
    const combined = [...photos, ...acceptedFiles].slice(0, maxFiles);
    // Attach preview URLs
    const withPreviews = combined.map(file =>
      file.preview ? file : Object.assign(file, { preview: URL.createObjectURL(file) })
    );
    onPhotosChange(withPreviews);
  }, [photos, maxFiles, onPhotosChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [], "image/gif": [] },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: maxFiles - photos.length, // remaining slots
    multiple: true,
  });

  // Revoke object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => photos.forEach(file => {
      if (file.preview) URL.revokeObjectURL(file.preview);
    });
  }, []);

  function removePhoto(index) {
    const removed = photos[index];
    if (removed?.preview) URL.revokeObjectURL(removed.preview);
    onPhotosChange(photos.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div {...getRootProps({ className: "dropzone" + (isDragActive ? " dropzone--active" : "") })}>
        <input {...getInputProps()} />
        <p>{isDragActive ? "Drop photos here..." : "Drag & drop photos, or click to select"}</p>
        <span>{photos.length}/{maxFiles} photos</span>
      </div>
      {photos.length > 0 && (
        <div className="photo-thumbs">
          {photos.map((file, i) => (
            <div key={file.name + i} className="photo-thumb">
              <img src={file.preview} alt={file.name} />
              <button type="button" onClick={() => removePhoto(i)}>x</button>
              <span>{file.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Pattern 2: Inline Field Validation

**What:** Validate each field on blur and on submit. Display error messages directly below the field. Clear error when user corrects the field.

**When to use:** All form fields that have constraints (required, range, format).

**Example:**
```javascript
// Source: D-11, D-12 decisions
const [errors, setErrors] = useState({});

function validate(field, value) {
  switch (field) {
    case "recipientName":
      return value.trim() ? "" : "Their name is required";
    case "month":
      return value >= 1 && value <= 12 ? "" : "Pick a month (1-12)";
    case "day":
      return value >= 1 && value <= 31 ? "" : "Pick a day (1-31)";
    case "message":
      return value.trim() ? "" : "Please write a birthday message";
    default:
      return "";
  }
}

function onBlur(field, value) {
  const error = validate(field, value);
  setErrors(prev => ({ ...prev, [field]: error }));
}
```

### Pattern 3: Theme Color Circles

**What:** Display each theme as a single colored circle (primary color). Click to select. Selected circle gets a ring/highlight. Theme name appears below the selected circle.

**When to use:** Any compact selector where the visual identity is a single color.

**Example:**
```javascript
// Source: D-08, D-09 decisions
const THEMES = [
  { id: "sunrise", label: "Sunrise", primary: "#ff6f59" },
  { id: "ocean", label: "Ocean", primary: "#4d96ff" },
  { id: "lavender", label: "Lavender", primary: "#c44dff" },
  { id: "forest", label: "Forest", primary: "#2bb39c" },
  { id: "midnight", label: "Midnight", primary: "#4d4d7a" },
];

// Render as circles:
{THEMES.map(t => (
  <button
    key={t.id}
    type="button"
    className={`theme-circle${selected === t.id ? " theme-circle--active" : ""}`}
    onClick={() => onSelect(t.id)}
    aria-label={t.label}
    style={{ backgroundColor: t.primary }}
  />
))}
{selected && <span className="theme-name">{THEMES.find(t => t.id === selected)?.label}</span>}
```

### Pattern 4: Success State (Inline, No Route Change)

**What:** After wish creation, `createdWish` state is set. The form renders the `SuccessState` component instead. No navigation occurs.

**When to use:** Post-submit flows where the user needs quick access to share controls without leaving the page.

**Example:**
```javascript
// Source: D-01, D-02, D-03, D-04 decisions
if (createdWish) {
  return (
    <div className="page">
      <SuccessState
        wish={createdWish}
        onReset={() => setCreatedWish(null)}
      />
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Sending photos as base64 in JSON:** Always use `multipart/form-data` with `FormData`. The server already uses multer for this. [VERIFIED: server/middleware/upload.js]
- **Using `express.static('uploads')` directly:** The project already uses a controlled serve route in `photos.js` with UUID regex validation. Do not change this. [VERIFIED: server/routes/photos.js]
- **Recreating blob URLs on every render:** Call `URL.createObjectURL()` once when files are selected, store in state, revoke on unmount or file removal. [CITED: react-dropzone docs]
- **Using `dangerouslySetInnerHTML` for wish text:** React escapes text by default. The project does not use innerHTML for user content. [VERIFIED: CreatePage.jsx]
- **Replacing `file-type` magic-byte validation with extension-only checks:** The server already validates magic bytes. Client-side file type filtering is UX convenience only. [VERIFIED: server/routes/photos.js]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag-and-drop file upload | Custom dragenter/dragleave/drop handlers | react-dropzone `useDropzone` hook | Browser quirks (Safari drag, touch events, file type detection, accessibility). react-dropzone handles 15+ edge cases. [CITED: react-dropzone docs] |
| Clipboard copy | Custom textarea + execCommand | Keep existing `copyLink()` in CreatePage | The current implementation already has the correct pattern with clipboard API + execCommand fallback. [VERIFIED: CreatePage.jsx lines 130-146] |
| Magic-byte file validation | Reading file headers in browser | Server-side `file-type` via upload route | Browser File API does not reliably expose magic bytes. Server-side is authoritative. [VERIFIED: server/routes/photos.js] |
| UUID filename generation | Using Date.now() or sequential IDs | `crypto.randomUUID()` in multer config | Already implemented. Predictable filenames enable enumeration attacks. [VERIFIED: server/middleware/upload.js] |
| Thumbnail generation | Client-side canvas resizing | Server-side `sharp` resize at 300px | Already implemented. Server-side produces consistent quality, client-side varies by browser. [VERIFIED: server/routes/photos.js] |

## Common Pitfalls

### Pitfall 1: react-dropzone `onDrop` replaces files instead of appending
**What goes wrong:** User drags 2 photos, then drags 1 more. Only the last photo appears.
**Why it happens:** `useDropzone` passes only the newly dropped files to `onDrop`. If you `setPhotos(acceptedFiles)`, it replaces rather than appends.
**How to avoid:** Merge with existing state: `setPhotos(prev => [...prev, ...acceptedFiles].slice(0, 5))`. Track `maxFiles` dynamically based on remaining slots.
**Warning signs:** Photos disappear when adding more; file count never exceeds the most recent drop.

### Pitfall 2: Memory leak from unreleased Object URLs
**What goes wrong:** After uploading 5 photos and navigating away, the browser retains blob URLs, accumulating memory.
**Why it happens:** `URL.createObjectURL()` creates a persistent reference. Without `URL.revokeObjectURL()`, blobs stay in memory until page unload.
**How to avoid:** Revoke in `useEffect` cleanup. Revoke on individual file removal. The react-dropzone docs explicitly warn about this. [CITED: react-dropzone documentation]
**Warning signs:** Growing memory usage visible in Chrome Task Manager after repeated photo selections.

### Pitfall 3: `maxFiles` exceeding remaining slots causes silent rejection
**What goes wrong:** User has 3 photos selected. They try to drop 3 more. Only 2 are accepted; the third is silently rejected with no feedback.
**Why it happens:** `maxFiles` is set to 5 globally. When 3 files are already selected and user drops 3, only 2 fit. `fileRejections` contains the rejected file but the component may not display it.
**How to avoid:** Set `maxFiles` dynamically to `5 - photos.length`. Display `fileRejections` errors in a toast or inline message. [CITED: react-dropzone docs]
**Warning signs:** User confusion about why some dropped files are missing.

### Pitfall 4: Sender name validation blocks anonymous wishes
**What goes wrong:** The current form requires sender name (line 75: `if (!form.senderName.trim())`). D-13 says sender name is optional.
**Why it happens:** Phase 1 code was built before D-13 locked this decision.
**How to allow:** Remove the senderName validation from the `generate()` function. Default to "Someone special" or empty string when blank.
**Warning signs:** Form refuses to submit when sender name is empty.

### Pitfall 5: Inline errors persist after user correction
**What goes wrong:** User clears an error-causing field, but the error message remains until the next submit.
**Why it happens:** Errors are only validated on submit, not on change or blur.
**How to avoid:** Validate on `blur` and clear on `change` (when value becomes valid). Display errors only when `errors[field]` is truthy.
**Warning signs:** Error messages linger even after the user fixes the field.

## Code Examples

Verified patterns from official sources:

### react-dropzone with file preview and dynamic maxFiles
```javascript
// Source: https://react-dropzone.js.org/
const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
  onDrop: useCallback((acceptedFiles) => {
    setPhotos(prev => {
      const merged = [...prev, ...acceptedFiles].slice(0, MAX_FILES);
      return merged.map(f => f.preview ? f : Object.assign(f, { preview: URL.createObjectURL(f) }));
    });
  }, []),
  accept: { "image/jpeg": [], "image/png": [], "image/webp": [], "image/gif": [] },
  maxSize: 5 * 1024 * 1024,
  maxFiles: MAX_FILES - photos.length,
});
```

### Controlled form field with inline error
```javascript
// Source: standard React pattern, D-11 decision
<label>
  Their name
  <input
    value={form.recipientName}
    onChange={(e) => {
      update("recipientName", e.target.value);
      if (errors.recipientName) setErrors(prev => ({ ...prev, recipientName: "" }));
    }}
    onBlur={() => {
      if (!form.recipientName.trim()) setErrors(prev => ({ ...prev, recipientName: "Their name is required" }));
    }}
  />
  {errors.recipientName && <span className="form__error">{errors.recipientName}</span>}
</label>
```

### Clipboard copy with fallback (already in codebase)
```javascript
// Source: CreatePage.jsx lines 130-146 (already correct)
async function copyLink() {
  try {
    await navigator.clipboard.writeText(getWishUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  } catch {
    const input = document.createElement("input");
    input.value = getWishUrl();
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
}
```

### Human-readable file size (for thumbnail labels)
```javascript
// Source: standard utility pattern
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Plain `<input type="file">` for photo selection | react-dropzone `useDropzone` hook | Phase 2 | Drag-and-drop, better validation UX, file rejection feedback |
| Swatch strips (3 colors per theme) for theme selector | Single-color circles per theme | Phase 2 (D-08) | Cleaner UI, simpler interaction |
| Full success page with link display | Compact preview card with share buttons | Phase 2 (D-03) | Less screen real estate, focused share actions |
| Sender name required | Sender name optional | Phase 2 (D-13) | Supports anonymous wishes |

**Deprecated/outdated:**
- The current theme selector uses 3-color swatch strips (`form__theme-preview` with 3 `form__theme-swatch` circles). D-08 changes this to a single primary color circle per theme. [VERIFIED: CreatePage.jsx lines 319-338]

## Common Pitfalls (Server-Side, Already Addressed)

These pitfalls are referenced in `PITFALLS.md` and already handled in the existing code. Phase 2 must not regress them.

| Pitfall | Status | Evidence |
|---------|--------|----------|
| Pitfall 3: Photo upload path traversal | ADDRESSED | UUID filenames via crypto.randomUUID(), magic-byte validation via file-type, controlled serve route with UUID regex [VERIFIED: server/middleware/upload.js, server/routes/photos.js] |
| Pitfall 5: SPA 404 on direct URL access | ADDRESSED | Express catch-all route serves index.html [VERIFIED: server/index.js lines 26-35] |
| Pitfall 6: Photo-heavy load times | ADDRESSED | Thumbnails generated at upload time (300px via sharp), Cache-Control headers set [VERIFIED: server/routes/photos.js] |

## Assumptions Log

> List all claims tagged `[ASSUMED]` in this research. The planner and discuss-phase use this section to identify decisions that need user confirmation before execution.

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| -- | No assumptions in this research | -- | -- |

All claims were verified against the existing codebase, npm registry, or Context7 documentation. No user confirmation needed.

## Open Questions (RESOLVED)

1. **Should the `form-creator-flow` skill file be created in this phase or deferred?** **(RESOLVED)**
   - What we know: D-14 says create it, but the skill file does not exist yet (`.claude/skills/form-creator-flow/SKILL.md`).
   - What's unclear: Whether to create it as a documentation task in this phase or defer to a polish phase.
   - Recommendation: Create it in this phase. It documents the patterns implemented here (drag-drop, thumbnails, theme circles, success card, validation) and will be needed by Phase 3+ code that may touch form components.
   - **Resolution:** Accepted. Create it in this phase per D-14. Plan 02-02 Task 2 includes creating the skill file.

2. **How to handle "Someone special" fallback for anonymous sender?** **(RESOLVED)**
   - What we know: D-13 says sender name is optional. The wish model stores `senderName` as a required string.
   - What's unclear: What string to store/display when sender is anonymous.
   - Recommendation: Store empty string, display "Someone special" on the recipient page. This is a display concern for Phase 3.
   - **Resolution:** Accepted. Store empty string in the database. Display fallback "Someone special" is a Phase 3 concern (recipient view).

3. **Should file name and size be shown alongside thumbnails?** **(RESOLVED)**
   - What we know: D-05 says thumbnails with file names and remove buttons.
   - What's unclear: Whether to also show file size (e.g., "photo.jpg (2.1 MB)") for user confidence.
   - Recommendation: ~~Show file name truncated and file size. Low effort, high UX value.~~
   - **Resolution:** Not needed. The UI-SPEC.md (line 184) explicitly specifies "File name display: NOT shown per D-05 (thumbnails only with remove buttons)." The UI-SPEC supersedes the research recommendation. Thumbnails only with remove buttons; no file name or file size display.

## Environment Availability

> Skip this section if the phase has no external dependencies (code/config-only changes).

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build + run | Available | v24.16.0 | -- |
| npm | Package install | Available | v11.13.0 | -- |
| npx | CLI tools | Available | -- | -- |
| SQLite | Database | Available (via better-sqlite3) | Bundled | -- |
| sharp | Thumbnail gen | Already installed | ^0.35.2 | -- |
| file-type | Magic-byte validation | Already installed | ^22.0.1 | -- |

**Missing dependencies with no fallback:** none
**Missing dependencies with fallback:** none

All external dependencies are already installed or available. Only `react-dropzone` needs to be added to `client/package.json`.

## Validation Architecture

> `workflow.nyquist_validation` is explicitly `false` in `.planning/config.json`. Test infrastructure is not required for this phase.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | none configured |
| Config file | none |
| Quick run command | n/a |
| Full suite command | n/a |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PHOTO-01 | Drag-drop upload with max 5 files | manual | n/a | n/a |
| PHOTO-02 | UUID filenames in uploads dir | manual | n/a | n/a |
| THEME-01 | Theme selection changes colors | manual | n/a | n/a |
| WISH-03 | Copy link + open link work | manual | n/a | n/a |

### Sampling Rate
- Nyquist validation is disabled. Manual verification only.

### Wave 0 Gaps
- None -- testing is deferred per config.

## Security Domain

> `security_enforcement` is enabled in `.planning/config.json` (absent = true). `security_asvs_level` is 1.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No auth system in this project |
| V3 Session Management | no | No sessions |
| V4 Access Control | no | Wish access is by unguessable ID |
| V5 Input Validation | yes | Client-side inline validation (D-11) + server-side in wishService.createWish(). File upload validation: multer MIME filter + file-type magic-byte + controlled serve route. |
| V6 Cryptography | yes | crypto.randomUUID() for photo filenames. No hand-rolled crypto. |

### Known Threat Patterns for Node/Express + React

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Path traversal via photo filename | Elevation of Privilege | UUID filenames + path.resolve containment + UUID regex in serve route [VERIFIED: server/routes/photos.js] |
| File type spoofing (rename .html to .jpg) | Spoofing | Magic-byte validation via file-type npm package [VERIFIED: server/routes/photos.js] |
| XSS via wish message text | Tampering | React auto-escapes text content; no dangerouslySetInnerHTML [VERIFIED: CreatePage.jsx] |
| Upload count bypass (send 100 files) | Denial of Service | multer limits.files: 5 + server-side count check [VERIFIED: server/middleware/upload.js] |
| File size bypass (send 100MB file) | Denial of Service | multer limits.fileSize: 5MB [VERIFIED: server/middleware/upload.js] |
| Disk fill via repeated uploads | Denial of Service | No per-user rate limiting (acceptable for MVP with no public deployment) |

## Sources

### Primary (HIGH confidence)
- [VERIFIED: npm registry] react-dropzone v15.0.0 -- 11.4M weekly downloads, MIT, github.com/react-dropzone/react-dropzone
- [VERIFIED: package.json] All existing dependencies confirmed in client/package.json and server/package.json
- [VERIFIED: server/middleware/upload.js] Multer config with UUID filenames, 5MB limit, MIME filter
- [VERIFIED: server/routes/photos.js] Magic-byte validation, thumbnail generation, controlled serve route
- [VERIFIED: server/services/wishService.js] Wish creation, validation, sentence splitting
- [VERIFIED: client/src/pages/CreatePage.jsx] Current form implementation with all existing functionality
- [VERIFIED: server/index.js] Express server setup, route mounting, SPA catch-all
- [VERIFIED: server/lib/errors.js] Custom error classes (ValidationError, NotFoundError, DatabaseError)
- [VERIFIED: server/middleware/errorHandler.js] Centralized error handler
- [VERIFIED: client/src/index.css] All existing CSS styles including form, photo, theme, success sections

### Secondary (MEDIUM confidence)
- [CITED: https://react-dropzone.js.org/] react-dropzone useDropzone hook API, maxFiles, maxSize, accept, onDrop, fileRejections, thumbnail preview pattern, memory leak prevention
- [CITED: https://developer.mozilla.org] navigator.clipboard.writeText browser compatibility

### Tertiary (LOW confidence)
- [ASSUMED] -- no training-data assumptions were needed; all claims verified

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- react-dropzone verified on npm, all other packages already installed
- Architecture: HIGH -- existing code provides complete foundation, only refactoring needed
- Pitfalls: HIGH -- all pitfalls verified against existing code and official documentation

**Research date:** 2026-06-21
**Valid until:** 2026-07-21 (30 days -- stable stack, no fast-moving dependencies)
