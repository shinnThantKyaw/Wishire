# Phase 2: Creator Flow - Pattern Map

**Mapped:** 2026-06-21
**Files analyzed:** 7 (4 new components, 1 refactor, 1 CSS modification, 1 skill file)
**Analogs found:** 5 / 7

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `client/src/components/create/PhotoUploader.jsx` | component | request-response | `client/src/pages/CreatePage.jsx` (lines 279-313) | exact |
| `client/src/components/create/ThemeSelector.jsx` | component | request-response | `client/src/pages/CreatePage.jsx` (lines 316-338) | exact |
| `client/src/components/create/SuccessState.jsx` | component | request-response | `client/src/pages/CreatePage.jsx` (lines 152-184) | exact |
| `client/src/components/create/FormField.jsx` | component | request-response | `client/src/pages/CreatePage.jsx` (lines 196-275) | role-match |
| `client/src/pages/CreatePage.jsx` | page | CRUD | (self - refactor) | exact |
| `client/src/index.css` | config | transform | (self - addition) | exact |
| `.claude/skills/form-creator-flow/SKILL.md` | skill | N/A | `.claude/skills/photo-upload-security/SKILL.md` | role-match |

## Pattern Assignments

### `client/src/components/create/PhotoUploader.jsx` (component, request-response)

**Analog:** `client/src/pages/CreatePage.jsx` lines 34-46 and 279-313

**Imports pattern** -- follow existing component style (no barrel imports, direct file paths):
```jsx
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
```

**Current photo selection pattern to replace** (CreatePage.jsx lines 34-46):
```jsx
// CURRENT: plain input file handler -- to be replaced with react-dropzone
function handlePhotoSelect(e) {
  const files = Array.from(e.target.files);
  if (files.length + photos.length > 5) {
    setError("Maximum 5 photos allowed");
    return;
  }
  setPhotos((prev) => [...prev, ...files]);
  setError(null);
}

function removePhoto(index) {
  setPhotos((prev) => prev.filter((_, i) => i !== index));
}
```

**Current photo preview rendering** (CreatePage.jsx lines 295-313):
```jsx
{photos.length > 0 && (
  <div className="form__photo-preview">
    {photos.map((photo, index) => (
      <div key={index} className="form__photo-thumb">
        <img
          src={URL.createObjectURL(photo)}
          alt={`Photo ${index + 1}`}
        />
        <button
          type="button"
          className="form__photo-remove"
          onClick={() => removePhoto(index)}
        >
          x
        </button>
      </div>
    ))}
  </div>
)}
```

**Core pattern to implement** -- react-dropzone with cumulative addition (from RESEARCH.md Pattern 1):
- Props: `photos`, `onPhotosChange`, `maxFiles=5`
- `onDrop` callback merges new files with existing, caps at maxFiles
- Creates blob URLs via `URL.createObjectURL()` for previews
- Revokes URLs in `useEffect` cleanup and on individual file removal
- Displays `fileRejections` errors for user feedback
- Dynamic `maxFiles: maxFiles - photos.length` for remaining slots
- Thumbnail section shows: image preview, truncated filename, file size, remove button

**Photo upload flow** (CreatePage.jsx lines 48-65) -- stays in CreatePage, not extracted:
```jsx
async function uploadPhotos() {
  if (photos.length === 0) return [];
  const formData = new FormData();
  photos.forEach((photo) => formData.append("photos", photo));
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to upload photos");
  }
  return res.json();
}
```

**CSS classes to reuse/extend** (index.css lines 193-256):
```css
.form__photo-upload { margin-bottom: 12px; }
.form__photo-input { display: none; }
.form__photo-label { /* dashed border dropzone style */ }
.form__photo-preview { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 12px; }
.form__photo-thumb { position: relative; width: 80px; height: 80px; border-radius: 8px; overflow: hidden; }
.form__photo-thumb img { width: 100%; height: 100%; object-fit: cover; }
.form__photo-remove { position: absolute; top: 4px; right: 4px; /* round coral button */ }
```

New CSS classes needed:
- `.dropzone` -- base dropzone style (replace `.form__photo-label` behavior)
- `.dropzone--active` -- drag-active highlight state
- `.photo-thumbs` -- thumbnail grid wrapper
- `.photo-thumb` -- individual thumbnail with filename label
- `.photo-thumb__info` -- filename and size text below thumbnail

