import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Howl } from "howler";

// --- Module-level variants (Rule 3) ---

const letterRevealVariants = {
  initial: { opacity: 0, y: 50, scale: 0.8 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, type: "spring" },
  },
  exit: {
    opacity: 0,
    y: -50,
    scale: 0.8,
    transition: { duration: 0.3 },
  },
};

const cursorVariants = {
  blink: {
    opacity: [1, 0],
    transition: { duration: 0.6, repeat: Infinity, repeatType: "reverse" },
  },
};

/**
 * LetterCard — card with closed/open states.
 * Closed: romantic heading + "Open Letter" button.
 * Open: letter content with typewriter effect, close button, skip button.
 *
 * Props:
 *   sentences: string[] — the letter sentences
 *   playCount: number — replay counter for key generation
 *   reducedMotion: boolean — instant reveal if true
 *   recipientName: string — for "Dear {name}" greeting
 *   senderName: string — for sign-off
 *   theme: { primary, secondary } — for themed colors
 */
export default function LetterCard({
  sentences,
  playCount,
  reducedMotion = false,
  recipientName,
  senderName,
  theme,
}) {
  const [open, setOpen] = useState(false);
  const [displayed, setDisplayed] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const chimeRef = useRef(null);
  const intervalRef = useRef(null);

  const primary = theme?.primary || "#a855f7";
  const secondary = theme?.secondary || "#d946ef";

  // Build full letter text with greeting and sign-off
  const greeting = recipientName ? `Dear ${recipientName} ❤️\n\n` : "";
  const signOffText = senderName
    ? `\n\nWith love,\n${senderName} ❤️`
    : "\n\nWith love ❤️";
  const fullText = sentences.join(" ");
  const typedContent = greeting + fullText + signOffText;

  // Initialize chime SFX
  useEffect(() => {
    chimeRef.current = new Howl({
      src: ["/assets/audio/chime.mp3"],
      volume: 0.4,
      onloaderror: () => {
        chimeRef.current = null;
      },
    });
    return () => {
      chimeRef.current = null;
    };
  }, []);

  // Reset on replay
  useEffect(() => {
    setOpen(false);
    setDisplayed("");
    setIsComplete(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [playCount]);

  // Start typewriter when card opens
  useEffect(() => {
    if (!open || !typedContent) return;

    if (reducedMotion) {
      setDisplayed(typedContent);
      setIsComplete(true);
      return;
    }

    let i = 0;
    setDisplayed("");
    setIsComplete(false);

    intervalRef.current = setInterval(() => {
      if (i < typedContent.length) {
        setDisplayed(typedContent.slice(0, i + 1));
        i++;
      } else {
        setIsComplete(true);
        clearInterval(intervalRef.current);
        if (chimeRef.current) chimeRef.current.play();
      }
    }, 40);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [open, typedContent, reducedMotion]);

  const handleOpen = useCallback((e) => {
    e.stopPropagation();
    setOpen(true);
  }, []);

  const handleClose = useCallback((e) => {
    e.stopPropagation();
    if (intervalRef.current) clearInterval(intervalRef.current);
    setOpen(false);
    setDisplayed("");
    setIsComplete(false);
  }, []);

  const handleSkip = useCallback(
    (e) => {
      e.stopPropagation();
      if (intervalRef.current) clearInterval(intervalRef.current);
      setDisplayed(typedContent);
      setIsComplete(true);
      if (chimeRef.current) chimeRef.current.play();
    },
    [typedContent]
  );

  const isTyping = open && !isComplete && !reducedMotion;

  return (
    <div className="letter-card-wrapper">
      <motion.article
        className={`letter-card ${open ? "letter-card--open" : ""}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Closed state — heading + open button */}
        {!open && (
          <motion.div
            className="letter-card__closed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h3
              className="letter-card__heading"
              style={{
                background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Here is a letter for you, {recipientName} 💝
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpen}
              className="letter-card__open-btn"
              style={{
                background: `linear-gradient(135deg, ${primary}, ${secondary})`,
              }}
              aria-label="Open letter"
            >
              Open Letter 💌
            </motion.button>
          </motion.div>
        )}

        {/* Open state — letter with typewriter */}
        <AnimatePresence>
          {open && (
            <motion.div
              key={`letter-${playCount}`}
              className="letter-card__body"
              variants={letterRevealVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              role="dialog"
              aria-modal="true"
              aria-label="Letter"
            >
              {/* Close button */}
              <button
                className="letter-card__close"
                onClick={handleClose}
                aria-label="Close letter"
              >
                <X size={22} />
              </button>

              {/* Letter content */}
              <div className="letter-card__content">
                <p className="letter-card__text">
                  {displayed}
                  {isTyping && (
                    <motion.span
                      className="letter-card__cursor"
                      style={{ color: primary }}
                      variants={cursorVariants}
                      animate="blink"
                      aria-hidden="true"
                    >
                      |
                    </motion.span>
                  )}
                </p>
              </div>

              {/* Skip button */}
              <div className="letter-card__skip-row">
                {isTyping && (
                  <motion.button
                    className="letter-card__skip"
                    onClick={handleSkip}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    aria-label="Skip typewriter animation"
                  >
                    Skip Typing ⏩
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.article>
    </div>
  );
}
