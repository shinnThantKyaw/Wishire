import { useState, useEffect, useRef } from "react";

/**
 * Returns normalised mouse position { x, y } in range -1 … 1
 * relative to the viewport centre.  Skips updates on touch devices
 * and respects prefers-reduced-motion.
 */
export default function useMouseParallax() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const raf = useRef(null);
  const pending = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Skip on touch devices
    if (typeof window === "undefined" || "ontouchstart" in window) return;

    // Skip if user prefers reduced motion
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    function onMove(e) {
      pending.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
      if (!raf.current) {
        raf.current = requestAnimationFrame(() => {
          setPos(pending.current);
          raf.current = null;
        });
      }
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return pos;
}
