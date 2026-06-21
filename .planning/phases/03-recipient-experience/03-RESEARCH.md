---
phase: 03-recipient-experience
confidence: HIGH
researched: 2026-06-21
---

# Phase 3: Recipient Experience — Research

## Stack Summary

| Library | Version | Role | Status |
|---------|---------|------|--------|
| framer-motion | ^12.40.0 | All animations (gift box, sentences, photos, confetti canvas) | Installed |
| howler | ^2.2.4 | Audio playback (music + SFX), mobile AudioContext unlock | Installed |
| canvas-confetti | ^1.9.4 | Confetti explosion finale | Installed |
| react-router-dom | (existing) | Route for /wish/:id | Installed |

**No new dependencies needed.** All three animation/audio libraries are already installed.

## Architecture: State Machine Pattern

The experience is driven by a `useReducer` state machine with these states:

```
IDLE → GIFT_BOX → UNWRAPPING → REVEALING → PHOTOS → FINALE → COMPLETE
  ↑                                                                |
  └────────────────── replay (playCount++) ────────────────────────┘
```

**State shape:**
```js
{
  status: 'IDLE' | 'GIFT_BOX' | 'UNWRAPPING' | 'REVEALING' | 'PHOTOS' | 'FINALE' | 'COMPLETE',
  sentenceIndex: 0,      // current sentence being revealed
  playCount: 0,          // incremented on replay — used in AnimatePresence keys
  photoIndex: 0,         // current photo in slideshow
  isTyping: false,       // typewriter in progress
  isMusicPlaying: false,  // music state
}
```

**Actions:** `OPEN_BOX`, `BOX_OPENED`, `NEXT_SENTENCE`, `SKIP_TYPING`, `ALL_SENTENCES_DONE`, `NEXT_PHOTO`, `PREV_PHOTO`, `START_FINALE`, `FINALE_DONE`, `REPLAY`

## Pattern 1: Gift Box Split Animation

**Approach:** Two `<motion.div>` halves (top/lid and bottom/body) with `animate` controlled by state.

```js
// Module-level variants (not inline — framer-motion-patterns Rule 2)
const lidVariants = {
  closed: { y: 0, rotateX: 0 },
  open: { y: -60, rotateX: -45, transition: { duration: 1, ease: 'easeOut' } }
};
const bodyVariants = {
  closed: { scale: 1 },
  open: { scale: 1.05, transition: { duration: 0.3, delay: 0.5 } }
};
```

- CSS/SVG box shape with theme-colored accents
- Particles: canvas-based or CSS `@keyframes` with random positions — burst from center during split
- `onAnimationComplete` dispatches `BOX_OPENED` to advance state machine

**Key:** AnimatePresence key must include `playCount` for replay: `key={`gift-box-${playCount}`}`

## Pattern 2: Typewriter Effect

**Approach:** `useEffect` with `setInterval` that reveals one character at a time.

```js
// Core typewriter hook
function useTypewriter(text, speed = 50) {
  const [displayed, setDisplayed] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let i = 0;
    setDisplayed('');
    setIsComplete(false);
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayed, isComplete };
}
```

- Skip button: sets `displayed = text` immediately, sets `isComplete = true`
- Tap/click to advance: when `isComplete`, dispatch `NEXT_SENTENCE`
- SFX chime plays on each `NEXT_SENTENCE` dispatch
- Last sentence: dispatch `ALL_SENTENCES_DONE` → transition to PHOTOS

## Pattern 3: Photo Slideshow

**Approach:** AnimatePresence with crossfade between photos.

```jsx
<AnimatePresence mode="wait">
  <motion.img
    key={`photo-${photoIndex}-${playCount}`}
    src={photos[photoIndex]}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
  />
</AnimatePresence>
```

- Auto-advance: `useEffect` with `setTimeout` (3-4 seconds)
- Manual controls: Previous/Next buttons with `aria-label`
- Auto-pauses on manual interaction
- Transition to FINALE when last photo shown

## Pattern 4: Audio (Howler.js)

**Approach:** Two Howl instances — one for music, one for SFX.

```js
// Music — created on component mount, played on gift box tap
const music = new Howl({
  src: ['/assets/audio/happy-birthday.mp3'],
  html5: true,  // streaming for large files
  volume: 0.5,  // 50-60% per D-11
  loop: true,
});

// SFX — pooled for instant playback
const sfxWhoosh = new Howl({ src: ['/assets/audio/whoosh.mp3'], volume: 0.6 });
const sfxChime = new Howl({ src: ['/assets/audio/chime.mp3'], volume: 0.4 });
```

