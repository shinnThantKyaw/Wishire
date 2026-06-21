---
status: testing
phase: 03-recipient-experience
source: [03-VERIFICATION.md]
started: 2026-06-21T04:35:00.000Z
updated: 2026-06-21T04:35:00.000Z
---

## Current Test

number: 1
name: Gift box visual quality and animation
expected: |
  Gift box renders with theme colors (lid = primary, body = secondary).
  Glow effect visible. "Tap to open" hint pulses.
  Split animation is smooth (~1s), lid lifts up with particles bursting.
awaiting: user response

## Tests

### 1. Gift box visual quality and animation
expected: |
  Gift box renders centered with theme colors. Lid = primary color, ribbon = secondary.
  Glow radial gradient visible behind box. "Tap to open" hint pulses gently.
  On tap: lid splits up (y:-60, rotateX:-45, ~1s), 18 particles burst from center.
  "From [Name]" visible on box body before opening.
result: [pending]

### 2. Typewriter sentence reveal
expected: |
  After box opens, first sentence appears character by character (50ms/char).
  Blinking cursor visible during typing. "Skip" button visible while typing.
  Clicking Skip instantly shows full sentence. Chime SFX plays on completion.
  "Tap to continue" hint appears after sentence is fully revealed.
result: [pending]

### 3. Audio behavior
expected: |
  Music starts playing on first gift box tap (volume ~50%).
  Music loops continuously through all experience phases.
  Pause button (top-right corner) toggles music on/off.
  Whoosh SFX plays on box open. Chime SFX plays on sentence reveal.
result: [pending]

### 4. Photo slideshow
expected: |
  After all sentences revealed, photos appear one at a time.
  Auto-advance every ~3.5 seconds with crossfade transition.
  Prev/Next buttons work and pause auto-advance for 10 seconds.
  Counter shows "1/N" format. Slideshow completes after last photo.
result: [pending]

### 5. Confetti finale
expected: |
  After last photo (or last sentence if no photos), confetti explodes (200 particles).
  Second burst at 250ms (100 particles). "Happy Birthday!" text springs in.
  Recipient name displayed below. Flair chips visible if available.
  Auto-transitions to replay after 4 seconds.
result: [pending]

### 6. Replay
expected: |
  "Experience again" button appears in pill shape (mint background, white text).
  Clicking it resets everything: gift box reassembles, music restarts from beginning.
  All animations replay correctly. playCount increments (visible in React DevTools).
result: [pending]

### 7. Error states
expected: |
  Invalid wish ID (e.g., /wish/nonexistent): shows "This wish doesn't exist or has been removed."
  Network error: shows "Could not load this wish. Check your connection and try again."
  Both show "Try again" button that reloads the page. Button is 44px+ touch target.
result: [pending]

### 8. Responsive layout
expected: |
  Mobile (≤480px): gift box 100x84px, smaller fonts, tighter spacing.
  Tablet (≤768px): intermediate sizing.
  No horizontal overflow at any breakpoint.
  All buttons maintain 44px minimum touch target.
result: [pending]

## Summary

total: 8
passed: 0
issues: 0
pending: 8
skipped: 0
blocked: 0

## Gaps
