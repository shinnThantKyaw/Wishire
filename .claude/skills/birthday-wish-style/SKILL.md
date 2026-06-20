---
name: birthday-wish-style
description: Display conventions for wish text — sentence splitting, typography, flair chip formatting, and render safety rules. Apply whenever building or editing wish display components (SentenceRevealer, FlairChips, PreviewPanel) or the Prisma schema's message field.
---

# Birthday Wish Display Conventions

Rules for how wish text is stored, split, rendered, and enhanced with flair.

## Message Storage

- Wish messages are stored as **plain text** in the `Wish.message` field (String, required).
- The original message is preserved verbatim. Never mutate it.
- Max message length: 1000 characters (enforced server-side in `wishService.createWish()`).

## Sentence Splitting

- Server-side splitting in `wishService.createWish()`.
- Split on sentence-ending punctuation followed by whitespace: `. `, `! `, `? `.
- Trim whitespace from each resulting sentence. Discard empty strings.
- If the message has no sentence-ending punctuation, treat the entire text as one sentence.
- Store split sentences as a JSON array in `Wish.sentences` (String, serialized JSON array).

```js
// In wishService.createWish():
const sentences = message
  .split(/(?<=[.!?])\s+/)
  .map(s => s.trim())
  .filter(Boolean);
```

- 1–6 sentences is a reasonable range. If the generator writes more than 6, still accept it — just truncate to the first 6 and log a warning.

## Display Typography

- Each sentence is rendered in a `<p>` or `<span>` element inside `<SentenceRevealer>`.
- **Never use `dangerouslySetInnerHTML`.** React escapes text content by default — rely on that.
- Sentences are centered, with generous line-height (1.6–1.8) for readability on mobile.
- Font size: 1.25–1.5rem for sentences, larger for the final sentence (the "punchline").
- Color comes from `var(--color-text)` set by the active theme.

## Flair Chip Formatting

- Flair chips appear as styled pills/badges below the wish text or in the page footer.
- Three chips always: zodiac sign (✨), birthstone (💎), birth flower (🌸).
- **Not inline in the wish text.** Flair enhances the page, not the sentences.
- Format: emoji + label on one line — e.g. `✨ Leo` not `Your zodiac sign is Leo`.
- Birthstone color from `lib/flair.js` feeds `var(--color-birthstone)` CSS custom property.
- Zodiac symbol (♈♉♊♋♌♍♎♏♐♑♒♓) is embedded in `lib/flair.js` and displayed in FlairChips.

## Render Safety

- Wish text is user-generated content. Treat it as untrusted.
- Always render via React text nodes (`<p>{sentence}</p>`), never via `dangerouslySetInnerHTML`.
- Sanitize before storage: strip control characters, normalize line endings to `\n`.
- The server validates message is a non-empty string under 1000 chars before storage.

## When Building These Components

- `SentenceRevealer` (`client/src/components/experience/SentenceRevealer.jsx`) — sentence-by-sentence reveal
- `FlairChips` (`client/src/components/experience/FlairChips.jsx`) — flair pills
- `PreviewPanel` (`client/src/components/create/PreviewPanel.jsx`) — generator preview
- `wishService.createWish()` (`server/services/wishService.js`) — sentence splitting + validation