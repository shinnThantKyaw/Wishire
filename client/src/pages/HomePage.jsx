import { useNavigate } from "react-router-dom";
import { PenLine, Share2, Gift, Camera, Mail, PartyPopper } from "lucide-react";
import HeroBackground from "../components/home/HeroBackground";
import CTAButton from "../components/home/CTAButton";

const STEPS = [
  {
    icon: PenLine,
    label: "Create",
    lines: ["Write your message,", "add photos & choose a theme"],
  },
  {
    icon: Share2,
    label: "Share",
    lines: ["Send a private", "birthday link"],
  },
  {
    icon: PartyPopper,
    label: "Open & Celebrate",
    lines: ["They unwrap the surprise,", "view memories and read your letter"],
    highlight: true,
  },
];

const PREVIEWS = [
  { icon: Gift,  title: "Gift Opening",      desc: "Tap to unwrap the surprise" },
  { icon: Camera, title: "Memory Slideshow",   desc: "Photos fade in beautifully" },
  { icon: Mail,  title: "Love Letter",        desc: "Animated typewriter reveal" },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="page page--home">
      <HeroBackground />

      <header className="hero hero--home">
        <img
          src="/assets/images/Icon.png"
          alt="Wishire"
          className="hero__logo hero__logo--large"
        />

        <p className="hero__brand-tagline">The Birthday Wish Maker</p>

        <h1 className="hero__title">
          <span className="hero__title-line">Beautiful Wishes,</span>
          <span className="hero__title-line hero__title-line--accent">
            Made With Love ❤️
          </span>
        </h1>

        <p className="hero__desc">
          Transform your words into a magical
          <br />
          birthday experience with photos,
          <br />
          music, confetti and surprises.
        </p>

        <CTAButton onClick={() => navigate("/create")} />
      </header>

      {/* ── How It Works ── */}
      <section className="how">
        <div className="how__header">
          <h2 className="how__title">How It Works</h2>
          <p className="how__subtitle">
            Create a memorable birthday surprise in under 2 minutes
          </p>
        </div>

        <div className="how__steps">
          {STEPS.map((step, i) => {
            const StepIcon = step.icon;
            return (
              <div key={step.label} className={`how__step${step.highlight ? " how__step--highlight" : ""}`}>
                <div className="how__step-icon">
                  <StepIcon size={24} strokeWidth={1.8} />
                </div>
                <span className="how__step-label">{step.label}</span>
                <div className="how__step-desc">
                  {step.lines.map((line, j) => (
                    <span key={j}>{line}</span>
                  ))}
                </div>
                {i < STEPS.length - 1 && <div className="how__connector" />}
              </div>
            );
          })}
        </div>

        {/* Preview cards */}
        <div className="how__previews">
          {PREVIEWS.map((p) => {
            const PreviewIcon = p.icon;
            return (
              <div key={p.title} className="how__preview-card">
                <span className="how__preview-icon">
                  <PreviewIcon size={28} strokeWidth={1.6} />
                </span>
                <span className="how__preview-title">{p.title}</span>
                <span className="how__preview-desc">{p.desc}</span>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="how__cta">
          <button
            type="button"
            className="how__cta-btn"
            onClick={() => navigate("/create")}
          >
            Create Your Wish ✨
          </button>
          <span className="how__cta-note">No signup required</span>
        </div>
      </section>
    </div>
  );
}
