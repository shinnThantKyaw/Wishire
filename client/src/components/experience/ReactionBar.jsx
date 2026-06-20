import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EMOJIS = ["❤️", "😭", "😂", "🥰", "🤩", "🥳"];

const barVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const emojiVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 15 },
  },
};

const popVariants = {
  pop: {
    scale: [1, 1.4, 1],
    transition: { duration: 0.3 },
  },
};

export default function ReactionBar({ wishId }) {
  const [reactions, setReactions] = useState({});
  const [heartCount, setHeartCount] = useState(0);
  const [showHeartPop, setShowHeartPop] = useState(false);
  const pendingHeartRef = useRef(0);
  const flushTimerRef = useRef(null);

  const flushHeart = useCallback(async () => {
    const delta = pendingHeartRef.current;
    if (delta <= 0) return;
    pendingHeartRef.current = 0;

    try {
      const res = await fetch(`/api/wish/${wishId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji: "❤️", count: delta }),
      });
      if (res.ok) {
        const data = await res.json();
        setHeartCount(data.count);
      }
    } catch {
      // silent fail — optimistic UI handles display
    }
  }, [wishId]);

  function handleHeartTap() {
    setHeartCount((c) => c + 1);
    pendingHeartRef.current += 1;
    setShowHeartPop(true);
    setTimeout(() => setShowHeartPop(false), 300);

    // Debounce flush at 800ms
    clearTimeout(flushTimerRef.current);
    flushTimerRef.current = setTimeout(flushHeart, 800);
  }

  async function handleEmojiTap(emoji) {
    setReactions((prev) => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + 1,
    }));

    try {
      await fetch(`/api/wish/${wishId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
    } catch {
      // silent
    }
  }

  return (
    <motion.div
      className="reaction-bar"
      variants={barVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="reaction-bar__emojis">
        {EMOJIS.map((emoji) => (
          <motion.button
            key={emoji}
            className="reaction-bar__emoji"
            variants={emojiVariants}
            whileTap={{ scale: 1.3 }}
            onClick={() => handleEmojiTap(emoji)}
          >
            <span>{emoji}</span>
            {reactions[emoji] > 0 && (
              <span className="reaction-bar__count">{reactions[emoji]}</span>
            )}
          </motion.button>
        ))}
      </div>

      <motion.button
        className="reaction-bar__heart"
        onClick={handleHeartTap}
        variants={popVariants}
        animate={showHeartPop ? "pop" : undefined}
        whileTap={{ scale: 0.9 }}
      >
        <span className="reaction-bar__heart-icon">❤️</span>
        <AnimatePresence>
          {heartCount > 0 && (
            <motion.span
              key={heartCount}
              className="reaction-bar__heart-count"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              {heartCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}
