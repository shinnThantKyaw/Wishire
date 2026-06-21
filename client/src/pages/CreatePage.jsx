import { useState } from "react";
import { User, Heart, Cake, MessageSquare, Camera, Palette, Sparkles, Loader2 } from "lucide-react";
import PhotoUploader from "../components/create/PhotoUploader.jsx";
import ThemeSelector from "../components/create/ThemeSelector.jsx";
import SuccessState from "../components/create/SuccessState.jsx";

const RELATIONSHIPS = [
  { id: "friend", emoji: "🤝", label: "Friend" },
  { id: "family", emoji: "🏠", label: "Family" },
  { id: "coworker", emoji: "💼", label: "Coworker" },
  { id: "partner", emoji: "💕", label: "Partner" },
  { id: "custom", emoji: "✏️", label: "Other" },
];

export default function CreatePage() {
  const [form, setForm] = useState({
    senderName: "",
    recipientName: "",
    relationship: "friend",
    customRelationship: "",
    month: 6,
    day: 15,
    message: "",
    theme: "sunrise",
  });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [createdWish, setCreatedWish] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    // Clear field error on change if form was already submitted
    if (submitted && errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  }

  function validate(field, value) {
    switch (field) {
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

    // Client-side validation
    const newErrors = {};
    newErrors.recipientName = validate("recipientName", form.recipientName);
    newErrors.month = validate("month", form.month);
    newErrors.day = validate("day", form.day);
    newErrors.message = validate("message", form.message);

    // Remove empty errors
    const hasErrors = Object.values(newErrors).some(Boolean);
    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setUploadProgress(null);

    try {
      // Upload photos first if any
      let uploadedPhotos = [];
      if (photos.length > 0) {
        setUploadProgress("Uploading photos...");
        uploadedPhotos = await uploadPhotos();
      }

      // Create wish
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
        throw new Error(data.error || "Could not create wish. Try again.");
      }

      const wish = await res.json();
      setCreatedWish(wish);
    } catch (err) {
      setErrors((prev) => ({ ...prev, global: err.message }));
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  }

  if (createdWish) {
    return (
      <div className="page">
        <SuccessState
          wish={createdWish}
          onReset={() => {
            setCreatedWish(null);
            setForm({
              senderName: "",
              recipientName: "",
              relationship: "friend",
              customRelationship: "",
              month: 6,
              day: 15,
              message: "",
              theme: "sunrise",
            });
            setPhotos([]);
            setErrors({});
            setSubmitted(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="page">
      <header className="hero">
        <span className="hero__eyebrow">small batch, freshly generated</span>
        <h1>Birthday Wish Generator</h1>
        <p>Write a heartfelt birthday message and share it as an experience.</p>
      </header>

      <form className="card form" onSubmit={generate}>
        <div className="form__section">
          <h2 className="form__section-title"><User size={18} /> About You</h2>
          <label>
            Your name (optional)
            <div className="form__input-wrap">
              <User size={16} className="form__icon" />
              <input
                value={form.senderName}
                onChange={(e) => update("senderName", e.target.value)}
                placeholder="e.g. Priya"
              />
            </div>
          </label>
        </div>

        <div className="form__section form__section--spacious">
          <h2 className="form__section-title"><Heart size={18} /> About Them</h2>
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

        <div className="form__section">
          <h2 className="form__section-title"><MessageSquare size={18} /> Your Message</h2>
          <label>
            Write your birthday wish
            <div className="form__textarea-wrap">
              <MessageSquare size={16} className="form__icon" />
              <textarea
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                placeholder="Write something heartfelt, funny, or meaningful..."
                maxLength={1000}
                rows={5}
                className={errors.message ? "form__input--error" : ""}
              />
            </div>
            {errors.message && (
              <span className="form__field-error">{errors.message}</span>
            )}
            <span className="form__char-count">
              {form.message.length}/1000
            </span>
          </label>
        </div>

        <div className="form__section">
          <h2 className="form__section-title"><Camera size={18} /> Photos (optional)</h2>
          <PhotoUploader photos={photos} onPhotosChange={setPhotos} maxFiles={5} />
        </div>

        <div className="form__section">
          <h2 className="form__section-title"><Palette size={18} /> Theme</h2>
          <ThemeSelector value={form.theme} onChange={(id) => update("theme", id)} />
        </div>

        {errors.global && <p className="error">{errors.global}</p>}

        <button type="submit" disabled={loading} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          {loading ? <Loader2 size={18} className="spin" /> : <Sparkles size={18} />}
          {loading ? uploadProgress || "Creating..." : "Create Wish"}
        </button>
      </form>
    </div>
  );
}
