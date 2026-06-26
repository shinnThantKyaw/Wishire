import { Pause, Play } from "lucide-react";

/**
 * AudioController — pause/resume button for background music.
 * Fixed position, top-right corner, always visible during the experience.
 *
 * Props:
 *   isPlaying: boolean
 *   onToggle: () => void
 *   theme: { primary, secondary } — for themed styling
 */
export default function AudioController({ isPlaying, onToggle, theme }) {
  const primary = theme?.primary || "#a855f7";

  // Convert hex to rgba at different opacities — avoids color-mix() fallback issues
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div className="audio-controller">
      <button
        className="audio-controller__btn"
        onClick={onToggle}
        aria-label={isPlaying ? "Pause music" : "Resume music"}
        title={isPlaying ? "Pause music" : "Resume music"}
        style={{
          "--ac-bg": hexToRgba(primary, 0.15),
          "--ac-border": hexToRgba(primary, 0.4),
          "--ac-shadow": hexToRgba(primary, 0.2),
          "--ac-bg-hover": hexToRgba(primary, 0.25),
          "--ac-primary": primary,
        }}
      >
        {isPlaying ? (
          <Pause className="audio-controller__icon" size={18} strokeWidth={2.5} />
        ) : (
          <Play className="audio-controller__icon" size={18} strokeWidth={2.5} />
        )}
      </button>
    </div>
  );
}
