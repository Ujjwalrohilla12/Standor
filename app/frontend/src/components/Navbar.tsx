import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useStore from '../store/useStore';
import GlobalSearch from './GlobalSearch';
import { Menu, X, Sun, Moon, LogOut, Settings } from 'lucide-react';

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme, user, logout } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/upload', label: 'Upload' },
    { path: '/tools/dpi', label: 'DPI Tools' },
    { path: '/team-rooms', label: 'Team Rooms' },
    { path: '/settings', label: 'Settings' },
  ];

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const handleLogout = () => {
    setUserMenuOpen(false);
    navigate('/');
    setTimeout(() => logout(), 0);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled ? 'py-3' : 'py-5'}`}
      data-testid="navbar"
    >
      <div className="ns-container">
        <div className={`relative flex items-center justify-between px-6 py-2.5 rounded-full transition-all duration-500 ${isScrolled
          ? 'ns-glass shadow-2xl scale-[1.02]'
          : 'bg-transparent border border-transparent'
          }`}>
          {/* Logo */}
          <div
            className="flex items-center gap-2.5 cursor-pointer group select-none"
            onClick={() => navigate('/')}
            data-testid="logo-section"
          >
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center transition-transform group-hover:scale-110">
              <span className="text-black font-bold text-sm">NS</span>
            </div>
            <span className="text-base font-bold text-white tracking-tight hidden sm:block">Standor</span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8" data-testid="nav-links">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`text-xs font-bold uppercase tracking-widest transition-colors ${isActive(link.path)
                  ? 'text-white'
                  : 'text-ns-grey-400 hover:text-white'
                  }`}
                data-testid={`nav-link-${link.label.toLowerCase().replace(' ', '-')}`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4" data-testid="nav-actions">
            <GlobalSearch />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-white/[0.06] text-neutral-500 hover:text-white transition-colors"
              data-testid="theme-toggle-btn"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* User avatar with dropdown */}
            <div className="relative" ref={menuRef}>
              <div
                className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:bg-neutral-600 transition-all hover:scale-105"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                data-testid="user-avatar"
              >
                {initials}
              </div>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-3 w-56 rounded-2xl border border-white/[0.08] bg-[#111]/95 backdrop-blur-2xl shadow-2xl shadow-black/50 overflow-hidden" data-testid="user-menu-dropdown">
                  <div className="px-4 py-3 border-b border-white/[0.06]">
                    <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                    <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => { navigate('/settings'); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                      data-testid="user-menu-settings"
                    >
                      <Settings size={14} /> Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/[0.04] transition-colors"
                      data-testid="user-menu-logout"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              className="md:hidden p-2 text-neutral-400 hover:text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
              data-testid="mobile-menu-btn"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-[-1] bg-ns-bg-900/95 backdrop-blur-2xl transition-all duration-500 md:hidden ${mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none translate-y-[-20px]'
        }`}>
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => { navigate(link.path); setMobileOpen(false); }}
              className={`text-2xl font-bold transition-colors ${isActive(link.path) ? 'text-white' : 'text-neutral-500 hover:text-white'
                }`}
            >
              {link.label}
            </button>
          ))}
          <div className="h-px w-12 bg-white/10 my-4" />
          <button
            onClick={() => { handleLogout(); setMobileOpen(false); }}
            className="text-xl font-bold text-red-400 hover:text-red-300 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
