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
      // silent fail
    }
  }, [wishId]);

  function handleHeartTap() {
    setHeartCount((c) => c + 1);
    pendingHeartRef.current += 1;
    setShowHeartPop(true);
    setTimeout(() => setShowHeartPop(false), 300);

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
      className="flex flex-col items-center gap-4"
      variants={barVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex gap-2 flex-wrap justify-center">
        {EMOJIS.map((emoji) => (
          <motion.button
            key={emoji}
            className="relative bg-white/80 border border-border rounded-full w-12 h-12 text-xl cursor-pointer flex items-center justify-center shadow-sm hover:bg-white hover:shadow-md transition-shadow"
            variants={emojiVariants}
            whileTap={{ scale: 1.3 }}
            onClick={() => handleEmojiTap(emoji)}
          >
            <span>{emoji}</span>
            {reactions[emoji] > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-coral text-white text-[0.65rem] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {reactions[emoji]}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      <motion.button
        className="flex flex-col items-center gap-1 bg-none border-none cursor-pointer p-2"
        onClick={handleHeartTap}
        variants={popVariants}
        animate={showHeartPop ? "pop" : undefined}
        whileTap={{ scale: 0.9 }}
      >
        <span className="text-3xl">❤️</span>
        <AnimatePresence>
          {heartCount > 0 && (
            <motion.span
              key={heartCount}
              className="text-coral font-bold text-sm"
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
