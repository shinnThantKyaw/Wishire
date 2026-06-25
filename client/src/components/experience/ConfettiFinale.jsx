import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

// --- Module-level variants (Rule 3) ---

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
};

const headingVariants = {
  initial: { opacity: 0, scale: 0.5 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 15,
      delay: 0.5,
    },
  },
};

const instantHeadingVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0 } },
};

const canvasStyle = {
  position: "fixed",
  inset: 0,
  pointerEvents: "none",
  zIndex: 9999,
};

const FINALE_DURATION_MS = 4000;

/**
 * ConfettiFinale -- confetti explosion with "Happy Birthday!" text animation.
 *
 * Props:
 *   recipientName: string -- name to display below heading
 *   theme: { primary, secondary, surface } -- for text coloring
 *   playCount: number -- replay counter
 *   onComplete: () => void -- called after finale duration
 *   reducedMotion: boolean -- reduce particles if true
 */
export default function ConfettiFinale({
  recipientName,
  theme,
  playCount,
  onComplete,
  reducedMotion = false,
}) {
  const canvasRef = useRef(null);
  const confettiRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (!confettiRef.current) {
      confettiRef.current = confetti.create(canvasRef.current, { resize: true });
    }

    const colors = [theme?.primary || "#ff6f59", theme?.secondary || "#ffb84d", "#ffd93d", "#6bcb77", "#4d96ff"];

    confettiRef.current({
      particleCount: reducedMotion ? 20 : 200,
      spread: reducedMotion ? 30 : 60,
      startVelocity: 55,
      origin: { y: 0.7 },
      colors,
    });

    const timer = setTimeout(() => {
      if (confettiRef.current) {
        confettiRef.current({
          particleCount: reducedMotion ? 10 : 100,
          spread: reducedMotion ? 40 : 100,
          startVelocity: 35,
          origin: { y: 0.6 },
          colors,
        });
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      confetti.reset();
    };
  }, [playCount, theme, reducedMotion]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, FINALE_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const headingV = reducedMotion ? instantHeadingVariants : headingVariants;

  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-3 min-h-[200px]"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <canvas ref={canvasRef} style={canvasStyle} />

      <motion.h1
        className="font-display font-extrabold text-4xl m-0"
        variants={headingV}
        initial="initial"
        animate="animate"
        style={{ color: theme?.primary || "var(--coral)" }}
      >
        Happy Birthday!
      </motion.h1>

      <motion.p
        className="font-display font-bold text-xl text-ink m-0"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        {recipientName}
      </motion.p>
    </motion.div>
  );
}
