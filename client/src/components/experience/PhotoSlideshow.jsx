import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Module-level variants (Rule 3) ---

const photoVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.5, ease: "easeInOut" },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.5, ease: "easeInOut" },
  },
};

const instantVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0 } },
  exit: { opacity: 0, transition: { duration: 0 } },
};

const AUTO_ADVANCE_MS = 3500;
const MANUAL_PAUSE_MS = 10000;

/**
 * PhotoSlideshow -- auto-advancing photo carousel with manual controls.
 *
 * Props:
 *   photos: string[] -- array of photo objects
 *   playCount: number -- replay counter for key generation
 *   onComplete: () => void -- called when slideshow finishes
 *   recipientName: string -- for alt text
 *   reducedMotion: boolean -- instant transitions if true
 */
export default function PhotoSlideshow({
  photos,
  playCount,
  onComplete,
  recipientName,
  reducedMotion = false,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimerRef = useRef(null);
  const autoTimerRef = useRef(null);

  // If no photos, complete immediately
  useEffect(() => {
    if (!photos || photos.length === 0) {
      onComplete?.();
    }
  }, [photos, onComplete]);

  // Auto-advance timer
  useEffect(() => {
    if (!photos || photos.length === 0) return;
    if (isPaused) return;

    // If we're at the last photo, don't auto-advance -- wait a bit then complete
    if (currentIndex === photos.length - 1) {
      autoTimerRef.current = setTimeout(() => {
        onComplete?.();
      }, AUTO_ADVANCE_MS);
      return () => clearTimeout(autoTimerRef.current);
    }

    autoTimerRef.current = setTimeout(() => {
      setCurrentIndex((prev) => Math.min(prev + 1, photos.length - 1));
    }, AUTO_ADVANCE_MS);

    return () => clearTimeout(autoTimerRef.current);
  }, [currentIndex, isPaused, photos, onComplete]);

  // Manual navigation pauses auto-advance
  const pauseAutoAdvance = useCallback(() => {
    setIsPaused(true);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, MANUAL_PAUSE_MS);
  }, []);

  // Handle previous
  const handlePrev = useCallback(
    (e) => {
      e.stopPropagation();
      setCurrentIndex((prev) => Math.max(0, prev - 1));
      pauseAutoAdvance();
    },
    [pauseAutoAdvance]
  );

  // Handle next
  const handleNext = useCallback(
    (e) => {
      e.stopPropagation();
      setCurrentIndex((prev) => Math.min(prev + 1, photos.length - 1));
      pauseAutoAdvance();
    },
    [photos, pauseAutoAdvance]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    };
  }, []);

  if (!photos || photos.length === 0) return null;

  const photo = photos[currentIndex];
  const photoSrc = photo?.thumbnailFilename || photo?.filename
    ? `/api/uploads/${photo.thumbnailFilename || photo.filename}`
    : "";

  const variants = reducedMotion ? instantVariants : photoVariants;

  return (
    <div className="photo-slideshow">
      <AnimatePresence mode="wait">
        <motion.div
          key={`photo-${currentIndex}-${playCount}`}
          className="photo-slideshow__frame"
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <img
            className="photo-slideshow__image"
            src={photoSrc}
            alt={`Memory of ${recipientName}`}
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation controls */}
      <div className="photo-slideshow__controls">
        <button
          className="photo-slideshow__btn photo-slideshow__btn--prev"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          aria-label="Previous photo"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
          </svg>
        </button>

        <span className="photo-slideshow__counter">
          {currentIndex + 1}/{photos.length}
        </span>

        <button
          className="photo-slideshow__btn photo-slideshow__btn--next"
          onClick={handleNext}
          disabled={currentIndex === photos.length - 1}
          aria-label="Next photo"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
