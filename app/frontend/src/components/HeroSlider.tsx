import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, Shield, Zap, Globe, Lock } from 'lucide-react';
import useStore from '../store/useStore';

/* ── Error boundary for WebGL components ── */
class WebGLSafeBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error) {
    console.warn('[HeroSlider] 3D component error caught:', error.message);
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

const ReactiveGrid3D = lazy(() => import('./ReactiveGrid3D'));

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);
  return matches;
}

const SLIDES = [
  {
    id: 0,
    headline: 'Code together in real time',
    sub: 'A collaborative coding environment built for technical interviews. Write, run, and evaluate code with candidates instantly.',
    cta: 'Get Started',
    ctaPath: '/register',
    visual: 'editor',
  },
  {
    id: 1,
    headline: 'See how candidates think',
    sub: 'Replay every keystroke, cursor movement, and code execution to understand problem-solving strategies.',
    cta: 'View Session Replay',
    ctaPath: '/features',
    visual: 'replay',
  },
  {
    id: 2,
    headline: 'AI-powered code evaluation',
    sub: 'Automatic analysis of complexity, bugs, and code quality using AI models trained for developer workflows.',
    cta: 'Explore AI Analysis',
    ctaPath: '/features',
    visual: 'ai',
  },
  {
    id: 3,
    headline: 'Interview without friction',
    sub: 'Built-in video, chat, shared cursors, and synchronized coding remove the need for multiple tools.',
    cta: 'See Collaboration',
    ctaPath: '/features',
    visual: 'collab',
  },
  {
    id: 4,
    headline: 'Secure interview infrastructure',
    sub: 'Sandboxed execution environments, session recordings, and tamper-proof audit logs for reliable hiring workflows.',
    cta: 'View Security',
    ctaPath: '/security',
    visual: 'security',
  },
  {
    id: 5,
    headline: 'Built for modern hiring teams',
    sub: 'Integrate Standor into your hiring pipeline with APIs, analytics dashboards, and automated interview workflows.',
    cta: 'Explore Docs',
    ctaPath: '/docs',
    visual: 'automation',
  },
];

