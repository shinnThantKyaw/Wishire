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

// --- Decorative emoji scattered around the card ---
const SCATTERED_EMOJI = [
  { emoji: "🌸", top: "-8%", left: "-6%", size: "2.8rem", rotate: -15 },
  { emoji: "🌹", bottom: "-6%", right: "-5%", size: "3.2rem", rotate: 12 },
  { emoji: "💮", top: "15%", right: "-4%", size: "2rem", rotate: -8 },
  { emoji: "🎀", top: "-5%", right: "10%", size: "2.2rem", rotate: 20 },
  { emoji: "💝", bottom: "10%", left: "-5%", size: "2rem", rotate: -10 },
];

// --- Floating hearts inside the card ---
const FLOATING_HEARTS = [
  { emoji: "💗", top: "20%", left: "15%", delay: 0, dur: 3.5 },
  { emoji: "💓", bottom: "25%", right: "12%", delay: 1.2, dur: 4 },
  { emoji: "✨", top: "40%", right: "8%", delay: 0.6, dur: 3.8 },
  { emoji: "💕", bottom: "35%", left: "10%", delay: 1.8, dur: 3.2 },
];

// --- Module-level variants (Rule 3) ---

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 110, damping: 18 },
  },
};

const fadeScaleVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 120, damping: 14 },
  },
};

const instantVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0 } },
};

const ctaBounceVariants = {
  animate: {
    y: [0, -5, 0],
    transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
  },
};

const instantCtaVariants = {
  animate: { y: 0 },
};

const chipVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 140, damping: 18 },
  },
};

const floatVariants = {
  animate: (custom) => ({
    y: [0, -12, 0],
    opacity: [0.25, 0.5, 0.25],
    transition: {
      duration: custom.dur,
      repeat: Infinity,
      ease: "easeInOut",
      delay: custom.delay,
    },
  }),
};

const instantFloatVariants = {
  animate: { opacity: 0.3 },
};

/**
 * GiftAnticipation — Single-viewport anticipation screen.
 *
 * Layout (top to bottom):
 *   Scattered emoji decorations (around card edges)
 *   Floating hearts (inside card)
 *   💌  envelope icon
 *   "{recipientName}, a surprise awaits!"
 *   "{senderName} prepared something special for you"
 *   [ HUGE GIFT BOX ]
 *   ✨ Tap To Open ✨  (CTA)
 *   ❤️ With love from {senderName}
 *   🎂 Month Day • Zodiac • Birthstone
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
  const ctaV = reducedMotion ? instantCtaVariants : ctaBounceVariants;
  const flV = reducedMotion ? instantFloatVariants : floatVariants;

  const zodiacSymbol = wish.flair?.zodiacSign
    ? ZODIAC_SYMBOLS[wish.flair.zodiacSign] || ""
    : "";
  const monthName = MONTH_NAMES[(wish.birthMonth || 1) - 1];

  const primary = theme?.primary || "#a855f7";
  const secondary = theme?.secondary || "#d946ef";
  const recipientName = wish.recipientName || "you";

  return (
    <div
      className="gift-anticipation"
      style={{
        "--ga-primary": primary,
        "--ga-secondary": secondary,
        "--ga-surface": theme?.surface || "#faf5ff",
      }}
    >
      {/* Background atmosphere */}
      <div className="gift-anticipation__atmosphere" aria-hidden="true">
        <motion.div
          className="gift-anticipation__ambient-glow"
          style={{
            background: `radial-gradient(circle, ${primary} 0%, transparent 70%)`,
          }}
          animate={
            reducedMotion
              ? { opacity: 0.2 }
              : { opacity: [0.15, 0.35, 0.15], scale: [1, 1.1, 1] }
          }
          transition={
            reducedMotion
              ? { duration: 0 }
              : { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }
        />
        <div
          className="gift-anticipation__ambient-glow gift-anticipation__ambient-glow--secondary"
          style={{
            background: `radial-gradient(circle, ${secondary} 0%, transparent 70%)`,
          }}
        />
      </div>

      <FloatingSparkles count={10} reducedMotion={reducedMotion} />

      <motion.div
        className="gift-anticipation__card"
        key={`anticipation-${playCount}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Scattered decorative emoji (outside card, positioned relative to it) ── */}
        {!reducedMotion &&
          SCATTERED_EMOJI.map((item, i) => (
            <motion.span
              key={i}
              className="gift-anticipation__deco"
              style={{
                top: item.top,
                bottom: item.bottom,
                left: item.left,
                right: item.right,
                fontSize: item.size,
                rotate: `${item.rotate}deg`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.5, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 14,
                delay: 0.4 + i * 0.12,
              }}
              aria-hidden="true"
            >
              {item.emoji}
            </motion.span>
          ))}

        {/* ── Floating hearts (inside card) ── */}
        {!reducedMotion &&
          FLOATING_HEARTS.map((item, i) => (
            <motion.span
              key={i}
              className="gift-anticipation__float"
              style={{
                top: item.top,
                bottom: item.bottom,
                left: item.left,
                right: item.right,
              }}
              custom={item}
              variants={flV}
              animate="animate"
              aria-hidden="true"
            >
              {item.emoji}
            </motion.span>
          ))}

        {/* ── Envelope icon ── */}
        <motion.span className="gift-anticipation__envelope" variants={fV}>
          💌
        </motion.span>

        {/* ── Headline — personal, warm ── */}
        <motion.div className="gift-anticipation__headline" variants={fV}>
          <h1 className="gift-anticipation__title">
            {recipientName}, a surprise awaits!
          </h1>
          <p className="gift-anticipation__subtitle">
            {wish.senderName} prepared something special just for you
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

        {/* ── CTA ── */}
        <motion.div className="gift-anticipation__cta" variants={fV}>
          <motion.span
            className="gift-anticipation__cta-text"
            variants={ctaV}
            animate="animate"
            style={{ color: primary }}
          >
            ✨ Tap To Open ✨
          </motion.span>
        </motion.div>

        {/* ── Sender — warm, personal ── */}
        <motion.div className="gift-anticipation__sender" variants={fV}>
          <span className="gift-anticipation__sender-heart">❤️</span>
          <span className="gift-anticipation__sender-text">
            With love from{" "}
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
          </span>
        </motion.div>

        {/* ── Metadata chips ── */}
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
