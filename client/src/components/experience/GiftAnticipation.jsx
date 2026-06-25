import { motion } from "framer-motion";
import useReducedMotion from "../../hooks/useReducedMotion";
import GiftBox from "./GiftBox";
import FloatingSparkles from "./FloatingSparkles";

// Month names for birthday display
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

// --- Module-level variants (Rule 3) ---

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 18 },
  },
};

const fadeScaleVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 120, damping: 16 },
  },
};

const instantVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0 } },
};

const breatheVariants = {
  animate: {
    scale: [1, 1.025, 1],
    y: [0, -6, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
};

const instantBreatheVariants = {
  animate: { scale: 1, y: 0 },
};

const glowPulseVariants = {
  animate: {
    opacity: [0.25, 0.5, 0.25],
    scale: [1, 1.1, 1],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
};

const chipVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 140, damping: 18 },
  },
};

/**
 * GiftAnticipation — Anticipation screen before the gift box opens.
 *
 * Hierarchy:
 *   1. Emotional headline
 *   2. Gift box (hero)
 *   3. Sender attribution
 *   4. Decorative metadata chips
 *
 * Props:
 *   wish: object — full wish data
 *   theme: { id, primary, secondary, surface }
 *   onGiftBoxOpen: () => void
 *   playCount: number
 */
export default function GiftAnticipation({
  wish,
  theme,
  onGiftBoxOpen,
  playCount,
}) {
  const reducedMotion = useReducedMotion();
  const fV = reducedMotion ? instantVariants : fadeUpVariants;
  const fSV = reducedMotion ? instantVariants : fadeScaleVariants;
  const bV = reducedMotion ? instantBreatheVariants : breatheVariants;
  const gV = reducedMotion ? { animate: { opacity: 0.3 } } : glowPulseVariants;
  const cV = reducedMotion ? instantVariants : chipVariants;

  const zodiacSymbol = wish.flair?.zodiacSign
    ? ZODIAC_SYMBOLS[wish.flair.zodiacSign] || ""
    : "";
  const monthName = MONTH_NAMES[(wish.birthMonth || 1) - 1];

  // Theme-driven CSS custom properties for the atmosphere
  const ambientStyle = {
    "--anticipation-primary": theme?.primary || "#a855f7",
    "--anticipation-secondary": theme?.secondary || "#d946ef",
  };

  return (
    <div className="gift-anticipation" style={ambientStyle}>
      {/* Background atmosphere — soft radial glows */}
      <div className="gift-anticipation__atmosphere" aria-hidden="true">
        <motion.div
          className="gift-anticipation__ambient-glow"
          variants={gV}
          animate="animate"
        />
        <div className="gift-anticipation__ambient-glow gift-anticipation__ambient-glow--secondary" />
      </div>

      <FloatingSparkles count={14} reducedMotion={reducedMotion} />

      <motion.div
        className="gift-anticipation__content"
        key={`anticipation-${playCount}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── 1. Emotional headline ── */}
        <motion.div className="gift-anticipation__headline" variants={fV}>
          <h1 className="gift-anticipation__title">
            A Surprise Awaits
          </h1>
          <p className="gift-anticipation__subtitle">
            Someone special made this just for you
          </p>
        </motion.div>

        {/* ── 2. Gift box — the hero ── */}
        <motion.div
          className="gift-anticipation__box-stage"
          variants={fSV}
        >
          <motion.div
            className="gift-anticipation__box-breathing"
            variants={bV}
            animate="animate"
          >
            <GiftBox
              senderName={wish.senderName}
              theme={theme}
              onOpen={onGiftBoxOpen}
              playCount={playCount}
              reducedMotion={reducedMotion}
            />
          </motion.div>
        </motion.div>

        {/* ── 3. Sender attribution ── */}
        <motion.div className="gift-anticipation__sender" variants={fV}>
          <span className="gift-anticipation__sender-label">Made with love by</span>
          <span className="gift-anticipation__sender-name">
            {wish.senderName}
          </span>
        </motion.div>

        {/* ── 4. Decorative metadata chips ── */}
        <motion.div className="gift-anticipation__meta" variants={fV}>
          <motion.span className="gift-anticipation__chip" variants={cV}>
            🎂 {monthName} {wish.birthDay}
          </motion.span>
          {wish.flair?.zodiacSign && (
            <motion.span className="gift-anticipation__chip" variants={cV}>
              {zodiacSymbol} {wish.flair.zodiacSign}
            </motion.span>
          )}
          {wish.flair?.birthstone && (
            <motion.span className="gift-anticipation__chip" variants={cV}>
              💎 {wish.flair.birthstone}
            </motion.span>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
