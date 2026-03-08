import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import useStore from '../store/useStore';

const NAV_LINKS = [
    { label: 'Home', href: '/', id: 'home' },
    { label: 'About', href: '/about', id: 'about' },
    { label: 'Features', href: '/features', id: 'features' },
    { label: 'How it works', href: '/how-it-works', id: 'howitworks' },
    { label: 'Contact', href: '/contact', id: 'contact' },
    { label: 'Docs', href: '/docs', id: 'docs' },
];

export default function LandingNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, token, logout } = useStore();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const isLoggedIn = Boolean(user && token);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLink = (href: string) => {
        setMobileOpen(false);
        if (href.startsWith('/#')) {
            const id = href.replace('/#', '');
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
            } else {
                navigate('/');
                setTimeout(() => {
                    const el = document.getElementById(id);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        } else {
            navigate(href);
        }
    };

    const handleLogout = () => {
        setUserMenuOpen(false);
        setMobileOpen(false);
        logout();
        navigate('/');
    };

    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-[100] py-6 pointer-events-none"
        >
            <div className="ns-container flex items-center justify-between pointer-events-none">
                {/* Branding - Left Section */}
                <div
                    className="flex items-center gap-3 cursor-pointer group shrink-0 pointer-events-auto"
                    onClick={() => handleLink('/')}
                >
                    <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center transition-transform group-hover:scale-110 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                        <span className="text-black font-bold text-base">NS</span>
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight drop-shadow-sm">Standor</span>
                </div>

                {/* Navigation Pill - Central Section */}
                <div className="flex-1 flex justify-end md:justify-center px-2 md:px-10">
                    <div className={`relative flex items-center px-3 md:px-6 py-2 rounded-full transition-all duration-300 pointer-events-auto ${isScrolled
                        ? 'bg-[rgba(12,16,22,0.85)] backdrop-blur-[12px] border border-white/[0.1] shadow-[0_10px_40px_rgba(0,0,0,0.5)] scale-[0.98]'
                        : 'bg-transparent border border-transparent'
                        }`}>
                        <div className="hidden md:flex items-center gap-2">
                            {NAV_LINKS.map(link => {
                                const isActive = location.pathname === link.href;
                                return (
                                    <button
                                        key={link.label}
                                        onClick={() => handleLink(link.href)}
                                        className={cn(
                                            "relative px-3 py-2 text-[11px] font-bold tracking-widest uppercase transition-colors",
                                            isActive ? "text-white" : "text-ns-grey-400 hover:text-white"
                                        )}
                                        aria-label={`Go to ${link.label}`}
                                    >
                                        <span className="relative z-10">{link.label}</span>
                                        {isActive && (
                                            <>
                                                <motion.div
                                                    layoutId="tubelight-glow"
                                                    className="absolute top-full left-0 right-0 h-4 -z-10"
                                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                >
                                                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-full h-[3px] bg-white/30 rounded-full blur-[2px]" />
                                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] h-4 bg-white/20 rounded-full blur-lg" />
                                                </motion.div>
                                                <motion.div
                                                    layoutId="active-underline"
                                                    className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                />
                                            </>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {/* Mobile Toggle inside central area or separately? Let's keep it visible on mobile */}
                        <button
                            className="md:hidden p-2 text-white pointer-events-auto"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Auth Actions - Right Section */}
                <div className="hidden md:flex items-center gap-4 shrink-0 pointer-events-auto">
                    {isLoggedIn ? (
                        <>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center gap-2 px-5 py-2 bg-white text-black rounded-full text-xs font-bold hover:bg-ns-grey-100 transition-all active:scale-95"
                            >
                                Get Started
                                <ArrowRight size={14} />
                            </button>

                            <div className="relative" ref={menuRef}>
                                <div
                                    className="w-9 h-9 rounded-full bg-neutral-700 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:bg-neutral-600 transition-all hover:scale-105 active:scale-95"
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                >
                                    {initials}
                                </div>
                                {userMenuOpen && (
                                    <div className="absolute right-0 top-full mt-3 w-56 rounded-2xl border border-white/[0.08] bg-[#111]/95 backdrop-blur-2xl shadow-2xl shadow-black/50 overflow-hidden">
                                        <div className="px-4 py-3 border-b border-white/[0.06]">
                                            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                                            <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
                                        </div>
                                        <div className="py-1">
                                            <button
                                                onClick={() => { navigate('/dashboard'); setUserMenuOpen(false); }}
                                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                                            >
                                                <LayoutDashboard size={14} /> Dashboard
                                            </button>
                                            <button
                                                onClick={() => { navigate('/settings'); setUserMenuOpen(false); }}
                                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                                            >
                                                <Settings size={14} /> Settings
                                            </button>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/[0.04] transition-colors"
                                            >
                                                <LogOut size={14} /> Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => navigate('/login')}
                                className="text-xs font-bold text-white hover:text-ns-grey-300 transition-colors uppercase tracking-widest px-2"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => navigate('/register')}
                                className="group px-6 py-2.5 bg-white text-black rounded-full text-xs font-bold hover:bg-ns-grey-100 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-white/5"
                            >
                                Get Started
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`fixed inset-0 z-[-1] bg-ns-bg-900/95 backdrop-blur-2xl transition-all duration-500 md:hidden ${mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none translate-y-[-20px]'
                }`}>
                <div className="flex flex-col items-center justify-center h-full gap-8">
                    {NAV_LINKS.map(link => (
                        <button
                            key={link.label}
                            onClick={() => handleLink(link.href)}
                            className={cn(
                                "text-2xl font-bold transition-colors",
                                location.pathname === link.href ? "text-white" : "text-white/40 hover:text-white"
                            )}
                        >
                            {link.label}
                        </button>
                    ))}
                    <div className="h-px w-12 bg-white/10 my-4" />
                    {isLoggedIn ? (
                        <>
                            <button
                                onClick={() => { navigate('/dashboard'); setMobileOpen(false); }}
                                className="text-xl font-bold text-white"
                            >
                                Get Started
                            </button>
                            <button
                                onClick={handleLogout}
                                className="text-xl font-bold text-red-400 hover:text-red-300 transition-colors"
                            >
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => { navigate('/login'); setMobileOpen(false); }}
                                className="text-xl font-bold text-white"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => { navigate('/register'); setMobileOpen(false); }}
                                className="text-xl font-bold text-white bg-white/10 px-8 py-3 rounded-full"
                            >
                                Get Started
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
