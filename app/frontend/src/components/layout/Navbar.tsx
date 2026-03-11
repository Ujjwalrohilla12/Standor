import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight, LogOut, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import useStore from "../../store/useStore";
import StandorLogo from "../StandorLogo";

const MARKETING_LINKS = [
  { label: "About", href: "/#about", section: "about" },
  { label: "Features", href: "/#features", section: "features" },
  { label: "Contact", href: "/#footer", section: "footer" },
  { label: "Docs", href: "/docs" },
];

const SECTION_SCROLL_OFFSET = 56;

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, logout } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    link: (typeof MARKETING_LINKS)[0],
  ) => {
    if (link.section) {
      e.preventDefault();
      if (location.pathname !== "/") {
        // Navigate to home and store the target section in sessionStorage
        sessionStorage.setItem("scrollToSection", link.section);
        navigate("/");
      } else {
        const element = document.getElementById(link.section);
        if (element) {
          const offset = SECTION_SCROLL_OFFSET;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }
      setMobileOpen(false);
    }
  };

  // Handle scrolling to section after navigation
  useEffect(() => {
    const scrollToSection = sessionStorage.getItem("scrollToSection");
    if (scrollToSection && location.pathname === "/") {
      sessionStorage.removeItem("scrollToSection");
      // Wait for page to render
      setTimeout(() => {
        const element = document.getElementById(scrollToSection);
        if (element) {
          const offset = SECTION_SCROLL_OFFSET;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 300);
    }
  }, [location.pathname]);

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 150);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const isLoggedIn = Boolean(user && token);
  const isAppRoute =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/session") ||
    location.pathname.startsWith("/create-session") ||
    location.pathname.startsWith("/settings") ||
    location.pathname.startsWith("/team-rooms") ||
    location.pathname.startsWith("/replay") ||
    location.pathname.startsWith("/lobby") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/webhooks");

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    setUserMenuOpen(false);
    setMobileOpen(false);
    logout();
    navigate("/");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const isPathActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const isMarketingLinkActive = (link: (typeof MARKETING_LINKS)[0]) => {
    if (link.section) return location.pathname === "/";
    return location.pathname === link.href;
  };

  // ─── APP NAVBAR (Slightly more functional, less marketing-heavy) ───
  if (isAppRoute) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-[100] h-20 bg-[#070707]/92 backdrop-blur-xl border-b border-white/5 pointer-events-none">
        <div className="ns-container h-full flex items-center justify-between pointer-events-none">
          <div
            className="flex items-center gap-2.5 cursor-pointer group pointer-events-auto"
            onClick={() => navigate("/")}
            title="Go to Home"
          >
            <div className="transition-transform group-hover:scale-105">
              <StandorLogo size={32} />
            </div>
            <span className="text-base font-bold text-white tracking-tight hidden sm:block">
              Standor
            </span>
          </div>

          <div className="flex items-center bg-[rgba(12,16,22,0.8)] backdrop-blur-xl border border-white/5 px-4 py-2 rounded-full pointer-events-auto">
            <div className="flex items-center gap-6 mr-6 border-r border-white/10 pr-6">
              <Link
                to="/dashboard"
                className={cn(
                  "relative text-xs font-bold uppercase tracking-widest transition-colors",
                  isPathActive("/dashboard")
                    ? "text-white"
                    : "text-neutral-500 hover:text-white",
                )}
              >
                Dashboard
              </Link>
              <Link
                to="/team-rooms"
                className={cn(
                  "relative text-xs font-bold uppercase tracking-widest transition-colors",
                  isPathActive("/team-rooms")
                    ? "text-white"
                    : "text-neutral-500 hover:text-white",
                )}
              >
                Rooms
              </Link>
            </div>
            <div className="relative" ref={menuRef}>
              <div
                className="w-8 h-8 rounded-full bg-neutral-800 border border-white/5 flex items-center justify-center text-white text-[10px] font-bold cursor-pointer hover:bg-neutral-700 transition-all"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                {initials}
              </div>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-3 w-56 rounded-2xl border border-white/10 bg-[#0A0A0A]/95 backdrop-blur-2xl shadow-2xl overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-sm font-medium text-white truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-neutral-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          navigate("/settings");
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Settings size={14} /> Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500/80 hover:text-red-400 hover:bg-white/5 transition-colors"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // ─── MARKETING NAVBAR (Premium pill design) ───
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] h-24 bg-[#070707]/90 backdrop-blur-xl border-b border-white/5 pointer-events-none">
      <div className="ns-container h-full flex items-center justify-between pointer-events-none">
        {/* Logo */}
        <Link
          to="/"
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 group pointer-events-auto"
        >
          <div className="transition-transform group-hover:scale-105">
            <StandorLogo size={36} />
          </div>
          <span className="text-lg md:text-xl font-bold text-white tracking-tight">
            Standor
          </span>
        </Link>

        {/* Central Pill */}
        <div className="hidden md:flex items-center bg-[rgba(10,10,10,0.7)] backdrop-blur-xl border border-white/10 px-6 py-2 rounded-full pointer-events-auto shadow-2xl">
          <div className="flex items-center gap-1">
            {MARKETING_LINKS.map((link) => {
              const active = isMarketingLinkActive(link);
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={(e) => handleNavClick(e, link)}
                  className={cn(
                    "relative px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors",
                    active ? "text-white" : "text-neutral-500 hover:text-white",
                  )}
                >
                  <span className="relative z-10">{link.label}</span>
                  {active && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-white/5 rounded-full"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4 pointer-events-auto">
          {isLoggedIn ? (
            <Link
              to="/dashboard"
              className="px-6 py-2.5 bg-white text-black rounded-full text-[11px] font-bold hover:bg-neutral-100 transition-all flex items-center gap-2 active:scale-95"
            >
              Dashboard <ArrowRight size={14} />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-neutral-400 hover:text-white transition-colors uppercase tracking-widest px-2"
              >
                Log in
              </Link>
              <Link
                to="/register"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 bg-white text-black rounded-full text-[11px] font-bold hover:bg-neutral-100 transition-all flex items-center gap-2 active:scale-95"
              >
                Get Started <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Trigger */}
        <button
          className="md:hidden p-2 text-white pointer-events-auto"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[-1] bg-[#050505]/95 backdrop-blur-3xl md:hidden flex flex-col items-center justify-center gap-8"
          >
            {MARKETING_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={(e) => handleNavClick(e, link)}
                className={cn(
                  "text-2xl font-bold transition-colors",
                  location.pathname === link.href
                    ? "text-white"
                    : "text-neutral-600 hover:text-white",
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="h-px w-12 bg-white/10 my-4" />
            {isLoggedIn ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="text-xl font-bold text-white"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="text-xl font-bold text-white"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="px-8 py-3 bg-white text-black rounded-full font-bold text-lg"
                >
                  Get Started
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
