import { useMemo } from "react";
import useMouseParallax from "../../hooks/useMouseParallax";

/* ───────────────────────────────────────
   Floating decorations — 14 items
   ✨ 💜 ⭐ 🌸 — all rendered in purple
   Near edges and corners, never over content
   ─────────────────────────────────────── */

const DECORATIONS = [
  { emoji: "✨", size: 20, x: 4,  y: 15, opacity: 0.22, blur: false, dur: 16, delay: 0,    drift: 18,  rot: 15,  depth: 0.5 },
  { emoji: "⭐", size: 18, x: 92, y: 20, opacity: 0.18, blur: true,  dur: 20, delay: -3,   drift: -14, rot: -10, depth: 0.8 },
  { emoji: "💜", size: 18, x: 8,  y: 55, opacity: 0.20, blur: false, dur: 18, delay: -6,   drift: 12,  rot: 8,   depth: 0.6 },
  { emoji: "🌸", size: 22, x: 88, y: 60, opacity: 0.17, blur: true,  dur: 22, delay: -1,   drift: -16, rot: -12, depth: 1.0 },
  { emoji: "💜", size: 20, x: 6,  y: 82, opacity: 0.19, blur: false, dur: 19, delay: -8,   drift: 15,  rot: 10,  depth: 0.7 },
  { emoji: "⭐", size: 22, x: 90, y: 78, opacity: 0.22, blur: false, dur: 17, delay: -4,   drift: -12, rot: 18,  depth: 0.4 },
  { emoji: "✨", size: 16, x: 15, y: 30, opacity: 0.15, blur: true,  dur: 24, delay: -10,  drift: 10,  rot: 0,   depth: 1.2 },
  { emoji: "🌸", size: 18, x: 85, y: 40, opacity: 0.16, blur: false, dur: 21, delay: -5,   drift: -10, rot: -6,  depth: 0.9 },
  { emoji: "✨", size: 24, x: 12, y: 72, opacity: 0.24, blur: false, dur: 15, delay: -2,   drift: 14,  rot: 5,   depth: 0.3 },
  { emoji: "🌸", size: 16, x: 94, y: 12, opacity: 0.18, blur: true,  dur: 23, delay: -12,  drift: -8,  rot: 0,   depth: 1.1 },
  { emoji: "⭐", size: 16, x: 5,  y: 42, opacity: 0.15, blur: false, dur: 20, delay: -7,   drift: 10,  rot: -8,  depth: 0.8 },
  { emoji: "✨", size: 18, x: 92, y: 88, opacity: 0.19, blur: false, dur: 18, delay: -9,   drift: -12, rot: 12,  depth: 0.6 },
  { emoji: "💜", size: 14, x: 3,  y: 35, opacity: 0.14, blur: false, dur: 25, delay: -14,  drift: 8,   rot: 6,   depth: 1.3 },
  { emoji: "🌸", size: 14, x: 96, y: 50, opacity: 0.13, blur: true,  dur: 26, delay: -16,  drift: -6,  rot: -4,  depth: 1.4 },
];

/* ───────────────────────────────────────
   Glow orbs — soft purple hints
   ─────────────────────────────────────── */

const GLOW_ORBS = [
  { color: "rgba(233,160,249,0.12)", x: "15%", y: "20%", size: 120, dur: 10 },
  { color: "rgba(215,138,244,0.10)", x: "80%", y: "30%", size: 100, dur: 12 },
  { color: "rgba(233,160,249,0.08)", x: "50%", y: "80%", size: 140, dur: 8  },
];

export default function HeroBackground() {
  const mouse = useMouseParallax();

  const parallaxStyle = useMemo(() => {
    return (depth) => ({
      transform: `translate(${mouse.x * depth * 6}px, ${mouse.y * depth * 4}px)`,
    });
  }, [mouse.x, mouse.y]);

  return (
    <div className="hero-bg" aria-hidden="true">
      {/* Layer 1 — Gradient atmosphere */}
      <div className="hero-bg__gradient" />

      {/* Layer 2 — Glow orbs */}
      {GLOW_ORBS.map((orb, i) => (
        <div
          key={`orb-${i}`}
          className="hero-bg__glow-orb"
          style={{
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            "--orb-dur": `${orb.dur}s`,
          }}
        />
      ))}

      {/* Layer 3 — Floating emoji decorations (all purple) */}
      {DECORATIONS.map((d, i) => (
        <span
          key={`deco-${i}`}
          className="hero-bg__deco"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            fontSize: `${d.size}px`,
            opacity: d.opacity,
            filter: [
              "grayscale(1)",
              "brightness(0.6)",
              "sepia(1)",
              "hue-rotate(220deg)",
              "saturate(4)",
              "brightness(1.1)",
              d.blur ? "blur(1.5px)" : "",
            ].filter(Boolean).join(" "),
            "--deco-dur": `${d.dur}s`,
            "--deco-delay": `${d.delay}s`,
            "--deco-drift": `${d.drift}px`,
            "--deco-rot": `${d.rot}deg`,
            ...parallaxStyle(d.depth),
          }}
        >
          {d.emoji}
        </span>
      ))}
    </div>
  );
}
