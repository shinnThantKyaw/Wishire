import { useRef, useEffect } from "react";
import confetti from "canvas-confetti";

const canvasStyle = {
  position: "fixed",
  inset: 0,
  pointerEvents: "none",
  zIndex: 9999,
};

export default function ConfettiFinale({ playCount, themeColors, onComplete }) {
  const canvasRef = useRef(null);
  const confettiRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (!confettiRef.current) {
      confettiRef.current = confetti.create(canvasRef.current, { resize: true });
    }

    const isMobile = window.innerWidth < 768;
    const colors = themeColors || ["#ff6b9d", "#c44dff", "#ffd93d", "#6bcb77", "#4d96ff"];

    // Fire multiple bursts
    const fire = (opts) => confettiRef.current({ ...opts, colors });

    fire({
      particleCount: isMobile ? 40 : 100,
      spread: isMobile ? 60 : 90,
      origin: { y: 0.7 },
    });

    setTimeout(() => {
      fire({
        particleCount: isMobile ? 30 : 60,
        spread: isMobile ? 50 : 80,
        origin: { x: 0.2, y: 0.6 },
      });
      fire({
        particleCount: isMobile ? 30 : 60,
        spread: isMobile ? 50 : 80,
        origin: { x: 0.8, y: 0.6 },
      });
    }, 300);

    setTimeout(() => {
      fire({
        particleCount: isMobile ? 20 : 50,
        spread: 120,
        startVelocity: 30,
        origin: { y: 0.5 },
      });
    }, 600);

    return () => {
      confetti.reset();
    };
  }, [playCount, themeColors]);

  useEffect(() => {
    const timer = setTimeout(() => onComplete?.(), 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return <canvas ref={canvasRef} style={canvasStyle} />;
}
