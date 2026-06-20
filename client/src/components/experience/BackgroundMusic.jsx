import { useRef, useEffect } from "react";
import { Howl } from "howler";

export default function BackgroundMusic({ src, playCount }) {
  const howlRef = useRef(null);

  useEffect(() => {
    if (!src) return;
    howlRef.current = new Howl({
      src: [src],
      loop: true,
      volume: 0.3,
      preload: true,
    });

    return () => {
      if (howlRef.current) {
        howlRef.current.unload();
        howlRef.current = null;
      }
    };
  }, [src]);

  // Replay reset
  useEffect(() => {
    if (playCount > 0 && howlRef.current) {
      howlRef.current.seek(0);
      howlRef.current.play();
    }
  }, [playCount]);

  return null; // Audio-only component
}

// Call from GiftBox tap handler
export function startMusic(howlRef) {
  if (howlRef?.current && !howlRef.current.playing()) {
    howlRef.current.play();
  }
}
