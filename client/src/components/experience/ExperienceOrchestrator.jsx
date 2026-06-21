import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useReducedMotion from "../../hooks/useReducedMotion";
import GiftBox from "./GiftBox";
import SentenceRevealer from "./SentenceRevealer";
import PhotoSlideshow from "./PhotoSlideshow";
import ConfettiFinale from "./ConfettiFinale";
import ReplayButton from "./ReplayButton";
import FlairChips from "./FlairChips";

// Status constants (mirror from WishPage)
const STATUS = {
  IDLE: "IDLE",
  GIFT_BOX: "GIFT_BOX",
  UNWRAPPING: "UNWRAPPING",
  REVEALING: "REVEALING",
  PHOTOS: "PHOTOS",
  FINALE: "FINALE",
  COMPLETE: "COMPLETE",
};

// --- Module-level variants (Rule 3) ---

const senderVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.4 },
  },
};

const phaseVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const instantVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0 } },
  exit: { opacity: 0, transition: { duration: 0 } },
};

const replayVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.5, type: "spring", stiffness: 150 },
  },
};

/**
 * ExperienceOrchestrator -- AnimatePresence router for the wish experience.
 * Renders the correct component per state machine status from WishPage.
 *
 * Props:
 *   wish: object -- full wish data
 *   sentences: string[]
 *   state: { status, sentenceIndex, playCount, photoIndex, isTyping, isMusicPlaying }
 *   dispatch: (action) => void
 *   theme: { id, primary, secondary, surface }
 *   onGiftBoxOpen: () => void
 *   onBoxOpened: () => void
 *   onReplay: () => void
 */
export default function ExperienceOrchestrator({
  wish,
  sentences,
  state,
  dispatch,
  theme,
  onGiftBoxOpen,
  onBoxOpened,
  onReplay,
}) {
  const reducedMotion = useReducedMotion();

  const { status, sentenceIndex, playCount } = state;
  const isLastSentence = sentenceIndex === sentences.length - 1;
  const hasPhotos = wish.photos && wish.photos.length > 0;

  // Pick motion or instant variants based on user preference
  const senderV = reducedMotion ? instantVariants : senderVariants;
  const phaseV = reducedMotion ? instantVariants : phaseVariants;
  const replayV = reducedMotion ? instantVariants : replayVariants;

  // Sentence revealed handler -- advance to next or finish
  const handleSentenceRevealed = useCallback(() => {
    if (isLastSentence) {
      dispatch({ type: "ALL_SENTENCES_DONE", hasPhotos });
    } else {
      dispatch({ type: "NEXT_SENTENCE" });
    }
  }, [isLastSentence, hasPhotos, dispatch]);

  // Sentence skip handler
  const handleSentenceSkip = useCallback(() => {
    dispatch({ type: "SKIP_TYPING" });
  }, [dispatch]);

  // Photo slideshow complete handler
  const handlePhotosComplete = useCallback(() => {
    dispatch({ type: "START_FINALE" });
  }, [dispatch]);

  // Confetti complete handler
  const handleConfettiComplete = useCallback(() => {
    dispatch({ type: "FINALE_DONE" });
  }, [dispatch]);

  return (
    <div className="experience">
      {/* Rule 1 + Rule 2: single AnimatePresence mode="wait" with playCount keys */}
      <AnimatePresence mode="wait">
        {/* GIFT_BOX phase -- sender intro + gift box */}
        {status === STATUS.GIFT_BOX && (
          <motion.div
            key={`gift-box-${playCount}`}
            className="experience__sender"
            variants={senderV}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <p className="experience__from-label">A birthday wish from</p>
            <h2
              className="experience__sender-name"
              style={{ color: theme.primary }}
            >
              {wish.senderName}
            </h2>
            <GiftBox
              senderName={wish.senderName}
              theme={theme}
              onOpen={onGiftBoxOpen}
              onOpened={onBoxOpened}
              playCount={playCount}
              reducedMotion={reducedMotion}
            />
          </motion.div>
        )}

        {/* UNWRAPPING phase -- split animation playing (handled by GiftBox) */}
        {status === STATUS.UNWRAPPING && (
          <motion.div
            key={`unwrapping-${playCount}`}
            variants={phaseV}
            initial="initial"
            animate="animate"
            exit="exit"
          />
        )}

        {/* REVEALING phase -- sentence by sentence typewriter */}
        {status === STATUS.REVEALING && (
          <motion.div
            key={`sentence-${sentenceIndex}-${playCount}`}
            variants={phaseV}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <SentenceRevealer
              sentence={sentences[sentenceIndex]}
              sentenceIndex={sentenceIndex}
              playCount={playCount}
              isLast={isLastSentence}
              onRevealed={handleSentenceRevealed}
              onSkip={handleSentenceSkip}
              reducedMotion={reducedMotion}
            />
          </motion.div>
        )}

        {/* PHOTOS phase -- auto-advancing slideshow */}
        {status === STATUS.PHOTOS && (
          <motion.div
            key={`photos-${playCount}`}
            className="experience__photos-phase"
            variants={phaseV}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <PhotoSlideshow
              photos={wish.photos}
              playCount={playCount}
              onComplete={handlePhotosComplete}
              recipientName={wish.recipientName}
              reducedMotion={reducedMotion}
            />
          </motion.div>
        )}

        {/* FINALE phase -- confetti + Happy Birthday! */}
        {status === STATUS.FINALE && (
          <motion.div
            key={`finale-${playCount}`}
            className="experience__finale"
            variants={phaseV}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <ConfettiFinale
              recipientName={wish.recipientName}
              theme={theme}
              playCount={playCount}
              onComplete={handleConfettiComplete}
              reducedMotion={reducedMotion}
            />
            {wish.flair && <FlairChips flair={wish.flair} />}
          </motion.div>
        )}

        {/* COMPLETE phase -- replay option */}
        {status === STATUS.COMPLETE && (
          <motion.div
            key={`complete-${playCount}`}
            className="experience__gallery-phase"
            variants={phaseV}
            initial="initial"
            animate="animate"
          >
            {wish.flair && <FlairChips flair={wish.flair} />}

            <ReplayButton
              onReplay={onReplay}
              reducedMotion={reducedMotion}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
