import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";

// --- Module-level variants (Rule 3) ---

const giftBoxContainerVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
};

const lidVariants = {
  closed: { y: 0, rotateX: 0 },
  open: {
    y: -60,
    rotateX: -45,
    transition: { duration: 1, ease: "easeOut" },
  },
};

const bodyVariants = {
  closed: { scale: 1 },
  open: {
    scale: 1.05,
    transition: { duration: 0.3, delay: 0.5 },
  },
};

const glowVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: [0, 0.8, 0.4],
    scale: [0.5, 1.5, 1.2],
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const tapHintVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: [0, 1, 1, 0.6],
    y: [10, 0, 0, -2],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse",
    },
  },
};

const instantVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0 } },
  closed: { y: 0 },
  open: { y: -60, transition: { duration: 0 } },
};

// --- Particle generation ---

function generateParticles(themePrimary, themeSecondary) {
  const particles = [];
  for (let i = 0; i < 18; i++) {
    const angle = (Math.PI * 2 * i) / 18 + (Math.random() - 0.5) * 0.4;
    const distance = 60 + Math.random() * 80;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    const size = 4 + Math.random() * 6;
    const color = i % 2 === 0 ? themePrimary : themeSecondary;
    const delay = Math.random() * 0.2;

    particles.push({
      id: i,
      style: {
        "--tx": `${tx}px`,
        "--ty": `${ty}px`,
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        animationDelay: `${delay}s`,
      },
    });
  }
  return particles;
}

/**
 * GiftBox — CSS gift box with split animation, particles, and sender name.
 *
 * Props:
 *   senderName: string
 *   theme: { id, primary, secondary, surface }
 *   onOpen: () => void     — called on tap (triggers music + SFX + dispatches OPEN_BOX)
 *   onOpened: () => void   — called after lid split animation completes (dispatches BOX_OPENED)
 *   playCount: number
 *   reducedMotion: boolean
 */
export default function GiftBox({
  senderName,
  theme,
  onOpen,
  onOpened,
  playCount = 0,
  reducedMotion = false,
}) {
  const [opened, setOpened] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const openedFiredRef = useRef(false);

  const primary = theme?.primary || "#ff6f59";
  const secondary = theme?.secondary || "#ffb84d";

  // Pick variants based on motion preference
  const lidV = reducedMotion ? instantVariants : lidVariants;
  const containerV = reducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0 } } }
    : giftBoxContainerVariants;
  const glowV = reducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 0.4, transition: { duration: 0 } } }
    : glowVariants;
  const hintV = reducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 0.7, transition: { duration: 0 } } }
    : tapHintVariants;

  // Fire onOpened at most once (animation callback or fallback timeout)
  const fireOpened = useCallback(() => {
    if (openedFiredRef.current) return;
    openedFiredRef.current = true;
    onOpened?.();
  }, [onOpened]);

  // Fallback timeout: advance state even if onAnimationComplete doesn't fire
  useEffect(() => {
    if (!opened) return;
    const timer = setTimeout(fireOpened, 1100); // 1s animation + 100ms buffer
    return () => clearTimeout(timer);
  }, [opened, fireOpened]);

  // Handle tap — triggers music + SFX + starts split animation
  const handleTap = useCallback(() => {
    if (opened) return;
    setOpened(true);
    setShowParticles(true);
    // Call onOpen to trigger music + SFX + dispatch OPEN_BOX
    onOpen?.();

    // For reduced motion, call onOpened immediately (no animation to wait for)
    if (reducedMotion) {
      fireOpened();
    }
  }, [opened, onOpen, fireOpened, reducedMotion]);

  // Particles data
  const particles = showParticles ? generateParticles(primary, secondary) : [];

  return (
    <motion.div
      className="gift-box"
      key={`gift-box-${playCount}`}
      variants={containerV}
      initial="initial"
      animate="animate"
      style={{ cursor: opened ? "default" : "pointer" }}
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
    >
      {/* Glow effect */}
      <motion.div
        className="gift-box__glow"
        variants={glowV}
        initial="hidden"
        animate="visible"
      />

      {/* Gift box body */}
      <div className="gift-box__body" style={{ perspective: "400px" }}>
        {/* Lid — animates up on open */}
        <motion.div
          className="gift-box__lid"
          variants={lidV}
          initial="closed"
          animate={opened ? "open" : "closed"}
          // Rule 4: use onAnimationComplete for state transitions
          onAnimationComplete={() => {
            if (opened) {
              fireOpened();
            }
          }}
          style={{ backgroundColor: primary }}
        />
        <div className="gift-box__bow" />
        <div
          className="gift-box__ribbon"
          style={{ backgroundColor: secondary }}
        />

        {/* Sender name on the box body */}
        {senderName && (
          <div className="gift-box__sender" style={{ color: primary }}>
            <span className="gift-box__from-label">From</span>
            <span className="gift-box__name">{senderName}</span>
          </div>
        )}
      </div>

      {/* Particle burst */}
      {showParticles && (
        <div className="gift-box__particles" aria-hidden="true">
          {particles.map((p) => (
            <div key={p.id} className="gift-box__particle" style={p.style} />
          ))}
        </div>
      )}

      {/* Tap to open hint */}
      {!opened && (
        <motion.p
          className="gift-box__hint"
          variants={hintV}
          initial="hidden"
          animate="visible"
        >
          Tap to open
        </motion.p>
      )}
    </motion.div>
  );
}
