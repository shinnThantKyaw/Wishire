import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Howl } from "howler";

// --- Module-level variants (Rule 3) ---

const sentenceVariants = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 120, damping: 20 },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 },
  },
};

const instantVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0 } },
  exit: { opacity: 0, transition: { duration: 0 } },
};

const hintVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: [0, 0.6, 0.6, 0.3],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      repeatType: "reverse",
      delay: 0.5,
    },
  },
};

const cursorVariants = {
  blink: {
    opacity: [1, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatType: "reverse",
    },
  },
};

/**
 * SentenceRevealer -- typewriter text reveal with skip button and chime SFX.
 *
 * Props:
 *   sentence: string -- current sentence to reveal
 *   sentenceIndex: number -- index for key generation
 *   playCount: number -- replay counter for key generation
 *   isLast: boolean -- whether this is the last sentence
 *   onRevealed: () => void -- called when sentence fully revealed
 *   onSkip: () => void -- called when skip button pressed
 *   reducedMotion: boolean -- instant reveal if true
 */
export default function SentenceRevealer({
  sentence,
  sentenceIndex,
  playCount,
  isLast,
  onRevealed,
  onSkip,
  reducedMotion = false,
}) {
  const [displayed, setDisplayed] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const chimeRef = useRef(null);
  const intervalRef = useRef(null);

  // Initialize chime SFX
  useEffect(() => {
    chimeRef.current = new Howl({
      src: ["/assets/audio/chime.mp3"],
      volume: 0.4,
      onloaderror: () => {
        chimeRef.current = null;
      },
    });
    return () => {
      chimeRef.current = null;
    };
  }, []);

  // Typewriter effect or instant reveal
  useEffect(() => {
    if (!sentence) return;

    if (reducedMotion) {
      setDisplayed(sentence);
      setIsComplete(true);
      return;
    }

    let i = 0;
    setDisplayed("");
    setIsComplete(false);

    intervalRef.current = setInterval(() => {
      if (i < sentence.length) {
        setDisplayed(sentence.slice(0, i + 1));
        i++;
      } else {
        setIsComplete(true);
        clearInterval(intervalRef.current);
        // Play chime on completion
        if (chimeRef.current) {
          chimeRef.current.play();
        }
      }
    }, 50);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sentence, reducedMotion]);

  // Handle skip button
  const handleSkip = useCallback(
    (e) => {
      e.stopPropagation();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setDisplayed(sentence);
      setIsComplete(true);
      // Play chime on skip
      if (chimeRef.current) {
        chimeRef.current.play();
      }
      onSkip?.();
    },
    [sentence, onSkip]
  );

  const variants = reducedMotion ? instantVariants : sentenceVariants;
  const isTyping = !isComplete && !reducedMotion;

  return (
    <div className="sentence-revealer">
      <AnimatePresence mode="wait">
        <motion.div
          key={`sentence-${sentenceIndex}-${playCount}`}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <p
            className={`sentence-revealer__text ${isLast ? "sentence-revealer__text--final" : ""}`}
          >
            {displayed}
            {isTyping && (
              <motion.span
                className="sentence-revealer__cursor"
                variants={cursorVariants}
                animate="blink"
                aria-hidden="true"
              >
                |
              </motion.span>
            )}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Skip button -- only visible while typing */}
      {isTyping && (
        <button
          className="sentence-revealer__skip"
          onClick={handleSkip}
          aria-label="Skip typewriter animation"
        >
          Skip
        </button>
      )}

      {/* Tap to continue hint -- only after typing complete, not last sentence */}
      {isComplete && !isLast && !reducedMotion && (
        <motion.span
          className="sentence-revealer__hint"
          variants={hintVariants}
          initial="hidden"
          animate="visible"
        >
          Tap to continue
        </motion.span>
      )}

      {/* Progress dots */}
      <div className="sentence-revealer__progress" aria-hidden="true">
        <span
          className={`sentence-revealer__dot sentence-revealer__dot--active`}
        />
      </div>
    </div>
  );
}