---

### `client/src/components/create/ThemeSelector.jsx` (component, request-response)

**Analog:** `client/src/pages/CreatePage.jsx` lines 5-11 and 316-338

**Current THEMES constant** (CreatePage.jsx lines 5-11):
```jsx
const THEMES = [
  { id: "sunrise", label: "Sunrise", colors: ["#ff6f59", "#ffb84d", "#fff8ef"] },
  { id: "ocean", label: "Ocean", colors: ["#4d96ff", "#6bcb77", "#e8f4f8"] },
  { id: "lavender", label: "Lavender", colors: ["#c44dff", "#ff6b9d", "#f8f0ff"] },
  { id: "forest", label: "Forest", colors: ["#2bb39c", "#6bcb77", "#f0faf5"] },
  { id: "midnight", label: "Midnight", colors: ["#4d4d7a", "#c44dff", "#1a1a2e"] },
];
```

**Updated THEMES for color circles** (per D-08/D-09/D-10):
```jsx
const THEMES = [
  { id: "sunrise", label: "Sunrise", primary: "#ff6f59" },
  { id: "ocean", label: "Ocean", primary: "#4d96ff" },
  { id: "lavender", label: "Lavender", primary: "#c44dff" },
  { id: "forest", label: "Forest", primary: "#2bb39c" },
  { id: "midnight", label: "Midnight", primary: "#4d4d7a" },
];
```

**Current theme selector rendering** (CreatePage.jsx lines 316-338):
```jsx
<div className="form__section">
  <h2 className="form__section-title">Theme</h2>
  <div className="form__themes">
    {THEMES.map((t) => (
      <button
        key={t.id}
        type="button"
        className={`form__theme-btn ${form.theme === t.id ? "form__theme-btn--active" : ""}`}
        onClick={() => update("theme", t.id)}
      >
        <span className="form__theme-preview">
          {t.colors.map((c, i) => (
            <span key={i} className="form__theme-swatch" style={{ background: c }} />
          ))}
        </span>
        <span className="form__theme-label">{t.label}</span>
      </button>
    ))}
  </div>
</div>
```

**Core pattern to implement** -- single color circle per theme (D-08/D-09):
- Props: `selected`, `onSelect`
- Render each theme as a colored `<button>` with `style={{ backgroundColor: t.primary }}`
- Selected circle gets `theme-circle--active` class (ring/highlight)
- Theme name displayed below selected circle
- `aria-label={t.label}` on each circle button

**CSS classes to replace** (index.css lines 737-786):
```css
/* REPLACE: .form__theme-preview and .form__theme-swatch (3-swatch strip) with single circle */
.form__themes { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 10px; }
.form__theme-btn { /* card with border, centered */ }
.form__theme-btn--active { border-color: var(--coral); }
.form__theme-label { /* theme name below */ }
```

New CSS classes needed:
- `.theme-circle` -- 40-48px colored circle button
- `.theme-circle--active` -- ring/border highlight for selected
- `.theme-name` -- label below the selected circle

---

### `client/src/components/create/SuccessState.jsx` (component, request-response)

**Analog:** `client/src/pages/CreatePage.jsx` lines 126-150 and 152-184

**Current success state rendering** (CreatePage.jsx lines 152-184):
```jsx
if (createdWish) {
  return (
    <div className="page">
      <div className="card success">
        <span className="success__icon">✅</span>
        <h1>Wish Created!</h1>
        <p>
          Your birthday wish for <strong>{createdWish.recipientName}</strong> is
          ready to share.
        </p>
        <div className="success__link">
          <code>{getWishUrl()}</code>
        </div>
        <div className="success__actions">
          <button className="success__btn success__btn--primary" onClick={openLink}>
            Open Link
          </button>
          <button className="success__btn success__btn--secondary" onClick={copyLink}>
            {copied ? "Copied! ✓" : "Copy Link"}
          </button>
        </div>
        <button
          className="success__back"
          onClick={() => { setCreatedWish(null); setCopied(false); }}
        >
          ← Create another wish
        </button>
      </div>
    </div>
  );
}
```

