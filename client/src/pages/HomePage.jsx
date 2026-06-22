import { useNavigate } from "react-router-dom";
import HeroBackground from "../components/home/HeroBackground";
import CTAButton from "../components/home/CTAButton";

const STEPS = [
  { emoji: "✍️", label: "Write", desc: "Write a heartfelt message" },
  { emoji: "🔗", label: "Share", desc: "Get a shareable link" },
  { emoji: "🎉", label: "Surprise", desc: "They experience the magic" },
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

      <section className="home__how">
        <h2 className="home__how-title">✨ How It Works</h2>
        <div className="home__steps">
          {STEPS.map((step, i) => (
            <div key={step.label} className="home__step">
              <span className="home__step-emoji">{step.emoji}</span>
              <span className="home__step-label">{step.label}</span>
              <span className="home__step-desc">{step.desc}</span>
              {i < STEPS.length - 1 && (
                <span className="home__step-arrow">→</span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
