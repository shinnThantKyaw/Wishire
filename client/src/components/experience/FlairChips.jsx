import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const chipVariants = {
  hidden: { opacity: 0, scale: 0.7, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 200, damping: 15 },
  },
};

export default function FlairChips({ flair }) {
  if (!flair) return null;

  const chips = [
    { emoji: "✨", label: flair.zodiacSign, style: {} },
    {
      emoji: "💎",
      label: flair.birthstone,
      style: flair.birthstoneColor
        ? { borderColor: flair.birthstoneColor, background: `${flair.birthstoneColor}22` }
        : {},
    },
    { emoji: "🌸", label: flair.birthFlower, style: {} },
  ];

  return (
    <motion.div
      className="flair-chips"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {chips.map(({ emoji, label, style }) => (
        <motion.span key={label} className="flair-chip" variants={chipVariants} style={style}>
          {emoji} {label}
        </motion.span>
      ))}
    </motion.div>
  );
}
