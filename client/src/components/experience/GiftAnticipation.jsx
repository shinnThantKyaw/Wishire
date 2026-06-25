import { motion } from "framer-motion";
import useReducedMotion from "../../hooks/useReducedMotion";
import GiftBox from "./GiftBox";
import FloatingSparkles from "./FloatingSparkles";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const ZODIAC_SYMBOLS = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

// --- Module-level variants (Rule 3) ---

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.18, delayChildren: 0.3 },
  },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 110, damping: 18 },
  },
};

const fadeScaleVariants = {
  hidden: { opacity: 0, scale: 0.75 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 14 },
  },
};

const instantVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0 } },
};

const ctaVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 120, damping: 16, delay: 0.6 },
  },
};

const chipVariants = {
  hidden: { opacity: 0, y: 6, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 140, damping: 18 },
  },
};

/**
 * GiftAnticipation — Premium single-viewport anticipation screen.
 *
 * Layout (visual hierarchy):
 *   1. Headline — warm, personal
 *   2. Gift Box — hero element, centered
 *   3. CTA Button — clear interactive prompt
 *   4. Sender attribution
 *   5. Metadata chips — elegant badges
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
  const cV = reducedMotion ? instantVariants : chipVariants;
  const ctaV = reducedMotion ? instantVariants : ctaVariants;

  const zodiacSymbol = wish.flair?.zodiacSign
    ? ZODIAC_SYMBOLS[wish.flair.zodiacSign] || ""
    : "";
  const monthName = MONTH_NAMES[(wish.birthMonth || 1) - 1];

  const primary = theme?.primary || "#a855f7";
  const secondary = theme?.secondary || "#d946ef";
  const recipientName = wish.recipientName || "you";

  // Generate background gradient from theme colors (matches landing page structure)
  const bgGradient = [
    `radial-gradient(ellipse 70% 55% at 20% 25%, ${primary}47 0%, transparent 55%)`,
    `radial-gradient(ellipse 60% 45% at 80% 70%, ${secondary}38 0%, transparent 50%)`,
    `radial-gradient(ellipse 50% 35% at 50% 45%, ${primary}1F 0%, transparent 55%)`,
    `linear-gradient(170deg, ${primary}30 0%, ${secondary}20 30%, ${primary}12 60%, #F8F0FE 100%)`,
  ].join(", ");

  return (
    <div
      className="gift-anticipation"
      style={{
        "--ga-primary": primary,
        "--ga-secondary": secondary,
        "--ga-surface": theme?.surface || "#faf5ff",
        background: bgGradient,
        backgroundSize: "200% 200%",
      }}
    >
      {/* Background atmosphere — soft ambient glows */}
      <div className="gift-anticipation__atmosphere" aria-hidden="true">
        <motion.div
          className="gift-anticipation__ambient-glow"
          style={{
            background: `radial-gradient(circle, ${primary} 0%, transparent 70%)`,
          }}
          animate={
            reducedMotion
              ? { opacity: 0.15 }
              : { opacity: [0.12, 0.28, 0.12], scale: [1, 1.08, 1] }
          }
          transition={
            reducedMotion
              ? { duration: 0 }
              : { duration: 5, repeat: Infinity, ease: "easeInOut" }
          }
        />
        <div
          className="gift-anticipation__ambient-glow gift-anticipation__ambient-glow--secondary"
          style={{
            background: `radial-gradient(circle, ${secondary} 0%, transparent 70%)`,
          }}
        />
      </div>

      <FloatingSparkles primary={primary} reducedMotion={reducedMotion} />

      <motion.div
        className="gift-anticipation__card"
        key={`anticipation-${playCount}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Headline — emotional, warm ── */}
        <motion.div className="gift-anticipation__headline" variants={fV}>
          <h1 className="gift-anticipation__title">
            Something special is waiting for you
          </h1>
          <p className="gift-anticipation__subtitle">
            Made with love, just for {recipientName}
          </p>
        </motion.div>

        {/* ── Gift box — the hero ── */}
        <motion.div className="gift-anticipation__box-stage" variants={fSV}>
          <GiftBox
            senderName={wish.senderName}
            theme={theme}
            onOpen={onGiftBoxOpen}
            playCount={playCount}
            reducedMotion={reducedMotion}
          />
        </motion.div>

        {/* ── CTA — premium gradient button ── */}
        <motion.div className="gift-anticipation__cta" variants={ctaV}>
          <motion.button
            className="gift-anticipation__cta-btn"
            onClick={onGiftBoxOpen}
            whileHover={reducedMotion ? {} : { scale: 1.04 }}
            whileTap={reducedMotion ? {} : { scale: 0.97 }}
            style={{
              "--cta-glow": `${primary}55`,
            }}
          >
            <span className="gift-anticipation__cta-icon">🎁</span>
            Open Your Gift
          </motion.button>
        </motion.div>

        {/* ── Sender — elegant attribution ── */}
        <motion.div className="gift-anticipation__sender" variants={fV}>
          <span className="gift-anticipation__sender-text">
            With love from
          </span>
          <span
            className="gift-anticipation__sender-name"
            style={{
              background: `linear-gradient(135deg, ${primary}, ${secondary})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {wish.senderName}
          </span>
        </motion.div>

        {/* ── Metadata chips — elegant info badges ── */}
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