**Mobile AudioContext unlock (Pitfall 8):**
- The gift box tap IS the user gesture — call `music.play()` inside the tap handler
- Howler.js handles AudioContext resume internally when `html5: true`
- No separate unlock dance needed — the tap gesture satisfies browser autoplay policy

**Pause/resume button:** `music.pause()` / `music.play()` — top-right corner, always visible.

## Pattern 5: Confetti Finale

**Approach:** `canvas-confetti` library (already installed).

```js
import confetti from 'canvas-confetti';

// Fire on FINALE state entry
function fireConfetti() {
  const count = 200;
  const defaults = { origin: { y: 0.7 }, zIndex: 1000 };
  confetti({ ...defaults, particleCount: count, spread: 60, startVelocity: 55 });
  // Second burst after short delay
  setTimeout(() => {
    confetti({ ...defaults, particleCount: count / 2, spread: 100, startVelocity: 35 });
  }, 250);
}
```

- "Happy Birthday!" text fades in after confetti (Framer Motion)
- Confetti canvas must have `pointer-events: none` (framer-motion-patterns Rule 5)
- Transition to PHOTOS state after a few seconds

## Pattern 6: Replay

**Approach:** Increment `playCount` in reducer, dispatch back to `IDLE`.

```js
case 'REPLAY':
  return { ...initialState, playCount: state.playCount + 1 };
```

- `playCount` in every AnimatePresence key forces React to unmount/remount all components
- This resets all animations, typewriter state, and photo index
- Music restarts from beginning
- Framer-motion-patterns Rule 1: stable meaningful keys

## Component Structure

```
client/src/
├── pages/
│   └── WishPage.jsx              # Main page, owns useReducer, fetches wish data
├── components/
│   └── experience/
│       ├── ExperienceOrchestrator.jsx  # AnimatePresence router for state machine
│       ├── GiftBox.jsx                 # CSS/SVG box + split animation + particles
│       ├── SentenceRevealer.jsx        # Typewriter text + skip button
│       ├── PhotoSlideshow.jsx          # AnimatePresence photo carousel
│       ├── ConfettiFinale.jsx          # Confetti + "Happy Birthday!" text
│       ├── ReplayButton.jsx            # Reset + replay trigger
│       ├── AudioController.jsx         # Music + SFX management, pause/resume button
│       └── ErrorState.jsx              # Wish not found / network error
```

## API Integration

`GET /api/wish/:id` — already exists. Returns:
```js
{
  id, senderName, recipientName, message, relationship,
  month, day,
  theme,           // theme ID string (e.g., "sunrise")
  photos: [],      // array of photo URLs
  flair: { zodiac, birthstone, birthflower },
  createdAt
}
```

**Sentence splitting:** The message is split into sentences client-side using the same logic as `server/services/wishService.js` (sentence splitting regex). Alternatively, the server could return pre-split sentences — check the API response.

## Pitfall Mitigations

| Pitfall | Risk | Mitigation |
|---------|------|------------|
| Pitfall 2: AnimatePresence keys | Exit animations don't fire on replay | Every `key` includes `${playCount}` — forces full remount |
| Pitfall 8: Mobile audio autoplay | Music blocked by browser | Gift box tap IS the user gesture — `music.play()` called inside tap handler |

## Skill Compliance

| Skill | How Applied |
|-------|-------------|
| `framer-motion-patterns` | Variants at module level, AnimatePresence keys with playCount, onAnimationComplete for state dispatch, pointer-events: none on confetti canvas |
| `birthday-wish-style` | Sentence display typography, flair chips (zodiac/birthstone if displayed) |
| `ui-ux-pro-max` | 44px touch targets on all buttons, prefers-reduced-motion (disable typewriter speed, instant transitions), responsive layout |

## Open Questions (RESOLVED)

1. **Where does sentence splitting happen?** — Check if `GET /api/wish/:id` returns pre-split sentences or raw message. If raw, split client-side using the same regex as wishService. **Resolution:** Client splits using `.split(/(?<=[.!?])\s+/)` pattern.

2. **How to handle wish not found?** — API returns 404. Show error state with "This wish doesn't exist or has been removed." and a "Try again" button. **Resolution:** ErrorState component, per UI-SPEC copy.

3. **What if audio files are missing?** — Graceful degradation. Music/SFX fail silently. The visual experience works without audio. **Resolution:** Howler.js `onerror` callback — skip audio, continue experience.

---

*Phase: 03-recipient-experience*
*Researched: 2026-06-21*
*Confidence: HIGH — all libraries installed, patterns clear from CONTEXT.md + UI-SPEC + skills*
