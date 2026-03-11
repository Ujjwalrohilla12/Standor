import { Link } from "react-router-dom";
import StandorLogo from "../StandorLogo";

function GithubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}

const FOOTER_LINKS = {
  home: [
    { label: "Code", href: "/problems" },
    { label: "Benefits", href: "/how-it-works" },
    { label: "FAQ", href: "/faq" },
  ],
  company: [
    { label: "Help center", href: "/docs" },
    { label: "About us", href: "/about" },
  ],
};

export function Footer() {
  return (
    <footer
      id="footer"
      className="w-full bg-black pt-20 pb-8 border-t border-white/[0.06]"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-20 mb-16">
          {/* Left: Brand & Contact */}
          <div className="flex flex-col gap-6 max-w-xl">
            <Link to="/" className="flex items-center gap-3 group">
              <StandorLogo size={40} className="transition-transform duration-300 group-hover:scale-110" />
              <span className="text-white font-bold text-2xl tracking-tight italic">
                Standor
              </span>
            </Link>
            <p className="text-white/65 text-[1.05rem] leading-relaxed max-w-lg">
              AI-powered technical interview platform for modern engineering teams.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8 pt-1">
              <a
                href="https://github.com/standor"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 text-white/80 hover:text-white text-sm font-medium transition-colors duration-200"
                aria-label="Contact on GitHub"
              >
                <GithubIcon size={16} /> Contact on GitHub
              </a>
              <a
                href="mailto:standorqinterview@gmail.com"
                className="text-white/70 hover:text-white text-sm font-medium transition-colors duration-200"
              >
                standorqinterview@gmail.com
              </a>
            </div>
          </div>

          {/* Right: Link Columns */}
          <div className="grid grid-cols-2 gap-x-14 gap-y-8 lg:pt-2 lg:ml-auto">
            <div>
              <h3 className="text-white/90 font-semibold text-xs uppercase tracking-[0.12em] mb-5">Home</h3>
              <ul className="space-y-3.5">
                {FOOTER_LINKS.home.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-white/60 hover:text-white text-sm transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white/90 font-semibold text-xs uppercase tracking-[0.12em] mb-5">Company</h3>
              <ul className="space-y-3.5">
                {FOOTER_LINKS.company.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-white/60 hover:text-white text-sm transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-white/[0.06] flex items-center justify-center">
          <p className="text-white/40 text-xs font-mono text-center tracking-wide">
            &copy; Copyright 2026 All rights reserved - Standor
          </p>
        </div>
      </div>
    </footer>
  );
}
