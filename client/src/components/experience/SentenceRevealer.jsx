import { motion, AnimatePresence } from "framer-motion";

const sentenceVariants = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 },
  },
};

const hintVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: [0, 0.6, 0.6, 0.3],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      repeatType: "reverse",
      delay: 2,
    },
  },
};

// Instant variants for prefers-reduced-motion
const instantSentenceVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0 } },
  exit: { opacity: 0, transition: { duration: 0 } },
};

export default function SentenceRevealer({
  sentences,
  currentIndex,
  onTap,
  isLast,
  playCount,
  reducedMotion = false,
}) {
  const variants = reducedMotion ? instantSentenceVariants : sentenceVariants;

  return (
    <div className="sentence-revealer" onClick={onTap}>
      <AnimatePresence mode="wait">
        <motion.p
          key={`sentence-${currentIndex}-${playCount}`}
          className={`sentence-revealer__text ${isLast ? "sentence-revealer__text--final" : ""}`}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {sentences[currentIndex]}
        </motion.p>
      </AnimatePresence>

      {!isLast && !reducedMotion && (
        <motion.span
          className="sentence-revealer__hint"
          variants={hintVariants}
          initial="hidden"
          animate="visible"
        >
          tap to continue
        </motion.span>
      )}

      <div className="sentence-revealer__progress">
        {sentences.map((_, i) => (
          <span
            key={i}
            className={`sentence-revealer__dot ${
              i <= currentIndex ? "sentence-revealer__dot--active" : ""
            }`}
          />
        ))}
      </div>
    </div>
  );
}
