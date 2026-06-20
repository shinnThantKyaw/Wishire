---
name: framer-motion-patterns
description: Framer Motion patterns for this project — AnimatePresence key rules, variant definition placement, onAnimationComplete for state machine dispatch, replay reset, and confetti canvas pointer-events. Apply when building any experience component (GiftBox, SentenceRevealer, ConfettiFinale, PhotoGallery) or ExperienceOrchestrator. Prevents Pitfall 2 (AnimatePresence exit animations not firing) and the inline-object re-render trap.
---

# Framer Motion Patterns

Every animation touchpoint must follow these patterns. Framer Motion is powerful but its failure modes are predictable — the rules below prevent each one.

Generated from PITFALLS.md Pitfall 2 and the "React re-renders + Framer Motion" integration gotcha.

## Rule 1: Every AnimatePresence Child Must Have a Stable, Meaningful `key`

```jsx
// ✅ CORRECT: stable key tied to the phase + playCount
<AnimatePresence mode="wait">
  {phase.status === 'GIFT_BOX' && (
    <motion.div key={`gift-box-${playCount}`} ...>
      <GiftBox />
    </motion.div>
  )}
  {phase.status === 'SENTENCE' && (
    <motion.div key={`sentence-${phase.sentenceIndex}-${playCount}`} ...>
      <SentenceRevealer text={wish.sentences[phase.sentenceIndex]} />
    </motion.div>
  )}
</AnimatePresence>

// ❌ WRONG: no key — React reuses the DOM node, exit animation never fires
<AnimatePresence>
  {showGiftBox && <motion.div>...</motion.div>}
</AnimatePresence>

// ❌ WRONG: random key — Framer Motion treats it as a new mount, exit never fires
<motion.div key={Math.random()}>...</motion.div>
```

### Key Format Convention
- Use `{phase-name}-{index}-{playCount}` for components inside the state machine.
- `playCount` (incremented on replay) forces React to unmount/remount every component, resetting all animations.
- Never use array index alone as the key — it shifts when items are added/removed.

## Rule 2: Use `mode="wait"` on AnimatePresence

```jsx
// ✅ CORRECT: exit animation completes before enter animation starts
<AnimatePresence mode="wait">
  {/* phase components */}
</AnimatePresence>

// ❌ WRONG: default mode="sync" — enter and exit happen simultaneously
<AnimatePresence>
  {/* components jump around as one enters while the other exits */}
</AnimatePresence>
```

- `mode="wait"` ensures the exiting phase finishes before the entering phase begins.
- This is desirable for the unwrap experience — phases should feel deliberate, not rushed.
- Use only ONE `<AnimatePresence mode="wait">` wrapper in `ExperienceOrchestrator`.

## Rule 3: Define Animation Variants Outside the Component

```jsx
// ✅ CORRECT: variants defined at module level — object reference is stable
const giftBoxVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } },
  exit: { scale: 1.2, opacity: 0, transition: { duration: 0.3 } },
};

function GiftBox({ onTap }) {
  return (
    <motion.div
      key="gift-box"
      variants={giftBoxVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      onTap={onTap}
    >
      {/* gift box artwork */}
    </motion.div>
  );
}

// ❌ WRONG: inline object — new reference every render, Framer Motion restarts animation
<motion.div
  animate={{ scale: 1, opacity: 1 }}
  transition={{ type: 'spring', stiffness: 200 }}
>
```

### What Goes at Module Level
- All `variants` objects (`initial`, `animate`, `exit`).
- Complex `transition` configs (spring parameters, stagger delays).
- Theme-aware variants: import theme at module level and compose variant objects, or pass them via props from a single memoized source.

## Rule 4: Use `onAnimationComplete` to Dispatch State Transitions

```jsx
// ✅ CORRECT: Framer Motion callback dispatches to the state machine
<motion.div
  variants={unwrapVariants}
  initial="initial"
  animate="animate"
  onAnimationComplete={() => dispatch({ type: 'UNWRAP_DONE' })}
>
  <GiftBox />
</motion.div>

// ❌ WRONG: setTimeout guessing animation duration — breaks on slow devices
setTimeout(() => dispatch({ type: 'UNWRAP_DONE' }), 800);
```

- Every animation that triggers a state transition must use `onAnimationComplete`.
- Never estimate animation duration with `setTimeout`.
- If an animation has multiple children (staggered), use `onAnimationComplete` on the LAST child to fire — or use a variant `transition.onComplete` callback.

