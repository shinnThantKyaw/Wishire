export const THEMES = [
  { id: "lavender",  label: "Lavender",  primary: "#a855f7", secondary: "#d946ef", surface: "#faf5ff" },
  { id: "sunrise",   label: "Sunrise",   primary: "#f97316", secondary: "#fbbf24", surface: "#fff7ed" },
  { id: "ocean",     label: "Ocean",     primary: "#0ea5e9", secondary: "#38bdf8", surface: "#f0f9ff" },
  { id: "forest",    label: "Forest",    primary: "#10b981", secondary: "#34d399", surface: "#ecfdf5" },
  { id: "rose",      label: "Rose",      primary: "#f43f5e", secondary: "#fb7185", surface: "#fff1f2" },
  { id: "midnight",  label: "Midnight",  primary: "#6366f1", secondary: "#818cf8", surface: "#eef2ff" },
  { id: "amber",     label: "Amber",     primary: "#d97706", secondary: "#f59e0b", surface: "#fffbeb" },
  { id: "teal",      label: "Teal",      primary: "#14b8a6", secondary: "#2dd4bf", surface: "#f0fdfa" },
  { id: "fuchsia",   label: "Fuchsia",   primary: "#c026d3", secondary: "#e879f9", surface: "#fdf4ff" },
  { id: "sky",       label: "Sky",       primary: "#0284c7", secondary: "#38bdf8", surface: "#f0f9ff" },
  { id: "emerald",   label: "Emerald",   primary: "#059669", secondary: "#34d399", surface: "#ecfdf5" },
  { id: "slate",     label: "Slate",     primary: "#475569", secondary: "#94a3b8", surface: "#f8fafc" },
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
              style={{ backgroundColor: t.surface, border: "1px solid #e5e7eb" }}
            />
          </div>
          <span className="theme-selector__name">{t.label}</span>
        </button>
      ))}
    </div>
  );
}
