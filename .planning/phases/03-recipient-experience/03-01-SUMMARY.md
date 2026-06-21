---
phase: 03-recipient-experience
plan: 01
subsystem: ui
tags: [react, framer-motion, howler, state-machine, useReducer]

requires:
  - phase: 01-foundation
    provides: "Express API with GET /api/wish/:id endpoint"
  - phase: 02-creator-flow
    provides: "THEMES constant, photo upload, create flow"
provides:
  - WishPage with useReducer state machine (IDLE -> GIFT_BOX -> UNWRAPPING -> REVEALING -> PHOTOS -> FINALE -> COMPLETE)
  - GiftBox component with CSS/SVG split animation, particles, sender name
  - AudioController pause/resume button (44x44px touch target)
  - ErrorState component with 404 vs network error handling
  - ExperienceOrchestrator refactored to receive state from WishPage
affects: [03-recipient-experience-plan-02]

tech-stack:
  added: []
  patterns: ["useReducer state machine for animation phases", "onAnimationComplete for state dispatch", "Module-level Framer Motion variants", "Eager Howl deferred play for mobile AudioContext"]

key-files:
  created:
    - "client/src/components/experience/AudioController.jsx"
    - "client/src/components/experience/ErrorState.jsx"
  modified:
    - "client/src/pages/WishPage.jsx"
    - "client/src/components/experience/GiftBox.jsx"
    - "client/src/components/experience/ExperienceOrchestrator.jsx"
    - "client/src/index.css"

key-decisions:
  - "WishPage owns the useReducer state machine; ExperienceOrchestrator receives state+dispatch as props"
  - "GiftBox separates onOpen (tap triggers music/SFX) from onOpened (animation complete advances state)"
  - "ErrorState uses string codes (not_found/network) for different error copy"
  - "AudioController uses inline SVG icons for pause/play instead of emoji"

patterns-established:
  - "State machine reducer at module level in WishPage with STATUS constants"
  - "Module-level Framer Motion variants (Rule 3) in all animation components"
  - "onAnimationComplete for state machine transitions (Rule 4), never setTimeout"
  - "playCount in all AnimatePresence keys (Rule 1+5) for replay support"
  - "Eager Howl creation with deferred .play() for mobile AudioContext unlock (Rule 8)"

requirements-completed: [PAGE-01, PAGE-02, PAGE-07]

duration: 12min
completed: 2026-06-21
status: complete
---

# Phase 3 Plan 01: Recipient Experience Foundation Summary

**WishPage useReducer state machine with GiftBox split animation, particle burst, audio controller, and error states**

## Performance

- **Duration:** 12 min
- **Started:** 2026-06-21T10:00:00Z
- **Completed:** 2026-06-21T10:12:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Rewrote WishPage with useReducer state machine driving the entire recipient experience flow
- Created GiftBox with CSS/SVG split animation (lid y:-60, rotateX:-45 over 1s), 18 theme-colored particles, and sender name display
- Built AudioController with 44x44px pause/resume toggle using SVG icons
- Created ErrorState with distinct copy for 404 ("This wish doesn't exist") vs network errors
- Refactored ExperienceOrchestrator to receive state+dispatch from WishPage (no internal state machine)

## Task Commits

Each task was committed atomically:

1. **Task 1: WishPage with state machine, API integration, and error states** - `41ad620` (feat)
2. **Task 2: GiftBox split animation with particles and audio controller** - `73bacbe` (feat)

## Files Created/Modified
- `client/src/pages/WishPage.jsx` — Rewritten: useReducer state machine, fetch wish data, Howl audio init, theme application
- `client/src/components/experience/ErrorState.jsx` — Created: error display with retry button (44px touch target)
- `client/src/components/experience/GiftBox.jsx` — Rewritten: CSS split animation, 18 particles, sender name, onAnimationComplete
- `client/src/components/experience/AudioController.jsx` — Created: pause/resume SVG button (44x44px, fixed top-right)
- `client/src/components/experience/ExperienceOrchestrator.jsx` — Refactored: receives state from WishPage, no internal state
- `client/src/index.css` — Added: error-state, audio-controller, gift-box__sender, particle-burst classes

## Decisions Made
- WishPage owns the state machine; ExperienceOrchestrator is a stateless router receiving state+dispatch props
- GiftBox separates onOpen (tap -> music + SFX) from onOpened (lid animation complete -> BOX_OPENED)
- Audio uses inline SVG icons instead of emoji for pause/play (better accessibility, consistent rendering)
- Particles use CSS @keyframes with CSS custom properties (--tx, --ty) for random burst directions

## Deviations from Plan

None - plan executed exactly as specified.

## Issues Encountered
None

## Next Phase Readiness
- State machine, gift box, audio controller, and error states all in place
- Ready for plan 03-02: sentence revealer, photo slideshow, confetti finale, replay
- Existing SentenceRevealer, PhotoGallery, ConfettiFinale components need prop signature updates to match new state machine pattern

---
*Phase: 03-recipient-experience*
*Completed: 2026-06-21*
