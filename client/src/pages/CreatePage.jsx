import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { User, Heart, Cake, MessageSquare, Camera, Palette, Sparkles, Loader2 } from "lucide-react";
import PhotoUploader from "../components/create/PhotoUploader.jsx";
import ThemeSelector from "../components/create/ThemeSelector.jsx";

const RELATIONSHIPS = [
  { id: "friend", emoji: "🤝", label: "Friend" },
  { id: "family", emoji: "🏠", label: "Family" },
  { id: "coworker", emoji: "💼", label: "Coworker" },
  { id: "partner", emoji: "💕", label: "Partner" },
  { id: "custom", emoji: "✏️", label: "Other" },
];

const JOURNEY = [
  { icon: "👤", label: "About You" },
  { icon: "💖", label: "About Them" },
  { icon: "🎨", label: "Customize" },
  { icon: "✨", label: "Generate" },
];

const FEATURES = [
  { emoji: "✨", label: "Photos" },
  { emoji: "🎵", label: "Music" },
  { emoji: "🎁", label: "Surprises" },
];

export default function CreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    senderName: "",
    recipientName: "",
    relationship: "friend",
    customRelationship: "",
    month: 6,
    day: 15,
    message: "",
    theme: "lavender",
  });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [toast, setToast] = useState(null); // { message, type }

  const showToast = useCallback((message, type = "error") => {
    setToast({ message, type, _key: Date.now() });
  }, []);

  // Auto-dismiss toast after 4s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (submitted && errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  }

  function validate(field, value) {
    switch (field) {
      case "senderName":
        return value.trim() ? "" : "Your name is required";
      case "recipientName":
        return value.trim() ? "" : "Their name is required";
      case "month":
        return value >= 1 && value <= 12 ? "" : "Birth month must be 1-12";
      case "day":
        return value >= 1 && value <= 31 ? "" : "Birth day must be 1-31";
      case "message":
        return value.trim() ? "" : "Please write a birthday message";
      default:
        return "";
    }
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
    setSubmitted(true);
    setErrors({});

    const newErrors = {};
    newErrors.senderName = validate("senderName", form.senderName);
    newErrors.recipientName = validate("recipientName", form.recipientName);
    newErrors.month = validate("month", form.month);
    newErrors.day = validate("day", form.day);
    newErrors.message = validate("message", form.message);

    const hasErrors = Object.values(newErrors).some(Boolean);
    if (hasErrors) {
      setErrors(newErrors);
      const missing = Object.entries(newErrors)
        .filter(([, v]) => v)
        .map(([, v]) => v);
      showToast(missing.join(". "));
      return;
    }

    setLoading(true);
    setUploadProgress(null);

    try {
      let uploadedPhotos = [];
      if (photos.length > 0) {
        setUploadProgress("Uploading photos...");
        uploadedPhotos = await uploadPhotos();
      }

      setUploadProgress("Creating wish...");
      const resolvedRelationship =
        form.relationship === "custom"
          ? form.customRelationship.trim()
          : form.relationship;
      const res = await fetch("/api/wish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          senderName: form.senderName.trim() || "",
          recipientName: form.recipientName.trim(),
          relationship: resolvedRelationship,
          message: form.message.trim(),
          photos: uploadedPhotos,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // If the server returned per-field errors, map them inline + toast
        if (data.fields && data.fields.length) {
          const fieldErrors = {};
          const messages = [];
          for (const f of data.fields) {
            if (f === "senderName") { fieldErrors.senderName = "Your name is required"; messages.push("Your name is required"); }
            if (f === "recipientName") { fieldErrors.recipientName = "Their name is required"; messages.push("Their name is required"); }
            if (f === "message") { fieldErrors.message = "Please write a birthday message"; messages.push("Please write a birthday message"); }
          }
          setErrors(fieldErrors);
          showToast(messages.join(". "));
          return;
        }
        throw new Error(data.error || "Could not create wish. Try again.");
      }

      const wish = await res.json();
      navigate(`/success/${wish.id}`);
    } catch (err) {
      showToast(err.message);
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  }

  return (
    <>
      {/* Toast — fixed at top, outside form so scroll doesn't affect it */}
      {toast && (
        <div className={`toast toast--${toast.type}`} role="alert">
          <div className="toast__body">
            <span className="toast__icon">{toast.type === "error" ? "⚠️" : "✅"}</span>
            <span className="toast__msg">{toast.message}</span>
            <button className="toast__close" onClick={() => setToast(null)} aria-label="Dismiss">✕</button>
          </div>
          <div className="toast__progress-track">
            <div className="toast__progress-bar" key={toast._key} />
          </div>
        </div>
      )}

      {/* Background decorations — outside animated container for fixed positioning */}
      <div className="create-bg" aria-hidden="true">
        <div className="create-bg__gradient" />
        <div className="create-bg__orb create-bg__orb--1" />
        <div className="create-bg__orb create-bg__orb--2" />
        <div className="create-bg__orb create-bg__orb--3" />
        <span className="create-bg__deco create-bg__deco--1">✨</span>
        <span className="create-bg__deco create-bg__deco--2">💜</span>
        <span className="create-bg__deco create-bg__deco--3">🌟</span>
        <span className="create-bg__deco create-bg__deco--4">🌸</span>
        <span className="create-bg__deco create-bg__deco--5">✨</span>
        <span className="create-bg__deco create-bg__deco--6">💜</span>
        <span className="create-bg__deco create-bg__deco--7">🌸</span>
        <span className="create-bg__deco create-bg__deco--8">🌟</span>
        <span className="create-bg__deco create-bg__deco--9">✨</span>
        <span className="create-bg__deco create-bg__deco--10">💜</span>
        <span className="create-bg__deco create-bg__deco--11">🌸</span>
        <span className="create-bg__deco create-bg__deco--12">🌟</span>
      </div>
    <div className="page page--create">

      {/* ── Hero ── */}
      <div className="create-hero">
        <img
          src="/assets/images/Icon.png"
          alt="Wishire"
          className="create-hero__logo"
        />
        <h1 className="create-hero__title">Create a Birthday Surprise</h1>
        <p className="create-hero__subtitle">
          Turn your words, photos, and memories into a magical birthday experience.
        </p>

        {/* Progress journey */}
        <div className="create-journey">
          {JOURNEY.map((step, i) => (
            <div key={step.label} className="create-journey__step">
              <span className="create-journey__icon">{step.icon}</span>
              <span className="create-journey__label">{step.label}</span>
              {i < JOURNEY.length - 1 && <div className="create-journey__arrow" />}
            </div>
          ))}
        </div>

        {/* Feature chips */}
        <div className="create-features">
          {FEATURES.map((f) => (
            <span key={f.label} className="create-features__chip">
              {f.emoji} {f.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Form ── */}
      <form className="create-card form" onSubmit={generate}>
        <div className="form__section form__section--about-you">
          <h2 className="form__section-title"><span className="form__section-icon"><User size={16} /></span> About You</h2>
          <p className="form__section-helper">✨ Your message starts here</p>
          <label>
            Your name
            <div className="form__input-wrap">
              <User size={16} className="form__icon" />
              <input
                value={form.senderName}
                onChange={(e) => update("senderName", e.target.value)}
                placeholder="e.g. Priya"
                className={errors.senderName ? "form__input--error" : ""}
              />
            </div>
            {errors.senderName && (
              <span className="form__field-error">{errors.senderName}</span>
            )}
          </label>
        </div>

        <div className="form__section form__section--about-them form__section--spacious">
          <h2 className="form__section-title"><span className="form__section-icon"><Heart size={16} /></span> About Them</h2>
          <p className="form__section-helper">🎂 Let's make them smile</p>
          <label>
            Their name
            <div className="form__input-wrap">
              <Heart size={16} className="form__icon" />
              <input
                value={form.recipientName}
                onChange={(e) => update("recipientName", e.target.value)}
                placeholder="e.g. Rahul"
                className={errors.recipientName ? "form__input--error" : ""}
              />
            </div>
            {errors.recipientName && (
              <span className="form__field-error">{errors.recipientName}</span>
            )}
          </label>

          <label>
            Relationship
            <div className="relationship-picker">
              {RELATIONSHIPS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={
                    "relationship-picker__btn" +
                    (form.relationship === r.id ? " relationship-picker__btn--active" : "")
                  }
                  onClick={() => update("relationship", r.id)}
                >
                  <span className="relationship-picker__emoji">{r.emoji}</span>
                  <span className="relationship-picker__label">{r.label}</span>
                </button>
              ))}
            </div>
            {form.relationship === "custom" && (
              <div className="form__custom-rel">
                <span className="form__custom-rel-label">Your relationship</span>
                <div className="form__input-wrap">
                  <Heart size={16} className="form__icon" />
                  <input
                    value={form.customRelationship}
                    onChange={(e) => update("customRelationship", e.target.value)}
                    placeholder="e.g. Bestie, Neighbor, Coach..."
                  />
                </div>
              </div>
            )}
          </label>

          <div className="form__row">
            <label>
              Birth month
              <div className="form__input-wrap">
                <Cake size={16} className="form__icon" />
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={form.month}
                  onChange={(e) => update("month", parseInt(e.target.value))}
                  className={errors.month ? "form__input--error" : ""}
                />
              </div>
              {errors.month && (
                <span className="form__field-error">{errors.month}</span>
              )}
            </label>
            <label>
              Birth day
              <div className="form__input-wrap">
                <Cake size={16} className="form__icon" />
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={form.day}
                  onChange={(e) => update("day", parseInt(e.target.value))}
                  className={errors.day ? "form__input--error" : ""}
                />
              </div>
              {errors.day && (
                <span className="form__field-error">{errors.day}</span>
              )}
            </label>
          </div>
        </div>

        <div className="form__section form__section--message">
          <h2 className="form__section-title"><span className="form__section-icon"><MessageSquare size={16} /></span> Your Message</h2>
          <p className="form__section-helper">💌 From your heart to theirs</p>
          <label>
            Write your birthday wish
            <div className="form__textarea-wrap">
              <MessageSquare size={16} className="form__icon" />
              <textarea
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                placeholder="Write something heartfelt, funny, or meaningful..."
                maxLength={10000}
                rows={5}
                className={errors.message ? "form__input--error" : ""}
              />
            </div>
            {errors.message && (
              <span className="form__field-error">{errors.message}</span>
            )}
            <span className="form__char-count">
              {form.message.length}/10000
            </span>
          </label>
        </div>

        <div className="form__section form__section--photos">
          <h2 className="form__section-title"><span className="form__section-icon"><Camera size={16} /></span> Photos (optional)</h2>
          <p className="form__section-helper">📸 Add memories they'll treasure</p>
          <PhotoUploader photos={photos} onPhotosChange={setPhotos} maxFiles={5} />
        </div>

        <div className="form__section form__section--theme">
          <h2 className="form__section-title"><span className="form__section-icon"><Palette size={16} /></span> Theme</h2>
          <p className="form__section-helper">🎨 Set the mood for their surprise</p>
          <ThemeSelector value={form.theme} onChange={(id) => update("theme", id)} />
        </div>

        <button className="create-submit" type="submit" disabled={loading}>
          {loading ? <Loader2 size={18} className="spin" /> : <Sparkles size={18} />}
          {loading ? uploadProgress || "Creating..." : "Create Wish ✨"}
        </button>
      </form>
    </div>
    </>
  );
}
