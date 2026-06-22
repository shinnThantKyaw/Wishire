import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PartyPopper, Copy, ExternalLink, ArrowLeft, Check, Sparkles } from "lucide-react";
import { THEMES } from "../components/create/ThemeSelector.jsx";

/* ── Confetti burst ── */

const CONFETTI_COLORS = ["#BE83E5", "#f472b6", "#a78bfa", "#fbbf24", "#34d399", "#E9A0F9", "#FFB9E7"];
const CONFETTI_COUNT = 50;

function spawnConfetti(container) {
  if (!container) return;
  for (let i = 0; i < CONFETTI_COUNT; i++) {
    const piece = document.createElement("span");
    piece.className = "success-confetti";
    piece.style.setProperty("--cx", `${Math.random() * 100}%`);
    piece.style.setProperty("--cy", `${-10 - Math.random() * 20}%`);
    piece.style.setProperty("--tx", `${(Math.random() - 0.5) * 250}px`);
    piece.style.setProperty("--ty", `${350 + Math.random() * 250}px`);
    piece.style.setProperty("--rot", `${Math.random() * 720 - 360}deg`);
    piece.style.setProperty("--delay", `${Math.random() * 0.5}s`);
    piece.style.setProperty("--dur", `${1.2 + Math.random() * 0.8}s`);
    piece.style.setProperty("--size", `${4 + Math.random() * 6}px`);
    piece.style.backgroundColor = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    container.appendChild(piece);
  }
  setTimeout(() => { container.innerHTML = ""; }, 3000);
}

/* ── Component ── */

export default function SuccessPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [wish, setWish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const confettiRef = useRef(null);

  useEffect(() => {
    fetch(`/api/wish/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Wish not found");
        return res.json();
      })
      .then((data) => {
        setWish(data);
        setTimeout(() => spawnConfetti(confettiRef.current), 400);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  function getWishUrl() {
    return `${window.location.origin}/wish/${id}`;
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(getWishUrl());
    } catch {
      const input = document.createElement("input");
      input.value = getWishUrl();
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const firstLine = wish
    ? wish.message.split(/(?<=[.!?])\s+/)[0] || wish.message
    : "";

  const themePrimary = wish
    ? THEMES.find((t) => t.id === wish.theme)?.primary || "#BE83E5"
    : "#BE83E5";

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="page page--success">
        <div className="success-bg" aria-hidden="true">
          <div className="success-bg__gradient" />
        </div>
        <div className="success-loading">
          <div className="success-loading__icon">
            <Sparkles size={28} />
          </div>
          <p className="success-loading__text">Preparing your wish…</p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !wish) {
    return (
      <div className="page page--success">
        <div className="success-bg" aria-hidden="true">
          <div className="success-bg__gradient" />
        </div>
        <div className="success-error">
          <span className="success-error__icon">😔</span>
          <h2 className="success-error__title">Wish not found</h2>
          <p className="success-error__text">This wish may have expired or the link is incorrect.</p>
          <button className="success-error__btn" onClick={() => navigate("/create")}>
            Create a new wish
          </button>
        </div>
      </div>
    );
  }

  /* ── Success ── */
  return (
    <div className="page page--success">
      {/* Background */}
      <div className="success-bg" aria-hidden="true">
        <div className="success-bg__gradient" />
        <div className="success-bg__orb success-bg__orb--1" />
        <div className="success-bg__orb success-bg__orb--2" />
        <span className="success-bg__deco success-bg__deco--1">✨</span>
        <span className="success-bg__deco success-bg__deco--2">💜</span>
        <span className="success-bg__deco success-bg__deco--3">🌸</span>
        <span className="success-bg__deco success-bg__deco--4">✨</span>
        <span className="success-bg__deco success-bg__deco--5">💜</span>
        <span className="success-bg__deco success-bg__deco--6">🌟</span>
      </div>

      {/* Confetti */}
      <div className="success-confetti-container" ref={confettiRef} aria-hidden="true" />

      <div className="success-content">
        {/* App logo */}
        <img
          src="/assets/images/Icon.png"
          alt="Wishire"
          className="success-logo"
        />

        {/* Headline with celebration icon */}
        <div className="success-header">
          <div className="success-celebrate">
            <div className="success-celebrate__icon">
              <PartyPopper size={28} strokeWidth={1.8} />
            </div>
          </div>
          <div className="success-header__text">
            <h1 className="success-title">Your Wish is Ready!</h1>
            <p className="success-subtitle">
              A magical birthday surprise for <strong>{wish.recipientName}</strong> ✨
            </p>
          </div>
        </div>

        {/* Share card */}
        <div className="success-card">
          <div className="success-card__header">
            <span className="success-card__emoji">🎂</span>
            <div className="success-card__info">
              <span className="success-card__name">{wish.recipientName}'s Birthday Wish</span>
              <span className="success-card__theme" style={{ color: themePrimary }}>
                {wish.theme} theme
              </span>
            </div>
          </div>
          <p className="success-card__message">"{firstLine}"</p>
          <div className="success-card__accent" style={{ background: themePrimary }} />
        </div>

        {/* Link display */}
        <div className="success-link">
          <div className="success-link__url">
            <span className="success-link__icon">🔗</span>
            <code className="success-link__code">{getWishUrl()}</code>
          </div>
        </div>

        {/* Actions */}
        <div className="success-actions">
          <button
            className={`success-btn success-btn--primary${copied ? " success-btn--copied" : ""}`}
            onClick={copyLink}
          >
            {copied ? <Check size={18} strokeWidth={3} /> : <Copy size={16} />}
            {copied ? "Copied!" : "Copy Link"}
          </button>

          <button
            className="success-btn success-btn--secondary"
            onClick={() => window.open(`/wish/${id}`, "_blank")}
          >
            <ExternalLink size={16} />
            Preview Wish
          </button>
        </div>

        {/* Subtle back action */}
        <button className="success-back" onClick={() => navigate("/create")}>
          <ArrowLeft size={14} />
          Create another wish
        </button>
      </div>
    </div>
  );
}
