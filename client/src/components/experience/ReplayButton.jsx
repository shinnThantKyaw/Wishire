import { motion } from "framer-motion";

// --- Module-level variants (Rule 3) ---

const buttonVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.3, type: "spring", stiffness: 150 },
  },
};

const instantVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0 } },
};

/**
 * ReplayButton -- full replay trigger button.
 *
 * Props:
 *   onReplay: () => void
 *   reducedMotion: boolean
 */
export default function ReplayButton({ onReplay, reducedMotion = false }) {
  const variants = reducedMotion ? instantVariants : buttonVariants;

  return (
    <motion.button
      className="replay-btn"
      variants={variants}
      initial="hidden"
      animate="visible"
      whileHover={reducedMotion ? undefined : { scale: 1.05 }}
      whileTap={reducedMotion ? undefined : { scale: 0.95 }}
      onClick={onReplay}
      aria-label="Experience this wish again"
    >
      Experience again
    </motion.button>
  );
}
