import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Howl } from "howler";
import useReducedMotion from "../../hooks/useReducedMotion";
import GiftBox from "./GiftBox";
import SentenceRevealer from "./SentenceRevealer";
import ConfettiFinale from "./ConfettiFinale";
import PhotoGallery from "./PhotoGallery";
import ReactionBar from "./ReactionBar";
import FlairChips from "./FlairChips";

// State machine phases
const PHASE = {
  SENDER_INTRO: "SENDER_INTRO",
  GIFT_BOX: "GIFT_BOX",
  SENTENCE: "SENTENCE",
  CONFETTI: "CONFETTI",
  GALLERY: "GALLERY",
};

// Module-level variants (Rule 3)
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

// Instant variants for prefers-reduced-motion — no movement, no springs
const instantVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0 } },
  exit: { opacity: 0, transition: { duration: 0 } },
};

export default function ExperienceOrchestrator({ wish }) {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState(PHASE.SENDER_INTRO);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [playCount, setPlayCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const musicRef = useRef(null);

  const sentences = wish.sentences || [];
  const isLastSentence = sentenceIndex === sentences.length - 1;

  // Pick motion or instant variants based on user preference
  const senderV = reducedMotion ? instantVariants : senderVariants;
  const birthdayV = reducedMotion ? instantVariants : happyBirthdayVariants;
  const replayV = reducedMotion ? instantVariants : replayVariants;

  // Initialize music on mount (eager Howl, deferred play - Rule 8)
  useEffect(() => {
    const musicSrc = "/audio/ambient.mp3";
    musicRef.current = new Howl({
      src: [musicSrc],
      loop: true,
      volume: 0.3,
      preload: true,
      html5: true,
      onloaderror: () => {
        // Graceful fallback — experience works without music
        musicRef.current = null;
      },
    });

    return () => {
      if (musicRef.current) {
        musicRef.current.unload();
        musicRef.current = null;
      }
    };
  }, []);

  // Auto-advance from sender intro to gift box
  useEffect(() => {
    if (phase === PHASE.SENDER_INTRO) {
      const delay = reducedMotion ? 500 : 2500;
      const timer = setTimeout(() => setPhase(PHASE.GIFT_BOX), delay);
      return () => clearTimeout(timer);
    }
  }, [phase, reducedMotion]);

  // Start music on gift box open (Pitfall 8 — user gesture unlocks AudioContext)
  const handleGiftBoxOpen = useCallback(() => {
    if (musicRef.current) {
      musicRef.current.play();
    }
    setPhase(PHASE.SENTENCE);
  }, []);

  const handleSentenceTap = useCallback(() => {
    if (isLastSentence) {
      if (reducedMotion) {
        // Skip confetti — go straight to gallery
        setPhase(PHASE.GALLERY);
      } else {
        setPhase(PHASE.CONFETTI);
        setShowConfetti(true);
      }
    } else {
      setSentenceIndex((i) => i + 1);
    }
  }, [isLastSentence, reducedMotion]);

  const handleConfettiComplete = useCallback(() => {
    setPhase(PHASE.GALLERY);
    setShowConfetti(false);
  }, []);

  const handleReplay = useCallback(() => {
    setPlayCount((c) => c + 1);
    setSentenceIndex(0);
    setShowConfetti(false);
    setPhase(PHASE.GIFT_BOX);

    // Reset music to beginning (audio context already unlocked from first tap)
    if (musicRef.current) {
      musicRef.current.seek(0);
      musicRef.current.play();
    }
  }, []);

  return (
    <div className="experience">
      <AnimatePresence mode="wait">
        {/* Sender intro */}
        {phase === PHASE.SENDER_INTRO && (
          <motion.div
            key={`sender-intro-${playCount}`}
            className="experience__sender"
            variants={senderV}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <p className="experience__from-label">A birthday wish from</p>
            <h2 className="experience__sender-name">{wish.senderName}</h2>
          </motion.div>
        )}

        {/* Gift box */}
        {phase === PHASE.GIFT_BOX && (
          <GiftBox
            key={`giftbox-${playCount}`}
            onOpen={handleGiftBoxOpen}
            playCount={playCount}
          />
        )}

        {/* Sentence reveal */}
        {phase === PHASE.SENTENCE && (
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

        {/* Confetti + Happy Birthday */}
        {phase === PHASE.CONFETTI && (
          <motion.div
            key={`confetti-${playCount}`}
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
            >
              Happy Birthday, {wish.recipientName}!
            </motion.h1>
            <FlairChips flair={wish.flair} />
          </motion.div>
        )}

        {/* Gallery + Reactions */}
        {phase === PHASE.GALLERY && (
          <motion.div
            key={`gallery-${playCount}`}
            className="experience__gallery-phase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.h1
              className="experience__happy-birthday experience__happy-birthday--small"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Happy Birthday, {wish.recipientName}!
            </motion.h1>

            <PhotoGallery
              photos={wish.photos}
              recipientName={wish.recipientName}
            />

            <FlairChips flair={wish.flair} />

            <ReactionBar wishId={wish.id} />

            <motion.button
              className="experience__replay-btn"
              variants={replayV}
              initial="hidden"
              animate="visible"
              whileHover={reducedMotion ? undefined : { scale: 1.05 }}
              whileTap={reducedMotion ? undefined : { scale: 0.95 }}
              onClick={handleReplay}
            >
              Replay Experience
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti overlay — renders on top of everything */}
      {showConfetti && (
        <ConfettiFinale
          playCount={playCount}
          onComplete={handleConfettiComplete}
        />
      )}
    </div>
  );
}
