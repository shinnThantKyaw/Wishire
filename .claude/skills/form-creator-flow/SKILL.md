---
name: form-creator-flow
description: Patterns for the birthday wish creator form — react-dropzone drag-drop with cumulative file addition, thumbnail previews with blob URL lifecycle, theme color circle selector, inline success state (no route change), inline field validation (validate on submit, clear on change), and memory leak prevention. Apply when building or modifying PhotoUploader, ThemeSelector, SuccessState, or CreatePage components.
---

# Form Creator Flow

Patterns for the birthday wish creation flow: form with drag-drop photo upload, theme selection, inline validation, and post-creation success state with share buttons.

## react-dropzone Drag-Drop Pattern

The `useDropzone` hook manages drag-and-drop file selection. On drop, merge new files with existing state, capping at `maxFiles`.

```jsx
import { useDropzone } from "react-dropzone";

const onDrop = useCallback((acceptedFiles) => {
  const remaining = maxFiles - photos.length;
  const filesToAdd = acceptedFiles.slice(0, remaining);
  const withPreviews = filesToAdd.map(file =>
    file.preview ? file : Object.assign(file, { preview: URL.createObjectURL(file) })
  );
  onPhotosChange([...photos, ...withPreviews]);
}, [photos, maxFiles, onPhotosChange]);

const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
  onDrop,
  accept: { "image/jpeg": [], "image/png": [], "image/webp": [], "image/gif": [] },
  maxSize: 5 * 1024 * 1024,
  maxFiles: maxFiles - photos.length,
  multiple: true,
});
```

Key details:
- `maxFiles` is set dynamically to `maxFiles - photos.length` for remaining slots
- `fileRejections` must be displayed to the user for feedback
- Accept types are MIME-based as UX convenience; real validation is server-side (magic-byte)

## Thumbnail Previews with Blob URL Management

Each selected file gets a blob URL via `URL.createObjectURL()` stored on the file object as `file.preview`.

```jsx
const withPreviews = filesToAdd.map(file =>
  file.preview ? file : Object.assign(file, { preview: URL.createObjectURL(file) })
);
```

Lifecycle management:
- Create blob URL once on file selection (in `onDrop`)
- Revoke on individual file removal: `URL.revokeObjectURL(file.preview)`
- Revoke all on component unmount via `useEffect` cleanup
- Display as `<img src={file.preview} />` in a thumbnail grid

## Theme Color Circle Selector

Each theme renders as a button containing 3 color circles (primary, secondary, surface) from the `THEMES` constant.

```jsx
export const THEMES = [
  { id: "sunrise", label: "Sunrise", primary: "#ff6f59", secondary: "#ffb84d", surface: "#fff8ef" },
  { id: "ocean", label: "Ocean", primary: "#4d96ff", secondary: "#6bcb77", surface: "#e8f4f8" },
  // ...
];
```

The selector is a controlled component with `value` and `onChange` props. Selected button gets `--active` class with coral border.

## Inline Success State (No Route Change)

After wish creation, `createdWish` state is set. CreatePage renders `SuccessState` component instead of the form. No navigation occurs.

```jsx
if (createdWish) {
  return (
    <div className="page">
      <SuccessState wish={createdWish} onReset={() => setCreatedWish(null)} />
    </div>
  );
}
```

SuccessState shows: checkmark icon, "Wish Created!" heading, compact preview card (~200px) with recipient name + first message line + theme swatch, Copy Link button (clipboard API + execCommand fallback), Open Link button (window.open), "Create another wish" text link.

## Inline Field Validation

Validate on submit. Clear individual field errors on subsequent change (after first submit).

```jsx
const [errors, setErrors] = useState({});
const [submitted, setSubmitted] = useState(false);

function validate(field, value) {
  switch (field) {
    case "recipientName": return value.trim() ? "" : "Their name is required";
    case "month": return value >= 1 && value <= 12 ? "" : "Birth month must be 1-12";
    case "day": return value >= 1 && value <= 31 ? "" : "Birth day must be 1-31";
    case "message": return value.trim() ? "" : "Please write a birthday message";
    default: return "";
  }
}

// In onChange: clear error if already submitted
if (submitted && errors[field]) {
  setErrors(prev => ({ ...prev, [field]: "" }));
}
```

Required fields: recipientName, month, day, message. Sender name is optional.

## Memory Leak Prevention

Blob URLs (`URL.createObjectURL`) are not garbage-collected. Must revoke explicitly:

1. On file removal: `URL.revokeObjectURL(file.preview)` before filtering state
2. On component unmount: `useEffect` cleanup revokes all remaining blob URLs
3. Never call `createObjectURL` during render -- only in event handlers or effects

## When Building These Files

- `client/src/components/create/PhotoUploader.jsx` -- drag-drop zone + thumbnail grid
- `client/src/components/create/ThemeSelector.jsx` -- color circle theme picker
- `client/src/components/create/SuccessState.jsx` -- preview card + share buttons
- `client/src/pages/CreatePage.jsx` -- form orchestration, validation, sub-component integration
