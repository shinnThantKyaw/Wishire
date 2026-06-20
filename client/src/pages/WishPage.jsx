import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ExperienceOrchestrator from "../components/experience/ExperienceOrchestrator";

// Theme CSS custom property maps
const THEME_STYLES = {
  sunrise: {
    "--coral": "#ff6f59",
    "--gold": "#ffb84d",
    "--mint": "#2bb39c",
    "--cream": "#fff8ef",
  },
  ocean: {
    "--coral": "#4d96ff",
    "--gold": "#6bcb77",
    "--mint": "#2196f3",
    "--cream": "#e8f4f8",
  },
  lavender: {
    "--coral": "#c44dff",
    "--gold": "#ff6b9d",
    "--mint": "#9c27b0",
    "--cream": "#f8f0ff",
  },
  forest: {
    "--coral": "#2bb39c",
    "--gold": "#6bcb77",
    "--mint": "#1b7a5a",
    "--cream": "#f0faf5",
  },
  midnight: {
    "--coral": "#c44dff",
    "--gold": "#6b7fb7",
    "--mint": "#7c4dff",
    "--cream": "#1a1a2e",
    "--ink": "#e0e0e0",
    "--card": "#252540",
    "--border": "#3a3a5c",
  },
};

export default function WishPage() {
  const { id } = useParams();
  const [wish, setWish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchWish() {
      try {
        const res = await fetch(`/api/wish/${id}`);
        if (!res.ok) {
          throw new Error("Wish not found");
        }
        const data = await res.json();
        setWish(data);

        // Apply theme CSS custom properties
        const themeVars = THEME_STYLES[data.theme] || THEME_STYLES.sunrise;
        Object.entries(themeVars).forEach(([prop, val]) => {
          document.documentElement.style.setProperty(prop, val);
        });

        // Merge flair birthstone color into theme
        if (data.flair?.birthstoneColor) {
          document.documentElement.style.setProperty(
            "--birthstone",
            data.flair.birthstoneColor
          );
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchWish();

    // Reset theme on unmount
    return () => {
      const defaults = THEME_STYLES.sunrise;
      Object.entries(defaults).forEach(([prop, val]) => {
        document.documentElement.style.setProperty(prop, val);
      });
    };
  }, [id]);

  if (loading) {
    return (
      <div className="page wish-page">
        <div className="skeleton">
          <div className="skeleton__avatar" />
          <div className="skeleton__line skeleton__line--short" />
          <div className="skeleton__line skeleton__line--long" />
          <div className="skeleton__line skeleton__line--medium" />
          <div className="skeleton__gift" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page wish-page">
        <div className="wish-error">
          <h2>Oops!</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!wish) return null;

  return (
    <div className="page wish-page">
      <ExperienceOrchestrator wish={wish} />
    </div>
  );
}
