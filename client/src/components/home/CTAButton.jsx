import { useState, useEffect, useCallback } from "react";
import { Gift, ArrowRight } from "lucide-react";

/*
 * Sparkle positions — 8 tiny dots arranged around the button.
 * Each fades in/out at a different phase so they look random.
 */
const SPARKLES = [
  { x: -8,  y: -12, delay: 0,    size: 4 },
  { x: 110, y: -10, delay: 0.5,  size: 3 },
  { x: -14, y: 70,  delay: 1.0,  size: 4 },
  { x: 115, y: 65,  delay: 1.5,  size: 3 },
  { x: 30,  y: -16, delay: 2.0,  size: 3 },
  { x: 75,  y: 80,  delay: 2.5,  size: 4 },
  { x: 50,  y: -14, delay: 3.0,  size: 3 },
  { x: 95,  y: 78,  delay: 3.5,  size: 3 },
];

export default function CTAButton({ onClick }) {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleClick = useCallback(() => {
    if (onClick) onClick();
  }, [onClick]);

  return (
    <div className="cta-wrapper">
      <button
        type="button"
        className="cta-premium"
        onClick={handleClick}
      >
        <span className="cta-premium__highlight" />
        <span className="cta-premium__shine" />
        <span className="cta-premium__icon" aria-hidden="true">
          <Gift size={22} strokeWidth={2} />
        </span>
        <span className="cta-premium__text">Create a Wish</span>
        <span className="cta-premium__arrow" aria-hidden="true">
          <ArrowRight size={20} strokeWidth={2.5} />
        </span>
      </button>

      {/* Floating sparkle particles */}
      {!prefersReduced && (
        <div className="cta-premium__sparkles" aria-hidden="true">
          {SPARKLES.map((s, i) => (
            <span
              key={i}
              className="cta-premium__sparkle"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.size,
                height: s.size,
                "--sparkle-delay": `${s.delay}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
