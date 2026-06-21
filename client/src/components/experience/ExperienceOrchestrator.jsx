import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useReducedMotion from "../../hooks/useReducedMotion";
import GiftBox from "./GiftBox";
import SentenceRevealer from "./SentenceRevealer";
import ConfettiFinale from "./ConfettiFinale";
import PhotoGallery from "./PhotoGallery";
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

const happyBirthdayVariants = {
  initial: { opacity: 0, scale: 0.5 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 15, delay: 0.3 },
  },
};

const replayVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.5, type: "spring", stiffness: 150 },
  },
};

const instantVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0 } },
  exit: { opacity: 0, transition: { duration: 0 } },
};

/**
 * ExperienceOrchestrator — AnimatePresence router for the wish experience.
 * Renders components based on the state machine status from WishPage.
 *
 * Props:
 *   wish: object — full wish data
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

  const { status, sentenceIndex, playCount, photoIndex } = state;
  const isLastSentence = sentenceIndex === sentences.length - 1;
  const hasPhotos = wish.photos && wish.photos.length > 0;

  // Pick motion or instant variants based on user preference
  const senderV = reducedMotion ? instantVariants : senderVariants;
  const birthdayV = reducedMotion ? instantVariants : happyBirthdayVariants;
  const replayV = reducedMotion ? instantVariants : replayVariants;

  // Sentence tap handler
  const handleSentenceTap = useCallback(() => {
    if (isLastSentence) {
      dispatch({ type: "ALL_SENTENCES_DONE", hasPhotos });
    } else {
      dispatch({ type: "NEXT_SENTENCE" });
    }
  }, [isLastSentence, hasPhotos, dispatch]);

  // Confetti complete handler
  const handleConfettiComplete = useCallback(() => {
    if (hasPhotos) {
      dispatch({ type: "PHOTOS_DONE" });
    } else {
      dispatch({ type: "FINALE_DONE" });
    }
  }, [hasPhotos, dispatch]);

  return (
    <div className="experience">
      {/* Rule 1 + Rule 2: single AnimatePresence mode="wait" with playCount keys */}
      <AnimatePresence mode="wait">
        {/* GIFT_BOX phase — sender intro + gift box */}
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
            <h2 className="experience__sender-name" style={{ color: theme.primary }}>
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

        {/* UNWRAPPING phase — split animation playing */}
        {status === STATUS.UNWRAPPING && (
          <motion.div
            key={`unwrapping-${playCount}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* GiftBox handles its own animation and calls onOpened */}
          </motion.div>
        )}

        {/* REVEALING phase — sentence by sentence */}
        {status === STATUS.REVEALING && (
          <motion.div
            key={`sentences-${playCount}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SentenceRevealer
              sentences={sentences}
              currentIndex={sentenceIndex}
              onTap={handleSentenceTap}
              isLast={isLastSentence}
              playCount={playCount}
              reducedMotion={reducedMotion}
            />
          </motion.div>
        )}

        {/* FINALE phase — confetti + Happy Birthday! */}
        {status === STATUS.FINALE && (
          <motion.div
            key={`finale-${playCount}`}
            className="experience__finale"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.h1
              className="experience__happy-birthday"
              variants={birthdayV}
              initial="initial"
              animate="animate"
              style={{ color: theme.primary }}
            >
              Happy Birthday, {wish.recipientName}!
            </motion.h1>
            {wish.flair && <FlairChips flair={wish.flair} />}
            <ConfettiFinale
              playCount={playCount}
              onComplete={handleConfettiComplete}
              themeColors={[theme.primary, theme.secondary]}
            />
          </motion.div>
        )}

        {/* PHOTOS phase — gallery + replay */}
        {status === STATUS.PHOTOS && (
          <motion.div
            key={`photos-${playCount}`}
            className="experience__gallery-phase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.h1
              className="experience__happy-birthday experience__happy-birthday--small"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ color: theme.primary }}
            >
              Happy Birthday, {wish.recipientName}!
            </motion.h1>

            <PhotoGallery
              photos={wish.photos}
              recipientName={wish.recipientName}
            />

            {wish.flair && <FlairChips flair={wish.flair} />}

            <motion.button
              className="experience__replay-btn"
              variants={replayV}
              initial="hidden"
              animate="visible"
              whileHover={reducedMotion ? undefined : { scale: 1.05 }}
              whileTap={reducedMotion ? undefined : { scale: 0.95 }}
              onClick={onReplay}
            >
              Experience again
            </motion.button>
          </motion.div>
        )}

        {/* COMPLETE phase — replay option */}
        {status === STATUS.COMPLETE && (
          <motion.div
            key={`complete-${playCount}`}
            className="experience__gallery-phase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {wish.flair && <FlairChips flair={wish.flair} />}

            <motion.button
              className="experience__replay-btn"
              variants={replayV}
              initial="hidden"
              animate="visible"
              whileHover={reducedMotion ? undefined : { scale: 1.05 }}
              whileTap={reducedMotion ? undefined : { scale: 0.95 }}
              onClick={onReplay}
            >
              Experience again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
