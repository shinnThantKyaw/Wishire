import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { RotateCcw, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import useReducedMotion from "../../hooks/useReducedMotion";
import FloatingSparkles from "./FloatingSparkles";
import PhotoSlideshow from "./PhotoSlideshow";
import LetterCard from "./LetterCard";

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
        {/* 1. Hero */}
        <motion.div className="wish-hero" variants={sV}>
          {/* Soft glow behind the title */}
          <div
            className="wish-hero__glow"
            aria-hidden="true"
            style={{
              background: `radial-gradient(circle, ${primary}30 0%, transparent 70%)`,
            }}
          />

          {/* 3D Illustrations */}
          <div className="wish-hero__illust" aria-hidden="true">
            <div className="wish-hero__cake">
              <span className="wish-hero__cake-emoji">🎂</span>
              <div className="wish-hero__cake-shadow" />
            </div>
            <div className="wish-hero__balloon">
              <span className="wish-hero__balloon-emoji">🎈</span>
              <div className="wish-hero__balloon-shadow" />
            </div>
            <div className="wish-hero__gift">
              <span className="wish-hero__gift-emoji">🎁</span>
              <div className="wish-hero__gift-shadow" />
            </div>
          </div>

          {/* Badge */}
          <div
            className="wish-hero__badge"
            style={{
              background: `linear-gradient(135deg, ${primary}20, ${secondary}20)`,
              borderColor: `${primary}30`,
            }}
          >
            <span className="wish-hero__badge-star">⭐</span>
            <span>It's Your Day!</span>
          </div>

          {/* Main heading */}
          <h1
            className="wish-hero__title"
            style={{
              background: `linear-gradient(135deg, ${primary}, ${secondary})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Happy Birthday, {wish.recipientName}!
          </h1>

          {/* Description */}
          <div className="wish-hero__desc">
            <p>Today is your moment to shine and be celebrated.</p>
            <p>You deserve all the happiness!</p>
            <p>A sweet surprise is waiting for you below.</p>
          </div>

          {/* Sender card */}
          <div
            className="wish-hero__card"
            style={{
              borderColor: `${primary}25`,
            }}
          >
            <p className="wish-hero__card-label">
              Sent with <span aria-hidden="true">❤️</span> by
            </p>
            {relLabel && (
              <p className="wish-hero__card-rel">Your {relLabel}</p>
            )}
            <p
              className="wish-hero__card-name"
              style={{
                background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {wish.senderName}
            </p>
          </div>

          {/* Info chips */}
          <div className="wish-hero__chips">
            <span
              className="wish-hero__chip"
              style={{ background: `${primary}12`, borderColor: `${primary}20` }}
            >
              🎂 {monthName} {wish.birthDay}
            </span>
            {wish.flair?.zodiacSign && (
              <span
                className="wish-hero__chip"
                style={{ background: `${primary}12`, borderColor: `${primary}20` }}
              >
                {zodiacSymbol} {wish.flair.zodiacSign}
              </span>
            )}
            {wish.flair?.birthstone && (
              <span
                className="wish-hero__chip"
                style={{ background: `${primary}12`, borderColor: `${primary}20` }}
              >
                💎 {wish.flair.birthstone}
              </span>
            )}
            {wish.flair?.birthFlower && (
              <span
                className="wish-hero__chip"
                style={{ background: `${primary}12`, borderColor: `${primary}20` }}
              >
                🌸 {wish.flair.birthFlower}
              </span>
            )}
          </div>

          {/* Scroll indicator */}
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

        {/* 4. Closing — gradient farewell */}
        <motion.div className="wish-closing" variants={sV}>
          <h2
            className="wish-closing__title"
            style={{
              background: `linear-gradient(135deg, ${primary}, ${secondary})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Wish you a very Happy Birthday!
          </h2>
          <p className="wish-closing__text">
            May this year bring happiness, beautiful memories, and all the love you deserve. You are truly special ❤️
          </p>
          <p
            className="wish-closing__from"
            style={{ color: primary }}
          >
            🎂 With love, {wish.senderName}
          </p>
        </motion.div>

        {/* 5. Actions — premium buttons */}
        <motion.div className="wish-closing__actions" variants={sV}>
          <motion.button
            className="wish-closing__btn wish-closing__btn--primary"
            onClick={onReplay}
            whileHover={reducedMotion ? {} : { scale: 1.04 }}
            whileTap={reducedMotion ? {} : { scale: 0.97 }}
            style={{
              background: `linear-gradient(135deg, ${primary}, ${secondary})`,
              boxShadow: `0 8px 28px ${primary}45, 0 3px 12px ${primary}30`,
            }}
          >
            <RotateCcw size={18} />
            <span>Experience Again</span>
          </motion.button>

          <Link to="/">
            <motion.span
              className="wish-closing__btn wish-closing__btn--secondary"
              whileHover={reducedMotion ? {} : { scale: 1.04 }}
              whileTap={reducedMotion ? {} : { scale: 0.97 }}
              style={{
                borderColor: `${primary}40`,
                color: primary,
              }}
            >
              <Sparkles size={18} />
              <span>Make Your Own Wish</span>
            </motion.span>
          </Link>
        </motion.div>

        {/* 6. Powered by */}
        <motion.div className="wish-closing__powered" variants={sV}>
          <span className="wish-closing__powered-line" />
          <Link to="/" className="wish-closing__powered-content">
            <span className="wish-closing__powered-text">Powered by</span>
            <img
              src="/assets/images/Icon.png"
              alt="Wishire"
              className="wish-closing__powered-logo"
              width={96}
              height={96}
            />
          </Link>
          <span className="wish-closing__powered-line" />
        </motion.div>
      </motion.div>
    </div>
  );
}
