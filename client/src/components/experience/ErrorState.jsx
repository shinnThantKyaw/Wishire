/**
 * ErrorState — displays wish-not-found or network error with retry button.
 *
 * Props:
 *   error: "not_found" | "network"
 *   onRetry: () => void
 */
export default function ErrorState({ error, onRetry }) {
  const isNotFound = error === "not_found";

  return (
    <div className="flex flex-col items-center gap-4 p-[60px_20px] text-center">
      <span className="text-5xl" aria-hidden="true">
        {isNotFound ? "🎁" : "⚠️"}
      </span>
      <h2 className="font-display font-extrabold text-2xl text-coral m-0">
        {isNotFound ? "Wish not found" : "Something went wrong"}
      </h2>
      <p className="m-0 opacity-75 max-w-[320px] leading-relaxed">
        {isNotFound
          ? "This wish doesn't exist or has been removed."
          : "Could not load this wish. Check your connection and try again."}
      </p>
      <button
        className="bg-coral text-white font-display font-bold text-base px-6 py-3 min-h-[44px] min-w-[120px] rounded-full border-none cursor-pointer mt-2 hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-mint focus-visible:outline-offset-2"
        onClick={onRetry}
        aria-label="Try again"
      >
        Try again
      </button>
    </div>
  );
}
