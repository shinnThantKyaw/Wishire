export const THEMES = [
  { id: "sunrise", label: "Sunrise", primary: "#ff6f59", secondary: "#ffb84d", surface: "#fff8ef" },
  { id: "ocean", label: "Ocean", primary: "#4d96ff", secondary: "#6bcb77", surface: "#e8f4f8" },
  { id: "lavender", label: "Lavender", primary: "#c44dff", secondary: "#ff6b9d", surface: "#f8f0ff" },
  { id: "forest", label: "Forest", primary: "#2bb39c", secondary: "#6bcb77", surface: "#f0faf5" },
  { id: "midnight", label: "Midnight", primary: "#4d4d7a", secondary: "#c44dff", surface: "#1a1a2e" },
];

export default function ThemeSelector({ value, onChange }) {
  return (
    <div className="theme-selector">
      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          className={
            "theme-selector__btn" +
            (value === t.id ? " theme-selector__btn--active" : "")
          }
          onClick={() => onChange(t.id)}
          aria-label={t.label}
        >
          <div className="theme-selector__circles">
            <span
              className="theme-selector__circle"
              style={{ backgroundColor: t.primary }}
            />
            <span
              className="theme-selector__circle"
              style={{ backgroundColor: t.secondary }}
            />
            <span
              className="theme-selector__circle"
              style={{ backgroundColor: t.surface }}
            />
          </div>
          <span className="theme-selector__name">{t.label}</span>
        </button>
      ))}
    </div>
  );
}