**Clipboard copy with fallback** (CreatePage.jsx lines 130-146) -- extract into SuccessState:
```jsx
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

**Core pattern to implement** -- compact preview card (D-02/D-03):
- Props: `wish`, `onReset`
- Compact preview card (~200px tall): recipient name, first line of message, theme color swatch
- Copy Link button (clipboard API with execCommand fallback -- from ShareButton.jsx pattern)
- Open Link button (window.open)
- "Create another" link (calls onReset)
- Local state for `copied`

**Existing CSS classes to reuse** (index.css lines 930-1029):
```css
.success { text-align: center; padding: 48px 28px; /* flex column centered */ }
.success__icon { font-size: 3rem; }
.success h1 { /* Baloo 2, coral */ }
.success__link { /* code block with URL */ }
.success__actions { display: flex; gap: 12px; }
.success__btn { /* pill buttons */ }
.success__btn--primary { coral background }
.success__btn--secondary { mint border }
.success__back { /* text link */ }
```

New CSS classes needed:
- `.success__preview` -- compact preview card container (~200px)
- `.success__preview-name` -- recipient name in preview
- `.success__preview-message` -- truncated first line of message
- `.success__preview-swatch` -- theme color indicator

---

### `client/src/components/create/FormField.jsx` (component, request-response)

**Analog:** `client/src/pages/CreatePage.jsx` lines 196-275

**Current form field pattern** (CreatePage.jsx lines 196-207):
```jsx
<label>
  Your name
  <input
    required
    value={form.senderName}
    onChange={(e) => update("senderName", e.target.value)}
    placeholder="e.g. Priya"
  />
</label>
```

**Core pattern to implement** -- reusable field wrapper with inline error (D-11):
- Props: `label`, `error`, `children` (the input element)
- Wraps any input/select/textarea with a label and error message
- Error displayed as `<span className="form__error">` below the input
- Conditional `form__field--error` class on the wrapper for visual state

**Error styling pattern** (from RESEARCH.md Pattern 2):
```jsx
{errors.recipientName && <span className="form__error">{errors.recipientName}</span>}
```

New CSS classes needed:
- `.form__error` -- error text (red, small, below field)
- `.form__field--error` -- error state on field wrapper (red border on input)

---

### `client/src/pages/CreatePage.jsx` (page, CRUD -- REFACTOR)

**Analog:** Self -- existing file at 350 lines

**Refactor scope:**
1. Import new sub-components: `PhotoUploader`, `ThemeSelector`, `SuccessState`, `FormField`
2. Move `THEMES` constant to `ThemeSelector.jsx`
3. Replace inline photo section (lines 279-313) with `<PhotoUploader>`
4. Replace inline theme section (lines 316-338) with `<ThemeSelector>`
5. Replace inline success state (lines 152-184) with `<SuccessState>`
6. Add `errors` state object and validation logic (D-11/D-12)
7. Make `senderName` optional (D-13) -- remove validation at line 74
8. Default senderName to empty string when blank in wish creation payload
9. Keep `uploadPhotos()`, `generate()`, `getWishUrl()` in CreatePage (orchestration layer)

**Validation pattern to add** (from RESEARCH.md Pattern 2):
```jsx
const [errors, setErrors] = useState({});

function validate(field, value) {
  switch (field) {
    case "recipientName": return value.trim() ? "" : "Their name is required";
    case "month": return value >= 1 && value <= 12 ? "" : "Pick a month (1-12)";
    case "day": return value >= 1 && value <= 31 ? "" : "Pick a day (1-31)";
    case "message": return value.trim() ? "" : "Please write a birthday message";
    default: return "";
  }
}

function onBlur(field, value) {
  const error = validate(field, value);
  setErrors(prev => ({ ...prev, [field]: error }));
}
```

**Error handling pattern** (from existing generate() lines 67-124):
```jsx
async function generate(e) {
  e.preventDefault();
  setLoading(true);
  setError(null);
  try {
    // validation + upload + create
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
    setUploadProgress(null);
  }
}
```

---

### `client/src/index.css` (config, transform -- ADDITION)

**Analog:** Self -- existing file at 1248 lines

**Sections to add/modify:**
1. Add dropzone styles (`.dropzone`, `.dropzone--active`) -- replace `.form__photo-label` behavior
2. Add thumbnail info styles (`.photo-thumb__info` -- filename + size)
3. Replace theme swatch strip styles with color circle styles (`.theme-circle`, `.theme-circle--active`)
4. Add success preview card styles (`.success__preview`)
5. Add form error styles (`.form__error`, `.form__field--error`)

**CSS convention** -- follow existing pattern (index.css):
- BEM-like naming: `.block__element--modifier`
- CSS custom properties from `:root` for colors
- `transition` on interactive elements (150-300ms)
- Mobile responsive breakpoints at 768px and 480px

---

### `.claude/skills/form-creator-flow/SKILL.md` (skill, N/A)

**Analog:** `.claude/skills/photo-upload-security/SKILL.md`

**Pattern to follow** (photo-upload-security/SKILL.md structure):
```markdown
---
name: form-creator-flow
description: [what it captures]
---

