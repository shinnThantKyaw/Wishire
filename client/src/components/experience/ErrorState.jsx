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
    <div className="error-state">
      <span className="error-state__icon" aria-hidden="true">
        {isNotFound ? "🎁" : "⚠️"}
      </span>
      <h2 className="error-state__title">
        {isNotFound ? "Wish not found" : "Something went wrong"}
      </h2>
      <p className="error-state__message">
        {isNotFound
          ? "This wish doesn't exist or has been removed."
          : "Could not load this wish. Check your connection and try again."}
      </p>
      <button
        className="error-state__retry"
        onClick={onRetry}
        aria-label="Try again"
      >
        Try again
      </button>
    </div>
  );
}
