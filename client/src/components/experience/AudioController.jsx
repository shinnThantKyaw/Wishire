/**
 * AudioController — pause/resume button for background music.
 * Fixed position, top-right corner, always visible during the experience.
 *
 * Props:
 *   isPlaying: boolean
 *   onToggle: () => void
 */
export default function AudioController({ isPlaying, onToggle }) {
  return (
    <div className="audio-controller">
      <button
        className="audio-controller__btn"
        onClick={onToggle}
        aria-label={isPlaying ? "Pause music" : "Resume music"}
        title={isPlaying ? "Pause music" : "Resume music"}
      >
        {isPlaying ? (
          // Pause icon (two vertical bars)
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
            <rect x="3" y="2" width="4" height="14" rx="1" />
            <rect x="11" y="2" width="4" height="14" rx="1" />
          </svg>
        ) : (
          // Play icon (triangle)
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
            <path d="M4 2.5v13l11-6.5z" />
          </svg>
        )}
      </button>
    </div>
  );
}