/* ── Standor Visual Scenes ── */
function EditorVisual({ active }: { active: boolean, reducedMotion: boolean }) {
  const lines = [
    'function twoSum(nums, target) {',
    '  const map = new Map();',
    '  for (let i = 0; i < nums.length; i++) {',
    '    const diff = target - nums[i];',
    '    if (map.has(diff)) return [map.get(diff), i];',
    '    map.set(nums[i], i);',
    '  }',
    '}',
  ];
  return (
    <div className={`transition-all duration-1000 ${active ? 'opacity-100' : 'opacity-0'}`}>
      <div className="relative w-[420px] h-[260px] ns-glass rounded-2xl p-6 font-mono text-xs">
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-ns-accent animate-pulse" />
          <span className="text-[10px] text-ns-accent uppercase tracking-widest">Live Edit</span>
        </div>
        {lines.map((l, i) => (
          <div key={i} className="flex gap-3 mb-1.5" style={{
            opacity: active ? 1 : 0,
            transition: `opacity 500ms ease ${i * 60}ms`,
          }}>
            <span className="text-white/20 w-4 shrink-0 text-right">{i + 1}</span>
            <span className="text-white/75">{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReplayVisual({ active, reducedMotion }: { active: boolean, reducedMotion: boolean }) {
  const events = [
    { label: 'function twoSum(', t: '00:12' },
    { label: 'const map = new Map()', t: '00:34' },
    { label: 'for (let i = 0; ...', t: '01:05' },
    { label: 'return [map.get(...)', t: '02:18' },
  ];
  return (
    <div className={`transition-all duration-1000 ${active ? 'opacity-100' : 'opacity-0'}`}>
      <div className="relative w-[340px] h-[240px] ns-glass rounded-2xl p-5 overflow-hidden">
        <div className="flex items-center gap-2 mb-5 border-b border-white/[0.05] pb-3">
          <Play size={11} className={`text-ns-accent fill-ns-accent ${reducedMotion ? '' : 'animate-pulse'}`} />
          <span className="text-[10px] font-mono text-ns-accent uppercase tracking-widest">Session Replay</span>
          <span className="ml-auto text-[10px] font-mono text-white/30">02:34 / 10:00</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-5">
          <div className="h-full bg-ns-accent rounded-full" style={{ width: '45%' }} />
        </div>
        <div className="space-y-2">
          {events.map((e, i) => (
            <div key={i} className="flex items-center gap-3" style={{
              opacity: active ? 1 : 0,
              transition: `opacity 500ms ease ${i * 80}ms`,
            }}>
              <span className="text-[9px] font-mono text-white/25 w-8">{e.t}</span>
              <div className="flex-1 h-px bg-white/[0.05]" />
              <span className="text-[9px] font-mono text-white/50">{e.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AIAnalysisVisual({ active }: { active: boolean, reducedMotion: boolean }) {
  const stats = [
    { label: 'Time Complexity', value: 'O(n)', color: '#32D74B' },
    { label: 'Space Complexity', value: 'O(n)', color: '#32D74B' },
    { label: 'Bug Detection', value: 'None found', color: '#32D74B' },
    { label: 'Code Quality', value: '9 / 10', color: '#0A84FF' },
  ];
  return (
    <div className={`transition-all duration-1000 ${active ? 'opacity-100' : 'opacity-0'}`}>
      <div className="relative w-[340px] ns-glass rounded-2xl p-6">
        <div className="text-[11px] font-bold text-white/80 uppercase tracking-wider mb-5">
          AI Code Analysis
        </div>
        <div className="space-y-3">
          {stats.map((s, i) => (
            <div key={i} className="flex items-center justify-between" style={{
              opacity: active ? 1 : 0,
              transition: `opacity 500ms ease ${i * 80}ms`,
            }}>
              <span className="text-[11px] text-white/50">{s.label}</span>
              <span className="text-[11px] font-mono font-bold" style={{ color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 pt-4 border-t border-white/[0.05] text-[10px] text-white/30">
          Powered by Standor AI
        </div>
      </div>
    </div>
  );
}

function CollaborationVisual({ active, reducedMotion }: { active: boolean, reducedMotion: boolean }) {
  const cursors = [
    { name: 'AL', c: '#ABABBB', x: 22, y: 38 },
    { name: 'JD', c: '#32D74B', x: 60, y: 58 },
    { name: 'SK', c: '#FF9F0A', x: 44, y: 18 },
  ];
  return (
    <div className={`transition-all duration-1000 ${active ? 'opacity-100' : 'opacity-0'}`}>
      <div className="relative w-[340px] h-[220px] ns-glass rounded-2xl overflow-hidden p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex -space-x-2">
            {cursors.map((u, i) => (
              <div key={i} className="w-7 h-7 rounded-full border-2 border-ns-bg-900 flex items-center justify-center text-[9px] font-bold text-black" style={{ background: u.c }}>{u.name}</div>
            ))}
          </div>
          <span className="text-[10px] text-white/40 font-mono">3 active</span>
        </div>
        <div className="space-y-2 mb-4">
          {[70, 45, 85].map((w, i) => (
            <div key={i} className="h-2.5 bg-white/[0.04] rounded-md overflow-hidden">
              <div className="h-full rounded-md bg-white/[0.07]" style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
        {cursors.map((u, i) => (
          <div key={i} className="absolute pointer-events-none" style={{
            left: `${u.x}%`, top: `${u.y}%`,
            opacity: active ? 1 : 0,
            transition: reducedMotion ? 'opacity 500ms' : `all 800ms ease ${i * 150}ms`,
            transform: reducedMotion ? 'none' : (active ? 'translate(0,0)' : 'translate(15px,15px)'),
          }}>
            <svg width="12" height="16" viewBox="0 0 12 16" fill={u.c}><path d="M0 0L12 9L5 9.5L3 16L0 0Z" /></svg>
            <div className="px-1.5 py-0.5 rounded text-[8px] font-bold text-black mt-0.5 ml-2 whitespace-nowrap" style={{ background: u.c }}>{u.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecurityVisual({ active, reducedMotion }: { active: boolean, reducedMotion: boolean }) {
  return (
    <div className={`transition-all duration-1000 ${active ? 'opacity-100' : 'opacity-0'}`}>
      <div className="relative w-[340px] h-[220px] flex items-center justify-center">
        <div className="relative">
          {!reducedMotion && <div className={`absolute inset-0 bg-ns-accent/20 blur-[60px] rounded-full transition-transform duration-[2000ms] ${active ? 'scale-150' : 'scale-75'}`} />}
          <div className="relative ns-glass w-32 h-32 rounded-3xl flex items-center justify-center border-ns-accent/30 shadow-[0_0_40px_rgba(10,132,255,0.2)]">
            <Shield size={48} className="text-ns-accent" />
          </div>
          <div className={`absolute -top-6 -right-6 ns-glass p-3 rounded-2xl ${reducedMotion ? '' : 'animate-bounce'}`} style={{ animationDuration: '3s' }}>
            <Lock size={16} className="text-ns-teal" />
          </div>
          <div className="absolute -bottom-4 -left-8 ns-glass px-4 py-2 rounded-xl">
            <span className="text-[10px] font-mono whitespace-nowrap text-white/80">Audit Trail: 100% Immutable</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AutomationVisual({ active, reducedMotion }: { active: boolean, reducedMotion: boolean }) {
  return (
    <div className={`transition-all duration-1000 ${active ? 'opacity-100' : 'opacity-0'}`}>
      <div className="relative w-[340px] h-[220px] ns-glass rounded-2xl p-6 font-mono overflow-hidden">
        <div className="flex items-center gap-2 mb-4 border-b border-white/[0.05] pb-2">
          <Globe size={12} className="text-ns-teal" />
          <span className="text-[10px] text-white/40">API Endpoint</span>
        </div>
        <div className="text-[11px] space-y-2">
          <div className="text-ns-teal">POST /api/rooms/create</div>
          <div className="text-white/60">{'{'}</div>
          <div className="pl-4 text-white/40">"candidate": "john@acme.com",</div>
          <div className="pl-4 text-white/40">"problem": "two-sum",</div>
          <div className="pl-4 text-white/40">"record": true</div>
          <div className="text-white/60">{'}'}</div>
          <div className="flex items-center gap-2 pt-2">
            <Zap size={10} className={`text-ns-warning ${reducedMotion ? '' : 'animate-pulse'}`} aria-hidden="true" />
            <span className="text-ns-warning text-[10px]">201 Created — 84ms</span>
          </div>
        </div>
        <div className="absolute -right-10 bottom-0 opacity-10 rotate-12">
          <div className="text-[80px] font-bold">SDK</div>
        </div>
      </div>
    </div>
  );
}

const VISUALS = {
  editor: EditorVisual,
  replay: ReplayVisual,
  ai: AIAnalysisVisual,
  collab: CollaborationVisual,
  security: SecurityVisual,
  automation: AutomationVisual
};

export default function HeroSlider() {
  const navigate = useNavigate();
  const { user, token } = useStore();
  const isLoggedIn = Boolean(user && token);
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const next = useCallback(() => {
    if (isAnimating) return;
    setDirection('right');
    setIsAnimating(true);
    setCurrent(c => (c + 1) % SLIDES.length);
    setTimeout(() => setIsAnimating(false), 800);
  }, [isAnimating]);

  const prev = useCallback(() => {
    if (isAnimating) return;
    setDirection('left');
    setIsAnimating(true);
    setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length);
    setTimeout(() => setIsAnimating(false), 800);
  }, [isAnimating]);

  const goto = useCallback((idx: number) => {
    if (isAnimating || idx === current) return;
    setDirection(idx > current ? 'right' : 'left');
    setIsAnimating(true);
    setCurrent(idx);
    setTimeout(() => setIsAnimating(false), 800);
  }, [current, isAnimating]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [next, prev]);

  useEffect(() => {
    if (!reducedMotion) {
      timerRef.current = setInterval(next, 8000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [next, reducedMotion]);

  const pauseTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };
  const resumeTimer = () => {
    if (!reducedMotion) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(next, 8000);
    }
  };

  const slide = SLIDES[current];
  const Visual = VISUALS[slide.visual as keyof typeof VISUALS];

  // Touch/swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
    pauseTimer();
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const handleTouchEnd = () => {
    if (Math.abs(touchDeltaX.current) > 50) {
      if (touchDeltaX.current < 0) next();
      else prev();
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
    resumeTimer();
  };

  // Mouse drag handling
  const mouseStartX = useRef<number | null>(null);
  const mouseDeltaX = useRef(0);
  const handleMouseDown = (e: React.MouseEvent) => {
    mouseStartX.current = e.clientX;
    mouseDeltaX.current = 0;
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (mouseStartX.current === null) return;
    mouseDeltaX.current = e.clientX - mouseStartX.current;
  };
  const handleMouseUp = () => {
    if (mouseStartX.current !== null && Math.abs(mouseDeltaX.current) > 50) {
      if (mouseDeltaX.current < 0) next();
      else prev();
    }
    mouseStartX.current = null;
    mouseDeltaX.current = 0;
  };

  return (
    <section
      className="relative w-full h-screen overflow-hidden bg-ns-bg-900 flex items-center select-none"
      onMouseEnter={pauseTimer}
      onMouseLeave={() => { handleMouseUp(); resumeTimer(); }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      role="region"
      aria-label="Product feature slider"
    >
      <WebGLSafeBoundary>
        <Suspense fallback={<div className="absolute inset-0 bg-ns-bg-900" />}>
          <ReactiveGrid3D
            gridColor="#3a5060"
            glowColor="#0A84FF"
            gridSpacing={2.0}
            lineThickness={0.03}
            floatAmplitude={0.05}
            floatSpeed={0.2}
            mouseRotationFactor={0.8}
          />
        </Suspense>
      </WebGLSafeBoundary>

      {/* Depth vignette + corner darkening */}
      <div className="absolute inset-0 z-[2] pointer-events-none" aria-hidden="true">
        {/* Radial glow behind headline */}
        <div style={{
          position: 'absolute',
          top: '30%', left: '20%',
          width: '700px', height: '550px',
          background: 'radial-gradient(ellipse at center, rgba(10,132,255,0.13) 0%, rgba(10,132,255,0.04) 40%, transparent 70%)',
          filter: 'blur(50px)',
          transform: 'translate(-50%, -50%)',
        }} />
        {/* Corner vignette — darkens edges, pulls focus to center */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.35) 100%)',
        }} />
        {/* Atmospheric haze — top/bottom */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(5,5,6,0.4) 0%, transparent 25%, transparent 75%, rgba(5,5,6,0.55) 100%)',
        }} />
      </div>

      <div className="ns-container relative z-10 w-full">
        <div
          key={`slide-${current}`}
          className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center"
          style={reducedMotion ? {} : {
            animation: isAnimating
              ? `heroSlide${direction === 'right' ? 'FromRight' : 'FromLeft'} 700ms cubic-bezier(0.16, 1, 0.3, 1) forwards`
              : 'heroEnter 700ms cubic-bezier(0.22, 0.9, 0.3, 1) forwards',
          }}
        >
          <div className="max-w-xl">

            <div className="h-auto md:h-[280px]">
              <h1 className={`text-4xl sm:text-7xl font-bold mb-6 tracking-tight text-white leading-[1.1] ${reducedMotion ? 'opacity-100' : 'hero-reveal'}`}>
                {slide.headline}
              </h1>

              <p className={`text-base sm:text-lg text-ns-grey-500 mb-10 leading-relaxed max-w-md ${reducedMotion ? 'opacity-100' : 'hero-reveal hero-reveal-d1'}`}>
                {slide.sub}
              </p>

              <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-4 ${reducedMotion ? 'opacity-100' : 'hero-reveal hero-reveal-d2'}`}>
                {current === 0 ? (
                  // First slide: auth-conditional CTA
                  <button
                    onClick={() => navigate(isLoggedIn ? '/dashboard' : '/register')}
                    className="btn-sweep btn-cta group px-8 py-3.5 bg-ns-white text-ns-black rounded-full font-bold text-sm hover:bg-ns-grey-100 transition-all flex justify-center items-center gap-2 shadow-xl"
                  >
                    {isLoggedIn ? 'Get Started' : 'Get Started'}
                    <ArrowRight size={16} className={`${reducedMotion ? '' : 'group-hover:translate-x-1'} transition-transform`} />
                  </button>
                ) : (
                  // Other slides: use slide-specific CTA
                  <button
                    onClick={() => navigate(slide.ctaPath)}
                    className="btn-sweep btn-cta group px-8 py-3.5 bg-ns-white text-ns-black rounded-full font-bold text-sm hover:bg-ns-grey-100 transition-all flex justify-center items-center gap-2 shadow-xl"
                  >
                    {slide.cta}
                    <ArrowRight size={16} className={`${reducedMotion ? '' : 'group-hover:translate-x-1'} transition-transform`} />
                  </button>
                )}
                <button
                  onClick={() => navigate('/docs')}
                  className="px-8 py-3.5 rounded-full border border-ns-border text-ns-text-secondary font-bold text-sm hover:text-white hover:border-white/20 transition-all"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-start justify-center pt-10 min-h-[400px] overflow-visible">
            <div>
              <Visual active={true} reducedMotion={reducedMotion} />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Line */}
      <div
        key={`progress-${current}`}
        className="absolute bottom-0 left-0 h-[2px] bg-ns-accent/50 transition-all duration-8000"
        style={{
          width: reducedMotion ? '0' : '100%',
          transitionTimingFunction: 'linear',
          opacity: isAnimating ? 0 : 1,
        }}
      />

      {/* Progress Dots */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goto(idx)}
            className={`h-1.5 rounded-full transition-all duration-500 ${idx === current ? 'w-10 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'w-2.5 bg-white/20 hover:bg-white/40'}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>


      <style>{`
        .ns-glass {
            background: rgba(28, 28, 30, 0.6);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        @keyframes heroSlideFromRight {
          0% { opacity: 0; transform: translateX(60px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes heroSlideFromLeft {
          0% { opacity: 0; transform: translateX(-60px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes heroEnter {
          0% { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
