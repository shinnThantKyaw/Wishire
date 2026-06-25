import { motion, AnimatePresence } from "framer-motion";
import useReducedMotion from "../../hooks/useReducedMotion";
import GiftAnticipation from "./GiftAnticipation";
import WishExperience from "./WishExperience";

// Status constants (mirror from WishPage)
const STATUS = {
  IDLE: "IDLE",
  GIFT_BOX: "GIFT_BOX",
  MAIN: "MAIN",
};

// --- Module-level variants (Rule 3) ---

const anticipationVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.4 },
  },
};

const mainVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5 } },
};

const instantVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0 } },
  exit: { opacity: 0, transition: { duration: 0 } },
};

/**
 * ExperienceOrchestrator — 2-phase AnimatePresence router.
 *
 * GIFT_BOX: Shows sparkles, relationship label, big gift box, birthday info.
 * MAIN: Shows celebration experience (header, flair, photos, letter, footer).
 *
 * Props:
 *   wish: object — full wish data
 *   sentences: string[]
 *   state: { status, playCount, isMusicPlaying }
 *   dispatch: (action) => void
 *   theme: { id, primary, secondary, surface }
 *   onGiftBoxOpen: () => void
 *   onReplay: () => void
 */
export default function ExperienceOrchestrator({
  wish,
  sentences,
  state,
  theme,
  onGiftBoxOpen,
  onReplay,
}) {
  const reducedMotion = useReducedMotion();
  const { status, playCount } = state;

  const antV = reducedMotion ? instantVariants : anticipationVariants;
  const mainV = reducedMotion ? instantVariants : mainVariants;

  return (
    <div className="experience">
      <AnimatePresence mode="wait">
        {status === STATUS.GIFT_BOX && (
          <motion.div
            key={`gift-box-${playCount}`}
            variants={antV}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <GiftAnticipation
              wish={wish}
              theme={theme}
              onGiftBoxOpen={onGiftBoxOpen}
              playCount={playCount}
            />
          </motion.div>
        )}

        {status === STATUS.MAIN && (
          <motion.div
            key={`main-${playCount}`}
            variants={mainV}
            initial="initial"
            animate="animate"
          >
            <WishExperience
              wish={wish}
              sentences={sentences}
              theme={theme}
              playCount={playCount}
              onReplay={onReplay}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
