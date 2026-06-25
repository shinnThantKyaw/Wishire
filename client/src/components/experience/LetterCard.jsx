import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Howl } from "howler";

// --- Module-level variants (Rule 3) ---

const cardVariants = {
  closed: {
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 25 },
  },
  open: {
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 25 },
  },
};

const buttonVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 150, damping: 20, delay: 0.3 },
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

const letterVariants = {
  initial: { height: 0, opacity: 0 },
  animate: {
    height: "auto",
    opacity: 1,
    transition: { height: { duration: 0.4, ease: "easeOut" }, opacity: { duration: 0.3, delay: 0.2 } },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { opacity: { duration: 0.2 }, height: { duration: 0.3, delay: 0.1 } },
  },
};

const cursorVariants = {
  blink: {
    opacity: [1, 0],
    transition: { duration: 0.6, repeat: Infinity, repeatType: "reverse" },
  },
};

/**
 * LetterCard — expandable card that reveals letter text with typewriter effect.
 *
 * Props:
 *   sentences: string[] — the letter sentences
 *   playCount: number — replay counter for key generation
 *   reducedMotion: boolean — instant reveal if true
 *   recipientName: string — for "Dear {name}" greeting
 *   senderName: string — for sign-off
 */
export default function LetterCard({ sentences, playCount, reducedMotion = false, recipientName, senderName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayed, setDisplayed] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const chimeRef = useRef(null);
  const intervalRef = useRef(null);

  // Build full letter text with greeting and sign-off
  const greeting = recipientName ? `Dear ${recipientName} ❤️\n\n` : "";
  const signOffText = senderName ? `\n\nWith love,\n${senderName} ❤️` : "\n\nWith love ❤️";
  const fullText = sentences.join(" ");

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
    setIsOpen(false);
    setDisplayed("");
    setIsComplete(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [playCount]);

  // Full typed content: greeting + message + sign-off
  const typedContent = greeting + fullText + signOffText;

  // Start typewriter when card opens
  useEffect(() => {
    if (!isOpen || !typedContent) return;

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
        if (chimeRef.current) {
          chimeRef.current.play();
        }
      }
    }, 40);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isOpen, typedContent, reducedMotion]);

  // Handle "Read your letter" button
  const handleOpen = useCallback((e) => {
    e.stopPropagation();
    setIsOpen(true);
  }, []);

  // Handle close — collapse the card back to button
  const handleClose = useCallback((e) => {
    e.stopPropagation();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsOpen(false);
    setDisplayed("");
    setIsComplete(false);
  }, []);

  // Handle skip
  const handleSkip = useCallback(
    (e) => {
      e.stopPropagation();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setDisplayed(typedContent);
      setIsComplete(true);
      if (chimeRef.current) {
        chimeRef.current.play();
      }
    },
    [typedContent]
  );

  const isTyping = isOpen && !isComplete && !reducedMotion;

  return (
    <div className="letter-card-wrapper">
      <AnimatePresence mode="wait">
        {!isOpen && (
          <motion.button
            key={`letter-btn-${playCount}`}
            className="letter-card__button"
            variants={buttonVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={handleOpen}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            💌 A Letter For You
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key={`letter-body-${playCount}`}
            className="letter-card"
            variants={cardVariants}
            initial="closed"
            animate="open"
            exit="exit"
          >
            <button
              className="letter-card__close"
              onClick={handleClose}
              aria-label="Close letter"
            >
              ✕
            </button>
            <motion.div
              className="letter-card__letter"
              variants={letterVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <p className="letter-card__text">
                {displayed}
                {isTyping && (
                  <motion.span
                    className="letter-card__cursor"
                    variants={cursorVariants}
                    animate="blink"
                    aria-hidden="true"
                  >
                    |
                  </motion.span>
                )}
              </p>

              {isTyping && (
                <button
                  className="letter-card__skip"
                  onClick={handleSkip}
                  aria-label="Skip typewriter animation"
                >
                  Skip
                </button>
              )}

              {/* Sign-off is now part of typed content */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
