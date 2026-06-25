import { useState, useCallback } from "react";
import { motion } from "framer-motion";

// --- Module-level variants (Rule 3) ---

const lidVariants = {
  closed: { y: 0, rotateX: 0 },
  open: {
    y: -90,
    rotateX: -55,
    transition: { type: "spring", stiffness: 150, damping: 14, delay: 0.05 },
  },
};

const instantVariants = {
  closed: { y: 0 },
  open: { y: -90, rotateX: -55, transition: { duration: 0 } },
};

// --- Particle generation ---

function generateParticles(themePrimary, themeSecondary) {
  const particles = [];
  const count = 28;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const distance = 100 + Math.random() * 120;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - 30;
    const size = 6 + Math.random() * 9;
    const color =
      i % 3 === 0 ? themePrimary : i % 3 === 1 ? themeSecondary : "#fff";
    const delay = Math.random() * 0.25;
    const emoji =
      i % 6 === 0
        ? ["✨", "⭐", "💫", "🌟", "🎉", "🎊"][Math.floor(i / 6) % 6]
        : null;

    particles.push({
      id: i,
      emoji,
      style: {
        "--tx": `${tx}px`,
        "--ty": `${ty}px`,
        width: emoji ? "18px" : `${size}px`,
        height: emoji ? "18px" : `${size}px`,
        backgroundColor: emoji ? "transparent" : color,
        boxShadow: emoji
          ? "none"
          : `0 0 8px 3px ${color}77, 0 0 20px 6px ${color}33`,
        animationDelay: `${delay}s`,
      },
    });
  }
  return particles;
}

/**
 * GiftBox — Hero gift box with lid, ribbon, bow, and particle burst.
 *
 * Props:
 *   senderName: string — used for aria-label
 *   theme: { id, primary, secondary, surface }
 *   onOpen: () => void — called on tap
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

  const lidV = reducedMotion ? instantVariants : lidVariants;

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
      initial={reducedMotion ? { opacity: 1 } : { scale: 0.5, opacity: 0 }}
      animate={
        reducedMotion
          ? { opacity: 1 }
          : {
              scale: 1,
              opacity: 1,
              transition: {
                type: "spring",
                stiffness: 120,
                damping: 14,
                duration: 0.9,
              },
            }
      }
      style={{ cursor: opened ? "default" : "pointer", perspective: 800 }}
      onClick={handleTap}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleTap();
        }
      }}
      role="button"
      tabIndex={opened ? -1 : 0}
      aria-label={`Open birthday gift from ${senderName}`}
      whileHover={
        !opened && !reducedMotion
          ? { scale: 1.06, rotateX: -3, rotateY: 2 }
          : undefined
      }
      whileTap={!opened && !reducedMotion ? { scale: 0.93 } : undefined}
    >
      {/* Deep outer glow */}
      <motion.div
        className="gift-box__glow"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={
          opened
            ? { opacity: 0.4, scale: 1.2 }
            : reducedMotion
            ? { opacity: 0.35, scale: 1 }
            : { opacity: [0.3, 0.6, 0.3], scale: [1, 1.15, 1] }
        }
        transition={
          opened
            ? { duration: 0.6 }
            : reducedMotion
            ? { duration: 0 }
            : { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }
        style={{
          background: `radial-gradient(circle, ${primary}55 0%, ${secondary}22 50%, transparent 70%)`,
        }}
      />

      {/* Shimmer ring */}
      <motion.div
        className="gift-box__ring"
        animate={
          opened
            ? { opacity: 0 }
            : reducedMotion
            ? { opacity: 0.2 }
            : { opacity: [0.15, 0.4, 0.15], scale: [1, 1.05, 1] }
        }
        transition={
          opened
            ? { duration: 0.3 }
            : reducedMotion
            ? { duration: 0 }
            : { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
        }
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
        >
          <div className="gift-box__bow" />
        </motion.div>

        <div
          className="gift-box__ribbon-v"
          style={{ backgroundColor: `${primary}aa` }}
        />
        <div
          className="gift-box__ribbon-h"
          style={{ backgroundColor: `${primary}66` }}
        />
        <div
          className="gift-box__body-face"
          style={{ backgroundColor: secondary }}
        />
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
