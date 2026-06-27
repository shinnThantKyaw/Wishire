import { useMemo, useState, useEffect } from "react";
import { Sparkles, Star, Heart, Flower2 } from "lucide-react";

/*
 * Floating decorations — Lucide icons tinted to the theme's primary color.
 * Spread around edges and corners, never over center content.
 * On mobile, only heart and flower are shown.
 */

const ICON_MAP = {
  sparkles: Sparkles,
  star: Star,
  heart: Heart,
  flower: Flower2,
};

const DECORATIONS = [
  { icon: "sparkles", size: 22, x: 4,  y: 15, opacity: 0.32, blur: false, dur: 16, delay: 0,    drift: 18,  rot: 15  },
  { icon: "star",     size: 20, x: 92, y: 20, opacity: 0.26, blur: true,  dur: 20, delay: -3,   drift: -14, rot: -10 },
  { icon: "heart",    size: 20, x: 8,  y: 55, opacity: 0.30, blur: false, dur: 18, delay: -6,   drift: 12,  rot: 8   },
  { icon: "flower",   size: 24, x: 88, y: 60, opacity: 0.26, blur: true,  dur: 22, delay: -1,   drift: -16, rot: -12 },
  { icon: "heart",    size: 22, x: 6,  y: 82, opacity: 0.28, blur: false, dur: 19, delay: -8,   drift: 15,  rot: 10  },
  { icon: "star",     size: 24, x: 90, y: 78, opacity: 0.32, blur: false, dur: 17, delay: -4,   drift: -12, rot: 18  },
  { icon: "sparkles", size: 18, x: 15, y: 30, opacity: 0.22, blur: true,  dur: 24, delay: -10,  drift: 10,  rot: 0   },
  { icon: "flower",   size: 20, x: 85, y: 40, opacity: 0.24, blur: false, dur: 21, delay: -5,   drift: -10, rot: -6  },
  { icon: "sparkles", size: 26, x: 12, y: 72, opacity: 0.34, blur: false, dur: 15, delay: -2,   drift: 14,  rot: 5   },
  { icon: "flower",   size: 18, x: 94, y: 12, opacity: 0.26, blur: true,  dur: 23, delay: -12,  drift: -8,  rot: 0   },
  { icon: "star",     size: 18, x: 5,  y: 42, opacity: 0.24, blur: false, dur: 20, delay: -7,   drift: 10,  rot: -8  },
  { icon: "sparkles", size: 20, x: 92, y: 88, opacity: 0.28, blur: false, dur: 18, delay: -9,   drift: -12, rot: 12  },
  { icon: "heart",    size: 16, x: 3,  y: 35, opacity: 0.22, blur: false, dur: 25, delay: -14,  drift: 8,   rot: 6   },
  { icon: "flower",   size: 16, x: 96, y: 50, opacity: 0.20, blur: true,  dur: 26, delay: -16,  drift: -6,  rot: -4  },
];

const MOBILE_ALLOWED = new Set(["heart", "flower"]);

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

/**
 * FloatingSparkles — Theme-tinted Lucide icon decorations.
 *
 * Props:
 *   primary: string — theme primary hex color (e.g. "#a855f7")
 *   reducedMotion: boolean — hide decorations if true
 */
export default function FloatingSparkles({ primary = "#a855f7", reducedMotion = false }) {
  const isMobile = useIsMobile();
  const decorations = useMemo(
    () => isMobile ? DECORATIONS.filter((d) => MOBILE_ALLOWED.has(d.icon)) : DECORATIONS,
    [isMobile]
  );

  if (reducedMotion) return null;

  return (
    <>
      {decorations.map((d, i) => {
        const IconComponent = ICON_MAP[d.icon];
        return (
          <span
            key={i}
            className="gift-anticipation__deco"
            style={{
              left: `${d.x}%`,
              top: `${d.y}%`,
              opacity: d.opacity,
              filter: d.blur ? "blur(1.5px)" : undefined,
              "--deco-dur": `${d.dur}s`,
              "--deco-delay": `${d.delay}s`,
              "--deco-drift": `${d.drift}px`,
              "--deco-rot": `${d.rot}deg`,
            }}
            aria-hidden="true"
          >
            <IconComponent
              size={d.size}
              color={primary}
              strokeWidth={1.8}
            />
          </span>
        );
      })}
    </>
  );
}
