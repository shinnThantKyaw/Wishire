import { useState } from "react";
import { useNavigate } from "react-router-dom";

const RELATIONSHIPS = ["friend", "family", "coworker", "partner"];

const THEMES = [
  { id: "sunrise", label: "Sunrise", colors: ["#ff6f59", "#ffb84d", "#fff8ef"] },
  { id: "ocean", label: "Ocean", colors: ["#4d96ff", "#6bcb77", "#e8f4f8"] },
  { id: "lavender", label: "Lavender", colors: ["#c44dff", "#ff6b9d", "#f8f0ff"] },
  { id: "forest", label: "Forest", colors: ["#2bb39c", "#6bcb77", "#f0faf5"] },
  { id: "midnight", label: "Midnight", colors: ["#4d4d7a", "#c44dff", "#1a1a2e"] },
];

export default function CreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    senderName: "",
    recipientName: "",
    relationship: "friend",
    month: 6,
    day: 15,
    message: "",
    theme: "sunrise",
  });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handlePhotoSelect(e) {
    const files = Array.from(e.target.files);
    if (files.length + photos.length > 5) {
      setError("Maximum 5 photos allowed");
      return;
    }
    setPhotos((prev) => [...prev, ...files]);
    setError(null);
  }

  function removePhoto(index) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadPhotos() {
    if (photos.length === 0) return [];

    const formData = new FormData();
    photos.forEach((photo) => formData.append("photos", photo));

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to upload photos");
    }

    return res.json();
  }

  async function generate(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Client-side validation
      if (!form.senderName.trim()) {
        throw new Error("Your name is required.");
      }
      if (!form.recipientName.trim()) {
        throw new Error("Their name is required.");
      }
      if (!form.message.trim()) {
        throw new Error("Please write a birthday message.");
      }
      if (form.month < 1 || form.month > 12) {
        throw new Error("Birth month must be 1-12.");
      }
      if (form.day < 1 || form.day > 31) {
        throw new Error("Birth day must be 1-31.");
      }

      // Upload photos first if any
      let uploadedPhotos = [];
      if (photos.length > 0) {
        setUploadProgress("Uploading photos...");
        uploadedPhotos = await uploadPhotos();
      }

      // Create wish
      setUploadProgress("Creating wish...");
      const res = await fetch("/api/wish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          senderName: form.senderName.trim(),
          recipientName: form.recipientName.trim(),
          message: form.message.trim(),
          photos: uploadedPhotos,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not create wish. Try again.");
      }

      const wish = await res.json();
      navigate(`/wish/${wish.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  }

  return (
    <div className="page">
      <header className="hero">
        <span className="hero__eyebrow">🎂 small batch, freshly generated</span>
        <h1>Birthday Wish Generator</h1>
        <p>Write a heartfelt birthday message and share it as an experience.</p>
      </header>

      <form className="card form" onSubmit={generate}>
        <div className="form__section">
          <h2 className="form__section-title">About You</h2>
          <label>
            Your name
            <input
              required
              value={form.senderName}
              onChange={(e) => update("senderName", e.target.value)}
              placeholder="e.g. Priya"
            />
          </label>
        </div>

        <div className="form__section">
          <h2 className="form__section-title">About Them</h2>
          <label>
            Their name
            <input
              required
              value={form.recipientName}
              onChange={(e) => update("recipientName", e.target.value)}
              placeholder="e.g. Rahul"
            />
          </label>

          <label>
            Relationship
            <select
              value={form.relationship}
              onChange={(e) => update("relationship", e.target.value)}
            >
              {RELATIONSHIPS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>

          <div className="form__row">
            <label>
              Birth month
              <input
                type="number"
                min="1"
                max="12"
                value={form.month}
                onChange={(e) => update("month", parseInt(e.target.value))}
              />
            </label>
            <label>
              Birth day
              <input
                type="number"
                min="1"
                max="31"
                value={form.day}
                onChange={(e) => update("day", parseInt(e.target.value))}
              />
            </label>
          </div>
        </div>

        <div className="form__section">
          <h2 className="form__section-title">Your Message</h2>
          <label>
            Write your birthday wish
            <textarea
              required
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              placeholder="Write something heartfelt, funny, or meaningful..."
              maxLength={1000}
              rows={5}
            />
            <span className="form__char-count">
              {form.message.length}/1000
            </span>
          </label>
        </div>

        <div className="form__section">
          <h2 className="form__section-title">Photos (optional)</h2>
          <div className="form__photo-upload">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={handlePhotoSelect}
              id="photo-input"
              className="form__photo-input"
            />
            <label htmlFor="photo-input" className="form__photo-label">
              {photos.length === 0
                ? "Click to add photos (max 5)"
                : `Add more photos (${photos.length}/5)`}
            </label>
          </div>

          {photos.length > 0 && (
            <div className="form__photo-preview">
              {photos.map((photo, index) => (
                <div key={index} className="form__photo-thumb">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Photo ${index + 1}`}
                  />
                  <button
                    type="button"
                    className="form__photo-remove"
                    onClick={() => removePhoto(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form__section">
          <h2 className="form__section-title">Theme</h2>
          <div className="form__themes">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`form__theme-btn ${form.theme === t.id ? "form__theme-btn--active" : ""}`}
                onClick={() => update("theme", t.id)}
              >
                <span className="form__theme-preview">
                  {t.colors.map((c, i) => (
                    <span
                      key={i}
                      className="form__theme-swatch"
                      style={{ background: c }}
                    />
                  ))}
                </span>
                <span className="form__theme-label">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="error">{error}</p>}
        {uploadProgress && <p className="upload-progress">{uploadProgress}</p>}

        <button type="submit" disabled={loading}>
          {loading ? uploadProgress || "Creating..." : "Create Wish 🎁"}
        </button>
      </form>
    </div>
  );
}
