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
      className="bg-mint text-white font-display font-bold text-lg px-8 py-3.5 rounded-full border-none cursor-pointer min-h-[44px] inline-flex items-center justify-center focus-visible:outline-2 focus-visible:outline-coral focus-visible:outline-offset-2"
      variants={variants}
      initial="hidden"
      animate="visible"
      whileHover={reducedMotion ? undefined : { scale: 1.05 }}
      whileTap={reducedMotion ? undefined : { scale: 0.95 }}
      onClick={onReplay}
      aria-label="Experience this wish again"
    >
      🔄 Experience Again
    </motion.button>
  );
}