## Rule 5: Include `playCount` in Keys for Replay

```jsx
// ✅ CORRECT: playCount in every key — full remount on replay
const [playCount, setPlayCount] = useState(0);

function handleReplay() {
  setPlayCount(c => c + 1);
  dispatch({ type: 'TAP_REPLAY' });
}

return (
  <AnimatePresence mode="wait">
    <motion.div key={`gift-box-${playCount}`} ...>
      <GiftBox />
    </motion.div>
  </AnimatePresence>
);
```

- On replay (`TAP_REPLAY`), increment `playCount` and reset the state machine to `GIFT_BOX`.
- The changed key forces React to unmount the old component and mount a fresh one.
- This resets all animation state, audio position, and internal component state without manual cleanup.

## Rule 6: Confetti Canvas Must Have `pointer-events: none`

```jsx
// ✅ CORRECT: full-screen confetti canvas doesn't block taps underneath
const confettiCanvasStyle = {
  position: 'fixed',
  inset: 0,
  pointerEvents: 'none',  // ← CRITICAL
  zIndex: 9999,
};

// ❌ WRONG: pointer-events defaults to auto — user can't tap reaction buttons
```

- The confetti canvas spans the full viewport. Without `pointer-events: none`, it blocks all user interaction with elements underneath (ReactionBar, Replay button).
- Apply this to the `<canvas>` element in `ConfettiFinale.jsx`, NOT via CSS (inline style is fine since it's dynamically mounted).

## Rule 7: Shared Canvas for Confetti (Prevent Memory Leaks)

```jsx
// ✅ CORRECT: one canvas instance, reused across replays
function ConfettiFinale({ playCount, onComplete }) {
  const canvasRef = useRef(null);
  const confettiRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    // Create once, reuse forever
    if (!confettiRef.current) {
      confettiRef.current = confetti.create(canvasRef.current, { resize: true });
    }
    confettiRef.current({
      particleCount: window.innerWidth < 768 ? 80 : 200,
      spread: window.innerWidth < 768 ? 70 : 100,
      // ...other options
    }).then(onComplete);

    return () => {
      confetti.reset(); // clear stuck particles on unmount/replay
    };
  }, [playCount]); // re-fire on each replay

  return <canvas ref={canvasRef} style={confettiCanvasStyle} />;
}
```

- Create the confetti instance ONCE with `confetti.create(canvas, { resize: true })`, stored in a ref.
- On replay, call `confetti.reset()` before calling `confetti()` again.
- Reduce particle count on mobile (`window.innerWidth < 768`): 80 particles, spread 70.
- The canvas element itself mounts/unmounts with AnimatePresence (playCount key forces this).

## Rule 8: Audio Init — Eager Howl, Deferred `.play()`

```jsx
// ✅ CORRECT: create Howl eagerly, play on first gesture
function BackgroundMusic({ src, playCount }) {
  const howlRef = useRef(null);

  useEffect(() => {
    if (!howlRef.current) {
      howlRef.current = new Howl({
        src: [src],
        loop: true,
        volume: 0.4,
        preload: true,
      });
    }
    // Don't call .play() here — wait for user gesture
  }, [src]);

  // Called from GiftBox onTap handler
  function startMusic() {
    if (howlRef.current && !howlRef.current.playing()) {
      howlRef.current.play();
    }
  }

  // On replay: reset position
  useEffect(() => {
    if (playCount > 0 && howlRef.current) {
      howlRef.current.seek(0);
      howlRef.current.play();
    }
  }, [playCount]);
}
```

- Howl instance created in `useEffect` on mount — audio file starts preloading immediately.
- `.play()` is called from the GiftBox tap handler, satisfying the browser's user-gesture requirement.
- On replay: seek to 0 and play again (audio context is already unlocked from the first tap).

## When Building These Files

- `ExperienceOrchestrator.jsx` — AnimatePresence wrapper, key pattern, playCount
- `GiftBox.jsx` — variants at module level, onTap dispatches, onAnimationComplete
- `SentenceRevealer.jsx` — sentence key pattern, fade-in variants
- `ConfettiFinale.jsx` — shared canvas, pointer-events: none, mobile particle count, confetti.reset()
- `PhotoGallery.jsx` — entrance animation variants, stagger children
- `BackgroundMusic.jsx` — eager Howl init, deferred play, replay reset
- `ReactionBar.jsx` — optimistic UI (instant update, rollback on failure)