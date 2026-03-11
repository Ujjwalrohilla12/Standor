import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowUpRight, Globe } from "lucide-react";

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

function LinkedinIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
import api from "../utils/api";
import { useTranslation, SupportedLocale } from "../hooks/useTranslation";
import StandorLogo from "./StandorLogo";

const LINK_GROUPS = [
  {
    title: "Platform",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Problems", href: "/problems" },
      { label: "New Interview", href: "/create-session" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/#footer" },
      { label: "Customers", href: "/customers" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export default function Footer() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { locale, setLocale, supportedLocales, localeLabels } =
    useTranslation();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@"))
      return toast.error("Please enter a valid email");
    setSubmitting(true);
    try {
      await api.post("/newsletter", { email });
      toast.success("Subscribed! You'll receive updates from Standor.");
      setEmail("");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Subscription failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLink = (href: string) => {
    if (href.startsWith("http")) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else if (href.startsWith("/#")) {
      const el = document.getElementById(href.replace("/#", ""));
      if (el) el.scrollIntoView({ behavior: "smooth" });
      else navigate("/");
    } else {
      navigate(href);
    }
  };

  return (
    <footer className="bg-[#050505] pt-12 pb-10 border-t border-white/[0.04]">
      <div className="ns-container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-4 mb-10">
          {/* Left Side: Status & Copyright (Replacing the Star area) */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ns-success/5 border border-ns-success/10">
              <div className="w-1.5 h-1.5 rounded-full bg-ns-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
              <span className="text-[10px] text-ns-success font-mono uppercase tracking-widest opacity-80">
                Operational
              </span>
            </div>
            <p className="text-[10px] text-ns-grey-700 font-mono tracking-tighter opacity-70 italic">
              &copy; {new Date().getFullYear()} Standor. All Rights Reserved.
            </p>
          </div>

          {/* Center: Branding & Links */}
          <div className="flex flex-col items-center gap-6">
            {/* Logo + Brand */}
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => handleLink("/")}
            >
              <div className="transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                <StandorLogo size={40} />
              </div>
              <span className="text-xl font-black text-white tracking-tighter uppercase italic">
                Standor
              </span>
            </div>

            {/* Compact Nav Links */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 md:gap-x-6 gap-y-3 px-6 py-3 md:px-4 md:py-2 rounded-2xl md:rounded-full bg-white/[0.02] border border-white/[0.05]">
              {LINK_GROUPS.flatMap((g) => g.links).map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleLink(link.href)}
                  className="text-[10px] font-bold text-ns-grey-600 hover:text-white uppercase tracking-widest transition-all duration-300"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Socials (Vertical List matching image) */}
          <div className="flex flex-col items-start gap-4">
            <a
              href="https://github.com/standor"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-ns-grey-600 hover:text-white transition-all duration-300 group"
            >
              <GithubIcon size={14} />
              <span className="text-[11px] font-bold tracking-tight opacity-80 group-hover:opacity-100">
                Github
              </span>
            </a>
            <a
              href="https://linkedin.com/company/standor"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-ns-grey-600 hover:text-white transition-all duration-300 group"
            >
              <LinkedinIcon size={14} />
              <span className="text-[11px] font-bold tracking-tight opacity-80 group-hover:opacity-100">
                LinkedIn
              </span>
            </a>
          </div>
        </div>

        {/* Footer Accent Line & Language */}
        <div className="pt-6 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[9px] text-ns-grey-800 font-mono text-center md:text-left max-w-lg leading-relaxed">
            Standor is an AI-powered technical interview platform for
            engineering teams. Not affiliated with LeetCode&reg; or similar
            entities. Built for hiring at scale.
          </p>

          <div className="flex items-center gap-4">
            {/* Language switcher */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu((v) => !v)}
                className="flex items-center gap-1.5 text-[10px] text-ns-grey-700 hover:text-white transition-colors font-mono"
                aria-label="Change language"
              >
                <Globe size={11} />
                {locale.toUpperCase()}
              </button>
              {showLangMenu && (
                <div className="absolute bottom-7 right-0 bg-[#0a0a0a] border border-white/[0.1] rounded-xl shadow-2xl overflow-hidden min-w-[100px] z-50">
                  {supportedLocales.map((l) => (
                    <button
                      key={l}
                      onClick={() => {
                        setLocale(l as SupportedLocale);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 text-[10px] transition-colors ${locale === l ? "text-white bg-white/[0.06]" : "text-ns-grey-500 hover:text-white hover:bg-white/[0.04]"}`}
                    >
                      {localeLabels[l as SupportedLocale]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
