import { motion } from "framer-motion";

const giftBoxVariants = {
  initial: { scale: 0, opacity: 0, rotate: -5 },
  animate: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 200, damping: 15 },
  },
  tap: {
    scale: 0.95,
    transition: { type: "spring", stiffness: 400, damping: 10 },
  },
  exit: {
    scale: 1.3,
    opacity: 0,
    y: -40,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const lidVariants = {
  closed: { y: 0, rotate: 0 },
  opening: {
    y: -60,
    rotate: -15,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 12,
      delay: 0.1,
    },
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

export default function GiftBox({ onOpen, playCount }) {
  return (
    <motion.div
      className="gift-box"
      key={`gift-box-${playCount}`}
      variants={giftBoxVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      onTap={onOpen}
      style={{ cursor: "pointer" }}
    >
      <motion.div className="gift-box__glow" variants={glowVariants} initial="hidden" animate="visible" />
      <div className="gift-box__body">
        <motion.div className="gift-box__lid" variants={lidVariants} initial="closed" animate="closed" />
        <div className="gift-box__bow" />
        <div className="gift-box__ribbon" />
      </div>
      <motion.p
        className="gift-box__hint"
        variants={tapHintVariants}
        initial="hidden"
        animate="visible"
      >
        Tap to open
      </motion.p>
    </motion.div>
  );
}
