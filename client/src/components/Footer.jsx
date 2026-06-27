import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";

export default function Footer() {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const timer = setTimeout(() => setVisible(true), 2000);
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
          clearTimeout(timer);
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => { obs.disconnect(); clearTimeout(timer); };
  }, []);

  return (
    <div
      ref={ref}
      className={`relative z-2 w-full m-0 opacity-0 translate-y-5 transition-all duration-700 ease-[ease]${visible ? " opacity-100 translate-y-0" : ""}`}
    >
      {/* Magic tagline */}
      <p className="text-center font-body text-sm font-bold text-[#8B6DAF] m-0 mb-3.5 tracking-normal">
        🎂 Every birthday deserves a little magic ✨💜
      </p>

      <footer className="relative pt-3 pb-3 px-5 sm:px-8 md:px-12 rounded-t-[36px] bg-white border-t border-[rgba(233,160,249,0.15)] overflow-hidden">
        {/* Edge sparkles */}
        <span className="footer__sparkle footer__sparkle--tl" aria-hidden="true">✨</span>
        <span className="footer__sparkle footer__sparkle--tr" aria-hidden="true">💜</span>
        <span className="footer__sparkle footer__sparkle--bl" aria-hidden="true">💜</span>
        <span className="footer__sparkle footer__sparkle--br" aria-hidden="true">✨</span>

        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 sm:gap-10">
          {/* Left — App branding */}
          <div className="flex flex-col items-center sm:items-start gap-1 text-center sm:text-left">
            <img
              src="/assets/images/Icon.png"
              alt="Wishire"
              className="footer__logo"
            />
            <p className="font-display font-extrabold text-[0.85rem] tracking-[0.06em] uppercase text-[#8B6DAF] m-0">
              Birthday Wish Maker
            </p>
            <p className="font-body text-xs font-semibold text-[#7a6b94] m-0 mb-2 leading-[1.4]">
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

          {/* Middle — Quote (hidden on mobile) */}
          <div className="hidden sm:flex flex-1 justify-center">
            <div className="relative px-6 py-3 rounded-[18px] bg-gradient-to-br from-[rgba(233,160,249,0.08)] to-[rgba(217,124,246,0.04)] border border-[rgba(233,160,249,0.12)] text-center">
              <span className="footer__quote-mark" aria-hidden="true">"</span>
              <p className="font-body text-[0.9rem] font-bold italic leading-[1.55] text-[#5a3e7a] m-0">
                Turning wishes into memories,<br />
                one smile at a time.
              </p>
              <span className="footer__quote-tail" aria-hidden="true"> ✨💜</span>
              <span className="footer__quote-mark-end" aria-hidden="true">"</span>
            </div>
          </div>

          {/* Right — Creator signature */}
          <div className="flex flex-col items-center sm:items-end gap-0.5 text-center sm:text-right">
            <img
              src="/assets/images/MySign.png"
              alt="Shin Thant Kyaw"
              className="footer__sign"
            />
            <p className="font-body text-[0.78rem] font-semibold text-[#8B6DAF] m-0">
              Developed with <span className="footer__heart inline-block" aria-hidden="true">❤️</span> by
            </p>
            <p className="footer__creator">
              Shin Thant Kyaw
            </p>
            <p className="font-body text-[0.75rem] font-semibold text-[#9B7FC4] mt-1.5 m-0 opacity-70">
              © 2026 Wishire, Birthday Wish Maker
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
