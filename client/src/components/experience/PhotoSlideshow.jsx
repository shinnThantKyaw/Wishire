import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";

const AUTO_ADVANCE_MS = 3500;
const MANUAL_PAUSE_MS = 10000;

/**
 * PhotoSlideshow — auto-advancing carousel with translateX sliding,
 * dot indicators overlaid on the image, and nav buttons below.
 *
 * Props:
 *   photos: object[] — array of photo objects
 *   playCount: number — replay counter for reset
 *   onComplete: () => void — called when slideshow finishes
 *   recipientName: string — for alt text
 *   reducedMotion: boolean — instant transitions if true
 *   theme: { id, primary, secondary, surface } — for dot/button colors
 */
export default function PhotoSlideshow({
  photos,
  playCount,
  onComplete,
  recipientName,
  reducedMotion = false,
  theme,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const pauseTimerRef = useRef(null);
  const autoTimerRef = useRef(null);

  const themeColor = theme?.primary || "#e84393";

  // Reset on replay
  useEffect(() => {
    setCurrentIndex(0);
    setIsPaused(false);
    setIsHovered(false);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
  }, [playCount]);

  // If no photos, complete immediately
  useEffect(() => {
    if (!photos || photos.length === 0) {
      onComplete?.();
    }
  }, [photos, onComplete]);

  // Auto-advance timer
  useEffect(() => {
    if (!photos || photos.length === 0 || isPaused || isHovered) return;

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
  }, [currentIndex, isPaused, isHovered, photos, onComplete]);

  // Manual navigation pauses auto-advance
  const pauseAutoAdvance = useCallback(() => {
    setIsPaused(true);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, MANUAL_PAUSE_MS);
  }, []);

  // Navigate to specific dot
  const goTo = useCallback(
    (index) => {
      setCurrentIndex(index);
      pauseAutoAdvance();
    },
    [pauseAutoAdvance]
  );

  // Handle previous (wraps around)
  const handlePrev = useCallback(
    (e) => {
      e.stopPropagation();
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
      pauseAutoAdvance();
    },
    [photos, pauseAutoAdvance]
  );

  // Handle next (wraps around)
  const handleNext = useCallback(
    (e) => {
      e.stopPropagation();
      setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
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

  const transitionDuration = reducedMotion ? "0s" : "0.5s";

  return (
    <motion.div
      className="photo-slideshow"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      {/* Carousel container */}
      <div
        className="photo-slideshow__viewport"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Sliding track */}
        <div
          className="photo-slideshow__track"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            transitionDuration,
          }}
        >
          {photos.map((photo, index) => {
            const src = photo?.filename || "";
            return (
              <div key={index} className="photo-slideshow__slide">
                <img
                  className="w-full h-full object-cover block transition-transform duration-500 hover:scale-105"
                  src={src}
                  alt={`Memory of ${recipientName} (${index + 1})`}
                  draggable={false}
                />
              </div>
            );
          })}
        </div>

        {/* Dot indicators — overlaid on image */}
        <div className="photo-slideshow__dots">
          {photos.map((_, index) => (
            <button
              key={index}
              className={`photo-slideshow__dot ${index === currentIndex ? "photo-slideshow__dot--active" : ""}`}
              onClick={() => goTo(index)}
              aria-label={`Go to photo ${index + 1}`}
              style={
                index === currentIndex
                  ? { backgroundColor: themeColor, width: "1.5rem" }
                  : { backgroundColor: "rgba(255,255,255,0.5)" }
              }
            />
          ))}
        </div>
      </div>

      {/* Nav buttons below carousel */}
      <div className="photo-slideshow__nav">
        <button
          className="photo-slideshow__nav-btn"
          onClick={handlePrev}
          aria-label="Previous photo"
          style={{ backgroundColor: `${themeColor}20` }}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill={themeColor} aria-hidden="true">
            <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
          </svg>
        </button>

        <button
          className="photo-slideshow__nav-btn"
          onClick={handleNext}
          aria-label="Next photo"
          style={{ backgroundColor: `${themeColor}20` }}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill={themeColor} aria-hidden="true">
            <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}
