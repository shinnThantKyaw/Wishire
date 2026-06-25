import { useState, useCallback } from "react";
import { motion } from "framer-motion";

// --- Module-level variants (Rule 3) ---

const giftBoxContainerVariants = {
  initial: { scale: 0.6, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 150, damping: 18, duration: 0.8 },
  },
};

const lidVariants = {
  closed: { y: 0, rotateX: 0 },
  open: {
    y: -80,
    rotateX: -50,
    transition: { duration: 1, ease: "easeOut" },
  },
};

const glowVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: [0, 0.6, 0.35],
    scale: [0.5, 1.4, 1.2],
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const ringVariants = {
  animate: {
    opacity: [0.15, 0.35, 0.15],
    scale: [1, 1.04, 1],
    transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
  },
};

const instantVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0 } },
  closed: { y: 0 },
  open: { y: -80, transition: { duration: 0 } },
};

// --- Particle generation ---

function generateParticles(themePrimary, themeSecondary) {
  const particles = [];
  const count = 24;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const distance = 80 + Math.random() * 100;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - 20; // bias upward
    const size = 5 + Math.random() * 8;
    const color = i % 3 === 0 ? themePrimary : i % 3 === 1 ? themeSecondary : "#fff";
    const delay = Math.random() * 0.3;
    const emoji = i % 7 === 0 ? "✨" : null;

    particles.push({
      id: i,
      emoji,
      style: {
        "--tx": `${tx}px`,
        "--ty": `${ty}px`,
        width: emoji ? "12px" : `${size}px`,
        height: emoji ? "12px" : `${size}px`,
        backgroundColor: emoji ? "transparent" : color,
        animationDelay: `${delay}s`,
      },
    });
  }
  return particles;
}

/**
 * GiftBox — Hero gift box with enhanced animations.
 *
 * Props:
 *   senderName: string — used for aria-label only
 *   theme: { id, primary, secondary, surface }
 *   onOpen: () => void — called on tap (triggers music + SFX + state transition)
 *   playCount: number
 *   reducedMotion: boolean
 */
export default function GiftBox({
  senderName,
  theme,
  onOpen,
  playCount = 0,
  reducedMotion = false,
}) {
  const [opened, setOpened] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  const primary = theme?.primary || "#a855f7";
  const secondary = theme?.secondary || "#d946ef";

  // Pick variants based on motion preference
  const lidV = reducedMotion ? instantVariants : lidVariants;
  const containerV = reducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0 } } }
    : giftBoxContainerVariants;
  const glowV = reducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 0.3, transition: { duration: 0 } } }
    : glowVariants;
  const ringV = reducedMotion
    ? { animate: { opacity: 0.15 } }
    : ringVariants;

  // Handle tap
  const handleTap = useCallback(() => {
    if (opened) return;
    setOpened(true);
    setShowParticles(true);
    onOpen?.();
  }, [opened, onOpen]);

  const particles = showParticles ? generateParticles(primary, secondary) : [];

  return (
    <motion.div
      className="gift-box"
      key={`gift-box-${playCount}`}
      variants={containerV}
      initial="initial"
      animate="animate"
      style={{
        cursor: opened ? "default" : "pointer",
        "--gift-primary": primary,
        "--gift-secondary": secondary,
      }}
      onClick={handleTap}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleTap();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Gift box from ${senderName}. Tap to open.`}
      whileHover={!opened && !reducedMotion ? { scale: 1.04, rotate: 1 } : undefined}
      whileTap={!opened && !reducedMotion ? { scale: 0.96 } : undefined}
    >
      {/* Outer glow — soft radial */}
      <motion.div
        className="gift-box__glow"
        variants={glowV}
        initial="hidden"
        animate="visible"
        style={{
          background: `radial-gradient(circle, ${primary}40 0%, ${primary}15 40%, transparent 70%)`,
        }}
      />

      {/* Shimmer ring */}
      <motion.div
        className="gift-box__ring"
        variants={ringV}
        animate="animate"
        style={{ borderColor: `${primary}30` }}
      />

      {/* Gift box body */}
      <div className="gift-box__body">
        {/* Lid */}
        <motion.div
          className="gift-box__lid"
          variants={lidV}
          initial="closed"
          animate={opened ? "open" : "closed"}
          style={{ backgroundColor: primary }}
        />
        <div className="gift-box__bow" style={{ backgroundColor: primary }} />
        <div className="gift-box__ribbon-v" style={{ backgroundColor: `${primary}90` }} />
        <div className="gift-box__ribbon-h" style={{ backgroundColor: `${primary}50` }} />
        <div className="gift-box__body-face" style={{ backgroundColor: secondary }} />
      </div>

      {/* Particle burst */}
      {showParticles && (
        <div className="gift-box__particles" aria-hidden="true">
          {particles.map((p) => (
            <div key={p.id} className="gift-box__particle" style={p.style}>
              {p.emoji}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
