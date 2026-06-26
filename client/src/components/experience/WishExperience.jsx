import { useEffect } from "react";
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
  const hasPhotos = wish.photos && wish.photos.length > 0;
  const sV = reducedMotion ? instantSectionVariants : sectionVariants;

  const zodiacSymbol = wish.flair?.zodiacSign
    ? ZODIAC_SYMBOLS[wish.flair.zodiacSign] || ""
    : "";
  const monthName = MONTH_NAMES[(wish.birthMonth || 1) - 1];
  const relLabel = RELATIONSHIP_LABELS[wish.relationship] || null;

  // Same gradient background as GiftAnticipation
  const primary = theme.primary || "#a855f7";
  const secondary = theme.secondary || "#d946ef";
  const bgGradient = [
    `radial-gradient(ellipse 70% 55% at 20% 25%, ${primary}47 0%, transparent 55%)`,
    `radial-gradient(ellipse 60% 45% at 80% 70%, ${secondary}38 0%, transparent 50%)`,
    `radial-gradient(ellipse 50% 35% at 50% 45%, ${primary}1F 0%, transparent 55%)`,
    `linear-gradient(170deg, ${primary}30 0%, ${secondary}20 30%, ${primary}12 60%, #F8F0FE 100%)`,
  ].join(", ");

  // Fire confetti on mount — multiple bursts across the full screen for ~3s
  useEffect(() => {
    const colors = [theme.primary, theme.secondary, "#ffb84d", "#2bb39c", "#4d96ff"];
    const isMobile = window.innerWidth < 768;
    const scale = reducedMotion ? 0.15 : 1;
    const base = isMobile ? 60 : 150;

    const burst = (opts) => confetti({
      particleCount: Math.floor((opts.count || base) * scale),
      spread: opts.spread || 70,
      startVelocity: opts.velocity || 45,
      origin: { x: opts.x, y: opts.y || 0.5 },
      colors,
      gravity: 0.8,
      ticks: 300,
    });

    // 0ms — center burst
    burst({ x: 0.5, y: 0.6, count: base, spread: 70 });

    // 200ms — left side
    const t1 = setTimeout(() => burst({ x: 0.2, y: 0.5, count: base * 0.7, spread: 60, velocity: 40 }), 200);

    // 400ms — right side
    const t2 = setTimeout(() => burst({ x: 0.8, y: 0.5, count: base * 0.7, spread: 60, velocity: 40 }), 400);

    // 800ms — top center rain
    const t3 = setTimeout(() => burst({ x: 0.5, y: 0.3, count: base * 0.5, spread: 120, velocity: 30 }), 800);

    // 1400ms — bottom-left fan
    const t4 = setTimeout(() => burst({ x: 0.15, y: 0.7, count: base * 0.5, spread: 50, velocity: 35 }), 1400);

    // 1800ms — bottom-right fan
    const t5 = setTimeout(() => burst({ x: 0.85, y: 0.7, count: base * 0.5, spread: 50, velocity: 35 }), 1800);

    // 2400ms — final center shower
    const t6 = setTimeout(() => burst({ x: 0.5, y: 0.4, count: base * 0.8, spread: 100, velocity: 25 }), 2400);

    return () => {
      [t1, t2, t3, t4, t5, t6].forEach(clearTimeout);
      confetti.reset();
    };
  }, [playCount, theme, reducedMotion]);

  return (
    <div
      style={{
        background: bgGradient,
        backgroundSize: "200% 200%",
        minHeight: "100vh",
      }}
    >
      {/* Floating sparkles background */}
      <FloatingSparkles primary={theme.primary} reducedMotion={reducedMotion} />

      <motion.div
        className="wish-experience"
        key={`wish-experience-${playCount}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 1. Hero — cardless, floating on background */}
        <motion.div className="wish-hero" variants={sV}>
          {/* Soft glow behind the title */}
          <div
            className="wish-hero__glow"
            aria-hidden="true"
            style={{
              background: `radial-gradient(circle, ${primary}35 0%, transparent 70%)`,
            }}
          />

          {/* Main title — strongest visual element */}
          <h1
            className="wish-hero__title"
            style={{
              background: `linear-gradient(135deg, ${primary}, ${secondary})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            🎉 Happy Birthday, {wish.recipientName}! 🎂
          </h1>

          {/* Emotional subtitle */}
          <p className="wish-hero__subtitle">
            Today is all about celebrating you ❤️
          </p>

          {/* Anticipation teaser */}
          <p className="wish-hero__teaser">
            A special surprise made just for you awaits below...
          </p>

          {/* Decorative sparkle divider */}
          <p className="wish-hero__sparkle-divider" aria-hidden="true">
            ✨ ✨ ✨
          </p>

          {/* Sender — second strongest element */}
          <div className="wish-hero__sender">
            <span className="wish-hero__sender-label">Sent with    {/* Heart badge */}
              <span className="footer__heart inline-block" aria-hidden="true">❤️</span> by</span>
            <div className="wish-hero__sender-row">

              {relLabel && (
                  <span className="wish-hero__sender-rel">Your {relLabel}</span>
              )}<span
                className="wish-hero__sender-name"
                style={{
                  background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {wish.senderName}
              </span>

            </div>

          </div>

          {/* Flair info — subtle, below sender */}
          <div className="wish-hero__flair">
            <span className="wish-hero__flair-chip">
              ✨ {monthName} {wish.birthDay} • {wish.flair?.zodiacSign || ""} {zodiacSymbol}
            </span>
            {wish.flair?.birthstone && (
              <span className="wish-hero__flair-chip">
                💎 {wish.flair.birthstone}
              </span>
            )}
            {wish.flair?.birthFlower && (
              <span className="wish-hero__flair-chip">
                🌸 {wish.flair.birthFlower}
              </span>
            )}
          </div>

          {/* Animated scroll indicator */}
          <div className="wish-hero__scroll" aria-hidden="true">
            <div className="wish-hero__scroll-mouse">
              <div className="wish-hero__scroll-dot" />
            </div>
          </div>
        </motion.div>

        {/* 2. Photo Memories — emotional framing + carousel */}
        {hasPhotos && (
          <motion.div className="wish-photos" variants={sV}>
            {/* Emotional intro */}
            <div className="wish-photos__intro">
              <h2
                className="wish-photos__title"
                style={{
                  background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                📸 Our Memories Together
              </h2>
              <p className="wish-photos__subtitle">
                Some moments are too beautiful to forget.
              </p>
              <p className="wish-photos__caption">
                A collection of memories shared between {wish.senderName} &amp; {wish.recipientName} ❤️
              </p>
            </div>

            <PhotoSlideshow
              photos={wish.photos}
              playCount={playCount}
              onComplete={() => {}}
              recipientName={wish.recipientName}
              reducedMotion={reducedMotion}
              theme={theme}
            />
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
            theme={theme}
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
    </div>
  );
}
