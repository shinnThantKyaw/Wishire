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
 */
export default function SentenceRevealer({
  sentence,
  sentenceIndex,
  totalSentences = 1,
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

  useEffect(() => {
    chimeRef.current = new Howl({
      src: ["/assets/audio/chime.mp3"],
      volume: 0.4,
      onloaderror: () => { chimeRef.current = null; },
    });
    return () => { chimeRef.current = null; };
  }, []);

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
        if (chimeRef.current) chimeRef.current.play();
      }
    }, 50);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [sentence, reducedMotion]);

  const handleSkip = useCallback((e) => {
    e.stopPropagation();
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDisplayed(sentence);
    setIsComplete(true);
    if (chimeRef.current) chimeRef.current.play();
    onSkip?.();
  }, [sentence, onSkip]);

  const handleContinue = useCallback((e) => {
    e.stopPropagation();
    if (isComplete) onRevealed?.();
  }, [isComplete, onRevealed]);

  const variants = reducedMotion ? instantVariants : sentenceVariants;
  const isTyping = !isComplete && !reducedMotion;

  return (
    <div
      className="flex flex-col items-center gap-6 px-5 py-10 cursor-default min-h-[200px] justify-center max-w-[500px] mx-auto"
      onClick={isComplete ? handleContinue : undefined}
      role={isComplete ? "button" : undefined}
      tabIndex={isComplete ? 0 : undefined}
      onKeyDown={isComplete ? (e) => { if (e.key === "Enter" || e.key === " ") handleContinue(e); } : undefined}
      aria-label={isComplete ? (isLast ? "Continue" : "Next sentence") : undefined}
      style={isComplete ? { cursor: "pointer" } : undefined}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`sentence-${sentenceIndex}-${playCount}`}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <p className={`text-lg leading-[1.8] m-0 text-ink ${isLast ? "text-xl font-bold" : ""}`}>
            {displayed}
            {isTyping && (
              <motion.span
                className="inline-block ml-0.5 text-coral"
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

      {isTyping && (
        <button
          className="bg-transparent border border-border rounded-full px-4 py-2 text-xs font-bold text-ink/50 cursor-pointer hover:text-ink/80 hover:border-ink/30 transition-colors"
          onClick={handleSkip}
          aria-label="Skip typewriter animation"
        >
          Skip
        </button>
      )}

      {isComplete && !reducedMotion && (
        <motion.span
          className="text-xs font-bold text-ink/50"
          variants={hintVariants}
          initial="hidden"
          animate="visible"
        >
          {isLast ? "Tap to see the magic" : "Tap to continue"}
        </motion.span>
      )}

      <div className="flex gap-2 justify-center" aria-hidden="true">
        {Array.from({ length: totalSentences }, (_, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${i === sentenceIndex ? "bg-coral" : "bg-border"}`}
          />
        ))}
      </div>
    </div>
  );
}
