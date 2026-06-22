import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";

export default function Footer() {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={`footer-wrap${visible ? " footer-wrap--visible" : ""}`}>
      {/* Magic tagline — above the card */}
      <p className="footer__tagline-hero">
        🎂 Every birthday deserves a little magic ✨💜
      </p>

      <footer className="footer">
        {/* Edge sparkles */}
        <span className="footer__sparkle footer__sparkle--tl" aria-hidden="true">✨</span>
        <span className="footer__sparkle footer__sparkle--tr" aria-hidden="true">💜</span>
        <span className="footer__sparkle footer__sparkle--bl" aria-hidden="true">💜</span>
        <span className="footer__sparkle footer__sparkle--br" aria-hidden="true">✨</span>

        <div className="footer__inner">
          {/* Left — App branding */}
          <div className="footer__left">
            <img
              src="/assets/images/Icon.png"
              alt="Wishire"
              className="footer__logo"
            />
            <p className="footer__app-name">Birthday Wish Maker</p>
            <p className="footer__app-desc">
              Create beautiful wishes that make someone smile
            </p>
            <a
              href="https://github.com/ShinThantKyaw/birthday-wish-generator"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__github"
            >
              <ExternalLink size={14} />
              <span>See on GitHub</span>
            </a>
          </div>

          {/* Middle — Quote */}
          <div className="footer__quote-side">
            <div className="footer__quote-block">
              <span className="footer__quote-mark" aria-hidden="true">"</span>
              <p className="footer__quote">
                Turning wishes into memories,<br />
                one smile at a time.
              </p>
              <span className="footer__quote-tail" aria-hidden="true"> ✨💜</span>
              <span className="footer__quote-mark-end" aria-hidden="true">"</span>
            </div>
          </div>

          {/* Right — Creator signature */}
          <div className="footer__right">
            <img
              src="/assets/images/MySign.png"
              alt="Shin Thant Kyaw"
              className="footer__sign"
            />
            <p className="footer__made">
              Made with <span className="footer__heart" aria-hidden="true">❤️</span> by
            </p>
            <p className="footer__creator">Shin Thant Kyaw</p>
            <p className="footer__copy">© 2026 Wishire, Birthday Wish Maker</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
