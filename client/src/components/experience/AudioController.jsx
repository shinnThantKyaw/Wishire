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
    <div className="fixed top-4 right-4 z-[100]">
      <button
        className="w-11 h-11 min-h-[44px] rounded-full border-none bg-white/85 text-mint text-xl cursor-pointer flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-[background,transform] duration-200 hover:bg-white hover:scale-105 focus-visible:outline-2 focus-visible:outline-mint focus-visible:outline-offset-2"
        onClick={onToggle}
        aria-label={isPlaying ? "Pause music" : "Resume music"}
        title={isPlaying ? "Pause music" : "Resume music"}
      >
        {isPlaying ? (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
            <rect x="3" y="2" width="4" height="14" rx="1" />
            <rect x="11" y="2" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
            <path d="M4 2.5v13l11-6.5z" />
          </svg>
        )}
      </button>
    </div>
  );
}
