import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import useReducedMotion from "../../hooks/useReducedMotion";

const shareVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.6, type: "spring", stiffness: 150 },
  },
};

export default function ShareButton() {
  const reducedMotion = useReducedMotion();
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title: "You got a birthday wish!", url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback: select + copy from a temp input
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  const v = reducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0 } } }
    : shareVariants;

  return (
    <motion.button
      className="share-btn"
      variants={v}
      initial="hidden"
      animate="visible"
      whileHover={reducedMotion ? undefined : { scale: 1.05 }}
      whileTap={reducedMotion ? undefined : { scale: 0.95 }}
      onClick={handleShare}
    >
      {copied ? "✓ Link copied!" : "🔗 Share this wish"}
    </motion.button>
  );
}
