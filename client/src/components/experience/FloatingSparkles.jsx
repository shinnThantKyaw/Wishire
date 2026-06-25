import { useMemo } from "react";

// Sparkle emoji pool
const SPARKLE_CHARS = ["✨", "⭐", "✦", "💫", "🌟"];

/**
 * FloatingSparkles — decorative sparkle particles that float upward.
 * Pure CSS animation, no refs or effects needed.
 *
 * Props:
 *   count: number — particle count (default 18)
 *   reducedMotion: boolean — hide sparkles if true
 */
export default function FloatingSparkles({ count = 18, reducedMotion = false }) {
  // Generate stable particle data on mount
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      char: SPARKLE_CHARS[i % SPARKLE_CHARS.length],
      style: {
        left: `${5 + Math.random() * 90}%`,
        "--sparkle-delay": `${Math.random() * 6}s`,
        "--sparkle-dur": `${4 + Math.random() * 5}s`,
        "--sparkle-size": `${0.6 + Math.random() * 0.8}rem`,
        "--sparkle-sway": `${-20 + Math.random() * 40}px`,
      },
    }));
  }, [count]);

  if (reducedMotion) return null;

  return (
    <div className="sparkles-container" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="sparkle"
          style={p.style}
        >
          {p.char}
        </span>
      ))}
    </div>
  );
}