# Form Creator Flow

## Sections covering:
- react-dropzone drag-drop pattern with cumulative file addition
- Thumbnail previews with blob URL management
- Theme color circle selector
- Inline success state (no route change)
- Inline field validation (blur + submit)
- Memory leak prevention (URL.revokeObjectURL)
```

**Content from CONTEXT.md D-14:**
> Create new skill `form-creator-flow` capturing: drag-drop pattern, thumbnail previews, theme color circles, success state card, form validation patterns.

---

## Shared Patterns

### Authentication
**Not applicable.** This project has no auth system. Wish access is by unguessable nanoid.

### Error Handling (Client)
**Source:** `client/src/pages/CreatePage.jsx` lines 67-124
**Apply to:** CreatePage.jsx `generate()` handler
```jsx
// Pattern: try/catch in generate(), set error state, display inline
try {
  // ... validation + API calls
} catch (err) {
  setError(err.message);
} finally {
  setLoading(false);
  setUploadProgress(null);
}
```

### Error Handling (Server)
**Source:** `server/lib/errors.js` + `server/middleware/errorHandler.js`
**Apply to:** All server routes (already established, no changes needed)
```jsx
// Custom error classes: ValidationError(400), NotFoundError(404), DatabaseError(500)
// asyncHandler wraps route handlers to catch Promise rejections
// Centralized errorHandler middleware as last middleware in server/index.js
```

### Validation (Client)
**Source:** `client/src/pages/CreatePage.jsx` (to be refactored)
**Apply to:** All form fields
```jsx
// Pattern: validate on blur, clear on change when valid
function onBlur(field, value) {
  const error = validate(field, value);
  setErrors(prev => ({ ...prev, [field]: error }));
}
// In onChange: if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
```

### Validation (Server)
**Source:** `server/services/wishService.js` lines 27-38
**Apply to:** `createWish()` -- already handles validation
```jsx
if (!senderName || !recipientName || !message) {
  throw new ValidationError("senderName, recipientName, and message are required");
}
```
**Note:** Phase 2 makes senderName optional. Server validation at line 28 must change to:
```jsx
if (!recipientName || !message) {
  throw new ValidationError("recipientName and message are required");
}
```

### Photo Upload Flow
**Source:** `server/middleware/upload.js` + `server/routes/photos.js`
**Apply to:** No changes needed. Already secure with UUID filenames, magic-byte validation, thumbnail generation.

### CSS Conventions
**Source:** `client/src/index.css`
**Apply to:** All new CSS additions
```css
/* Pattern: BEM-like naming, CSS custom properties, transitions */
.form__error { color: #c0392b; font-size: 0.8rem; font-weight: 600; margin-top: 4px; }
/* Responsive: add rules under @media (max-width: 768px) and @media (max-width: 480px) */
```

## No Analog Found

Files with no close match in the codebase (planner should use RESEARCH.md patterns instead):

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `client/src/components/create/PhotoUploader.jsx` | component | request-response | No existing drag-drop component; the analog is the current inline photo section in CreatePage.jsx which uses plain `<input type="file">`. The react-dropzone `useDropzone` hook pattern comes from RESEARCH.md Pattern 1 and the react-dropzone docs. |

Note: While PhotoUploader has an analog in the current CreatePage photo section, the drag-drop mechanism itself is new to this codebase. The analog provides the visual/structural pattern (thumbnail grid, remove buttons) but not the react-dropzone hook pattern.

## Metadata

**Analog search scope:** `client/src/`, `server/`, `.claude/skills/`
**Files scanned:** 15 JSX/JS files + 1 CSS file + 4 skill files
**Pattern extraction date:** 2026-06-21
