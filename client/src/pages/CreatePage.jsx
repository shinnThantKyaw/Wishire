import { useState } from "react";
import PhotoUploader from "../components/create/PhotoUploader.jsx";
import ThemeSelector from "../components/create/ThemeSelector.jsx";

const RELATIONSHIPS = ["friend", "family", "coworker", "partner"];

export default function CreatePage() {
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
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [createdWish, setCreatedWish] = useState(null);
  const [copied, setCopied] = useState(false);

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
      const res = await fetch("/api/wish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          senderName: form.senderName.trim() || "",
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
      setCreatedWish(wish);
    } catch (err) {
      setErrors((prev) => ({ ...prev, global: err.message }));
    } finally {
      setLoading(false);
      setUploadProgress(null);
    }
  }

  function getWishUrl() {
    return `${window.location.origin}/wish/${createdWish.id}`;
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(getWishUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.createElement("input");
      input.value = getWishUrl();
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function openLink() {
    window.open(getWishUrl(), "_blank");
  }

  if (createdWish) {
    return (
      <div className="page">
        <div className="card success">
          <span className="success__icon">&#10003;</span>
          <h1>Wish Created!</h1>
          <p>
            Your birthday wish for <strong>{createdWish.recipientName}</strong> is
            ready to share.
          </p>
          <div className="success__link">
            <code>{getWishUrl()}</code>
          </div>
          <div className="success__actions">
            <button className="success__btn success__btn--primary" onClick={openLink}>
              Open Link
            </button>
            <button className="success__btn success__btn--secondary" onClick={copyLink}>
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
          <button
            className="success__back"
            onClick={() => {
              setCreatedWish(null);
              setCopied(false);
            }}
          >
            Create another wish
          </button>
        </div>
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
          <h2 className="form__section-title">About You</h2>
          <label>
            Your name (optional)
            <input
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
              value={form.recipientName}
              onChange={(e) => update("recipientName", e.target.value)}
              placeholder="e.g. Rahul"
              className={errors.recipientName ? "form__input--error" : ""}
            />
            {errors.recipientName && (
              <span className="form__field-error">{errors.recipientName}</span>
            )}
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
                className={errors.month ? "form__input--error" : ""}
              />
              {errors.month && (
                <span className="form__field-error">{errors.month}</span>
              )}
            </label>
            <label>
              Birth day
              <input
                type="number"
                min="1"
                max="31"
                value={form.day}
                onChange={(e) => update("day", parseInt(e.target.value))}
                className={errors.day ? "form__input--error" : ""}
              />
              {errors.day && (
                <span className="form__field-error">{errors.day}</span>
              )}
            </label>
          </div>
        </div>

        <div className="form__section">
          <h2 className="form__section-title">Your Message</h2>
          <label>
            Write your birthday wish
            <textarea
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              placeholder="Write something heartfelt, funny, or meaningful..."
              maxLength={1000}
              rows={5}
              className={errors.message ? "form__input--error" : ""}
            />
            {errors.message && (
              <span className="form__field-error">{errors.message}</span>
            )}
            <span className="form__char-count">
              {form.message.length}/1000
            </span>
          </label>
        </div>

        <div className="form__section">
          <h2 className="form__section-title">Photos (optional)</h2>
          <PhotoUploader photos={photos} onPhotosChange={setPhotos} maxFiles={5} />
        </div>

        <div className="form__section">
          <h2 className="form__section-title">Theme</h2>
          <ThemeSelector value={form.theme} onChange={(id) => update("theme", id)} />
        </div>

        {errors.global && <p className="error">{errors.global}</p>}
        {uploadProgress && <p className="upload-progress">{uploadProgress}</p>}

        <button type="submit" disabled={loading}>
          {loading ? uploadProgress || "Creating..." : "Create Wish"}
        </button>
      </form>
    </div>
  );
}
