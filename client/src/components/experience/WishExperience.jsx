import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import confetti from "canvas-confetti";
import useReducedMotion from "../../hooks/useReducedMotion";
import FloatingSparkles from "./FloatingSparkles";
import PhotoSlideshow from "./PhotoSlideshow";
import LetterCard from "./LetterCard";
import ReplayButton from "./ReplayButton";

// Month names
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Zodiac Unicode symbols
const ZODIAC_SYMBOLS = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

// Relationship label for "Made with love" section
const RELATIONSHIP_LABELS = {
  partner: "Partner",
  friend: "Friend",
  family: "Family",
  coworker: "Coworker",
  other: null,
};

// --- Module-level variants (Rule 3) ---

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.25, delayChildren: 0.3 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 20 },
  },
};

const instantSectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0 },
  },
};

// Confetti canvas style (Rule 6: pointer-events: none)
const confettiCanvasStyle = {
  position: "fixed",
  inset: 0,
  pointerEvents: "none",
  zIndex: 9999,
};

/**
 * WishExperience — Page 2 celebration after gift box opens.
 * Shows header, flair info, made-with-love, photos, letter, thank-you, actions.
 *
 * Props:
 *   wish: object — full wish data
 *   sentences: string[]
 *   theme: { id, primary, secondary, surface }
 *   playCount: number — replay counter
 *   onReplay: () => void
 */
export default function WishExperience({
  wish,
  sentences,
  theme,
  playCount,
  onReplay,
}) {
  const reducedMotion = useReducedMotion();
  const canvasRef = useRef(null);
  const confettiRef = useRef(null);
  const hasPhotos = wish.photos && wish.photos.length > 0;
  const sV = reducedMotion ? instantSectionVariants : sectionVariants;

  const zodiacSymbol = wish.flair?.zodiacSign
    ? ZODIAC_SYMBOLS[wish.flair.zodiacSign] || ""
    : "";
  const monthName = MONTH_NAMES[(wish.birthMonth || 1) - 1];
  const relLabel = RELATIONSHIP_LABELS[wish.relationship] || null;

  // Fire confetti on mount (Rule 7: shared canvas, cleanup on unmount)
  useEffect(() => {
    if (!canvasRef.current) return;

    if (!confettiRef.current) {
      confettiRef.current = confetti.create(canvasRef.current, { resize: true });
    }

    const particleBase = reducedMotion ? 20 : 200;
    const particleSecond = reducedMotion ? 10 : 100;
    const spread = reducedMotion ? 30 : 60;
    const velocity = reducedMotion ? 20 : 55;
    const isMobile = window.innerWidth < 768;

    // First burst
    confettiRef.current({
      particleCount: isMobile ? Math.floor(particleBase * 0.4) : particleBase,
      spread: isMobile ? spread + 20 : spread,
      origin: { y: 0.7 },
      velocity,
      colors: [theme.primary, theme.secondary, "#ffb84d", "#2bb39c", "#4d96ff"],
    });

    // Second burst at 250ms
    const timer = setTimeout(() => {
      if (confettiRef.current) {
        confettiRef.current({
          particleCount: isMobile ? Math.floor(particleSecond * 0.4) : particleSecond,
          spread: isMobile ? 80 : 100,
          origin: { y: 0.6 },
          velocity: velocity * 0.6,
          colors: [theme.primary, theme.secondary, "#ffb84d"],
        });
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      confetti.reset();
    };
  }, [playCount, theme, reducedMotion]);

  return (
    <>
      {/* Floating sparkles background */}
      <FloatingSparkles primary={theme.primary} reducedMotion={reducedMotion} />

      {/* Confetti canvas (Rule 6: pointer-events: none) */}


      <motion.div
        className="wish-experience"
        key={`wish-experience-${playCount}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      ><canvas ref={canvasRef} style={confettiCanvasStyle} />
        {/* 1. Header */}
        <motion.div className="wish-experience__header-block" variants={sV}>
          <h1
            className="wish-experience__header"
            style={{ color: theme.primary }}
          >
            🎉 Happy Birthday, {wish.recipientName}! 🎂
          </h1>

          {/* Flair info */}
          <div className="wish-experience__flair-info">
            <p className="wish-experience__flair-line">
              ✨ {monthName} {wish.birthDay} • {wish.flair?.zodiacSign || ""} {zodiacSymbol}
            </p>
            {wish.flair?.birthstone && (
              <p className="wish-experience__flair-line">
                💎 Birthstone: {wish.flair.birthstone}
              </p>
            )}
            {wish.flair?.birthFlower && (
              <p className="wish-experience__flair-line">
                🌸 Birth flower: {wish.flair.birthFlower}
              </p>
            )}
          </div>

          {/* Made with love by */}
          <div className="wish-experience__made-with-love">
            <p className="wish-experience__made-label">Made with love by</p>
            <p
              className="wish-experience__made-name"
              style={{ color: theme.primary }}
            >
              ❤️ {wish.senderName}
            </p>
            {relLabel && (
              <p className="wish-experience__made-rel">
                (your {relLabel})
              </p>
            )}
          </div>
        </motion.div>

        {/* 2. Photo Slideshow */}
        {hasPhotos && (
          <motion.div className="wish-experience__section" variants={sV}>
            <div className="wish-experience__section-divider" aria-hidden="true" />
            <h2 className="wish-experience__section-title">📸 Photo Memories</h2>
            <PhotoSlideshow
              photos={wish.photos}
              playCount={playCount}
              onComplete={() => {}}
              recipientName={wish.recipientName}
              reducedMotion={reducedMotion}
              theme={theme}
            />
            <div className="wish-experience__section-divider" aria-hidden="true" />
          </motion.div>
        )}

        {/* 3. Letter Card */}
        <motion.div className="wish-experience__section" variants={sV}>
          {!hasPhotos && <div className="wish-experience__section-divider" aria-hidden="true" />}
          <LetterCard
            sentences={sentences}
            playCount={playCount}
            reducedMotion={reducedMotion}
            recipientName={wish.recipientName}
            senderName={wish.senderName}
          />
          <div className="wish-experience__section-divider" aria-hidden="true" />
        </motion.div>

        {/* 4. Thank you footer */}
        <motion.div className="wish-experience__thankyou" variants={sV}>
          <p className="wish-experience__thankyou-main">✨ Thank you for reading ✨</p>
          <p className="wish-experience__thankyou-text">
            May this year bring happiness,<br />
            beautiful memories,<br />
            and dreams come true ❤️
          </p>
          <p
            className="wish-experience__thankyou-birthday"
            style={{ color: theme.primary }}
          >
            🎂 Happy Birthday, {wish.recipientName}!
          </p>
        </motion.div>

        {/* 5. Actions */}
        <motion.div className="wish-experience__actions" variants={sV}>
          <ReplayButton onReplay={onReplay} reducedMotion={reducedMotion} />
          <Link to="/" className="wish-experience__make-btn">
            ✨ Make Your Own Wish
          </Link>
        </motion.div>

        {/* 6. Powered by */}
        <motion.p className="wish-experience__powered" variants={sV}>
          Powered by Wishire 🎁
        </motion.p>
      </motion.div>
    </>
  );
}
