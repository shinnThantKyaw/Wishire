import { useMemo, useState, useEffect } from "react";

/*
 * Floating decorations — match landing page HeroBackground style.
 * All emojis tinted to the theme's primary color via CSS filter.
 * Spread around edges and corners, never over center content.
 * On mobile, only flower (🌸) and heart (💜) are shown.
 */

const DECORATIONS = [
  // Edge decorations
  { emoji: "✨", size: 22, x: 4,  y: 15, opacity: 0.32, blur: false, dur: 16, delay: 0,    drift: 18,  rot: 15  },
  { emoji: "⭐", size: 20, x: 92, y: 20, opacity: 0.26, blur: true,  dur: 20, delay: -3,   drift: -14, rot: -10 },
  { emoji: "💜", size: 20, x: 8,  y: 55, opacity: 0.30, blur: false, dur: 18, delay: -6,   drift: 12,  rot: 8   },
  { emoji: "🌸", size: 24, x: 88, y: 60, opacity: 0.26, blur: true,  dur: 22, delay: -1,   drift: -16, rot: -12 },
  { emoji: "💜", size: 22, x: 6,  y: 82, opacity: 0.28, blur: false, dur: 19, delay: -8,   drift: 15,  rot: 10  },
  { emoji: "⭐", size: 24, x: 90, y: 78, opacity: 0.32, blur: false, dur: 17, delay: -4,   drift: -12, rot: 18  },
  { emoji: "✨", size: 18, x: 15, y: 30, opacity: 0.22, blur: true,  dur: 24, delay: -10,  drift: 10,  rot: 0   },
  { emoji: "🌸", size: 20, x: 85, y: 40, opacity: 0.24, blur: false, dur: 21, delay: -5,   drift: -10, rot: -6  },
  { emoji: "✨", size: 26, x: 12, y: 72, opacity: 0.34, blur: false, dur: 15, delay: -2,   drift: 14,  rot: 5   },
  { emoji: "🌸", size: 18, x: 94, y: 12, opacity: 0.26, blur: true,  dur: 23, delay: -12,  drift: -8,  rot: 0   },
  { emoji: "⭐", size: 18, x: 5,  y: 42, opacity: 0.24, blur: false, dur: 20, delay: -7,   drift: 10,  rot: -8  },
  { emoji: "✨", size: 20, x: 92, y: 88, opacity: 0.28, blur: false, dur: 18, delay: -9,   drift: -12, rot: 12  },
  { emoji: "💜", size: 16, x: 3,  y: 35, opacity: 0.22, blur: false, dur: 25, delay: -14,  drift: 8,   rot: 6   },
  { emoji: "🌸", size: 16, x: 96, y: 50, opacity: 0.20, blur: true,  dur: 26, delay: -16,  drift: -6,  rot: -4  },
];

const MOBILE_ALLOWED = new Set(["🌸", "💜"]);

/** Convert hex color to hue degrees (0–360) */
function hexToHue(hex) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return 0;
  let hue;
  if (max === r) hue = ((g - b) / d) % 6;
  else if (max === g) hue = (b - r) / d + 2;
  else hue = (r - g) / d + 4;
  hue *= 60;
  return hue < 0 ? hue + 360 : hue;
}

/**
 * FloatingSparkles — Theme-tinted emoji decorations matching the landing page.
 * Converts theme primary color to hue-rotate degrees so all emojis match the theme.
 *
 * Props:
 *   primary: string — theme primary hex color (e.g. "#a855f7")
 *   reducedMotion: boolean — hide decorations if true
 */
function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < breakpoint
  );
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}

export default function FloatingSparkles({ primary = "#a855f7", reducedMotion = false }) {
  const isMobile = useIsMobile();
  const decorations = useMemo(
    () => isMobile ? DECORATIONS.filter((d) => MOBILE_ALLOWED.has(d.emoji)) : DECORATIONS,
    [isMobile]
  );

  // The hue-rotate filter baseline is purple (~270°).
  // Subtract to shift from purple to the target theme hue.
  const purpleHue = 270;
  const targetHue = hexToHue(primary);
  const hueShift = targetHue - purpleHue;

  if (reducedMotion) return null;

  return (
    <>
      {decorations.map((d, i) => (
        <span
          key={i}
          className="gift-anticipation__deco"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            fontSize: `${d.size}px`,
            opacity: d.opacity,
            filter: [
              "grayscale(1)",
              "brightness(0.6)",
              "sepia(1)",
              `hue-rotate(${hueShift}deg)`,
              "saturate(4)",
              "brightness(1.1)",
              d.blur ? "blur(1.5px)" : "",
            ].filter(Boolean).join(" "),
            "--deco-dur": `${d.dur}s`,
            "--deco-delay": `${d.delay}s`,
            "--deco-drift": `${d.drift}px`,
            "--deco-rot": `${d.rot}deg`,
          }}
          aria-hidden="true"
        >
          {d.emoji}
        </span>
      ))}
    </>
  );
}
