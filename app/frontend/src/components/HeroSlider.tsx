'use client';

/**
 * HeroSlider — Full-bleed Orano-style horizontally-driven hero slider.
 *
 * - Spring physics: stiffness 280, damping 40, mass 1 (framer-motion)
 * - Mouse wheel delta accumulation with 80px threshold + 600ms lockout
 * - Keyboard ArrowLeft / ArrowRight navigation
 * - Touch swipe detection (50px threshold)
 * - Progress bar (top, teal)
 * - Dot indicators (pill when active)
 * - Prev / Next arrows disabled at edges
 * - prefers-reduced-motion: instant fade instead of spring
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, ChevronRight, Code2, Zap, BarChart3, Users } from 'lucide-react';
import { HeroFallback } from '@/components/3d/HeroFallback';

const Hero3D = dynamic(() => import('@/components/3d/Hero3D'), {
  ssr: false,
  loading: () => <HeroFallback />,
});

// ── Slide visual components ────────────────────────────────────────────────────

function EditorVisual() {
  const LINES = [
    { indent: 0, tokens: [{ t: 'def ', c: 'keyword' }, { t: 'two_sum', c: 'fn' }, { t: '(nums, target):', c: 'text' }] },
    { indent: 1, tokens: [{ t: 'seen ', c: 'text' }, { t: '= {}', c: 'text' }] },
    { indent: 1, tokens: [{ t: 'for ', c: 'keyword' }, { t: 'i, n ', c: 'text' }, { t: 'in ', c: 'keyword' }, { t: 'enumerate(nums):', c: 'text' }] },
    { indent: 2, tokens: [{ t: 'diff ', c: 'text' }, { t: '= target - n', c: 'text' }] },
    { indent: 2, tokens: [{ t: 'if ', c: 'keyword' }, { t: 'diff ', c: 'text' }, { t: 'in ', c: 'keyword' }, { t: 'seen:', c: 'text' }] },
    { indent: 3, tokens: [{ t: 'return ', c: 'keyword' }, { t: '[seen[diff], i]', c: 'text' }] },
    { indent: 2, tokens: [{ t: 'seen[n] ', c: 'text' }, { t: '= i', c: 'text' }] },
  ];

  const CURSORS = [
    { top: '2.2rem', left: '11.5rem', color: '#0EA5A4', label: 'AK' },
    { top: '5.5rem', left: '7rem',   color: '#F59E0B', label: 'JR' },
  ];

  return (
    <div className="relative h-[380px] w-full overflow-hidden rounded-panel border border-border bg-[#0B1220] font-mono text-xs">
      {/* header bar */}
      <div className="flex items-center gap-1.5 border-b border-border bg-bg-elevated px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
        <span className="ml-3 text-text-tertiary">solution.py</span>
        <div className="ml-auto flex gap-2">
          {CURSORS.map((c) => (
            <span key={c.label} className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: c.color + '22', color: c.color }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.color }} />
              {c.label}
            </span>
          ))}
        </div>
      </div>

      {/* code area */}
      <div className="relative p-4">
        {LINES.map((line, li) => (
          <div key={li} className="flex h-[1.6rem] items-center">
            <span className="mr-4 w-4 text-right text-text-tertiary/40 select-none">{li + 1}</span>
            <span style={{ paddingLeft: line.indent * 16 }}>
              {line.tokens.map((tok, ti) => (
                <span
                  key={ti}
                  className={
                    tok.c === 'keyword' ? 'text-teal-400' :
                    tok.c === 'fn'      ? 'text-amber-400' :
                    'text-text-secondary'
                  }
                >
                  {tok.t}
                </span>
              ))}
            </span>
          </div>
        ))}

        {/* remote cursors */}
        {CURSORS.map((c) => (
          <div key={c.label} className="pointer-events-none absolute" style={{ top: c.top, left: c.left }}>
            <div className="h-[1.2rem] w-0.5" style={{ background: c.color }} />
            <div className="absolute -top-4 left-1 rounded px-1 py-0.5 text-[9px] font-bold" style={{ background: c.color, color: '#fff' }}>
              {c.label}
            </div>
          </div>
        ))}
      </div>

      {/* typing indicator */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full border border-border bg-bg-surface/80 px-3 py-1 text-xs text-text-tertiary backdrop-blur-sm">
        <span className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="inline-block h-1 w-1 rounded-full bg-teal-500"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
            />
          ))}
        </span>
        JR is typing…
      </div>
    </div>
  );
}

function AIVisual() {
  const ITEMS = [
    { label: 'Time complexity', value: 'O(n)', accent: 'text-teal-400' },
    { label: 'Space complexity', value: 'O(n)', accent: 'text-teal-400' },
    { label: 'Correctness', value: '✓ Correct', accent: 'text-green-400' },
    { label: 'Score', value: '9 / 10', accent: 'text-amber-400' },
  ];

  const SUGGESTIONS = [
    'Add type hints for better readability',
    'Handle edge case when nums is empty',
    'Consider using walrus operator (:=) for elegance',
  ];

  return (
    <div className="relative h-[380px] w-full overflow-hidden rounded-panel border border-border bg-[#0B1220]">
      {/* header */}
      <div className="flex items-center gap-2 border-b border-border bg-bg-elevated px-4 py-3">
        <Zap className="h-4 w-4 text-teal-400" />
        <span className="text-sm font-semibold text-text-primary">AI Analysis</span>
        <motion.span
          className="ml-auto rounded-full bg-teal-500/15 px-2 py-0.5 text-[10px] font-medium text-teal-400"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Live
        </motion.span>
      </div>

      <div className="p-4 space-y-4">
        {/* metrics grid */}
        <div className="grid grid-cols-2 gap-2">
          {ITEMS.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12, duration: 0.3 }}
              className="rounded-lg border border-border bg-bg-elevated p-3"
            >
              <p className="text-[10px] text-text-tertiary">{item.label}</p>
              <p className={`mt-0.5 text-sm font-bold ${item.accent}`}>{item.value}</p>
            </motion.div>
          ))}
        </div>

        {/* confidence bar */}
        <div>
          <div className="mb-1.5 flex justify-between text-[10px] text-text-tertiary">
            <span>Confidence</span>
            <span className="text-teal-400">90%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-bg-elevated">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-400"
              initial={{ width: 0 }}
              animate={{ width: '90%' }}
              transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>

        {/* suggestions */}
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-text-tertiary">Suggestions</p>
          <div className="space-y-1.5">
            {SUGGESTIONS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.3 }}
                className="flex items-start gap-2 text-xs text-text-secondary"
              >
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500/60" />
                {s}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsVisual() {
  const BARS = [
    { lang: 'Python', pct: 82, count: 4920 },
    { lang: 'JavaScript', pct: 68, count: 4080 },
    { lang: 'TypeScript', pct: 55, count: 3300 },
    { lang: 'Go', pct: 40, count: 2400 },
    { lang: 'Java', pct: 29, count: 1740 },
  ];

  const STATS = [
    { label: 'Interviews run', value: '12,000+' },
    { label: 'Avg hire confidence', value: '91%' },
    { label: 'Time to offer', value: '−38%' },
  ];

  return (
    <div className="relative h-[380px] w-full overflow-hidden rounded-panel border border-border bg-[#0B1220]">
      {/* header */}
      <div className="flex items-center gap-2 border-b border-border bg-bg-elevated px-4 py-3">
        <BarChart3 className="h-4 w-4 text-amber-400" />
        <span className="text-sm font-semibold text-text-primary">Hiring Analytics</span>
      </div>

      <div className="p-4 space-y-5">
        {/* stats row */}
        <div className="grid grid-cols-3 gap-2">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className="rounded-lg bg-bg-elevated p-3 text-center"
            >
              <p className="text-base font-extrabold text-text-primary">{s.value}</p>
              <p className="mt-0.5 text-[9px] text-text-tertiary">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* language bars */}
        <div className="space-y-2.5">
          <p className="text-[10px] font-medium uppercase tracking-widest text-text-tertiary">Language usage</p>
          {BARS.map((b, i) => (
            <motion.div key={b.lang} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.08 }}>
              <div className="mb-1 flex justify-between text-[10px]">
                <span className="text-text-secondary">{b.lang}</span>
                <span className="text-text-tertiary">{b.count.toLocaleString()}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-bg-elevated">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${b.pct}%` }}
                  transition={{ delay: 0.3 + i * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Slide definitions ──────────────────────────────────────────────────────────

interface Slide {
  id: string;
  badge: string;
  headline: string;
  accent: string;      // the highlighted word(s) in headline
  body: string;
  cta: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
  Visual: React.ComponentType;
  accentColor: string; // tailwind class for badge + dots
}

const SLIDES: Slide[] = [
  {
    id: 'standard',
    badge: 'Real-time · AI-powered · Open source',
    headline: 'The standard for technical interviews',
    accent: 'technical interviews',
    body: 'Collaborate in Monaco editor in real-time, run code in 20+ languages, get instant AI feedback, and close hires faster — all in one room.',
    cta: { label: 'Start for free', href: '/register' },
    ctaSecondary: { label: 'See how it works', href: '#how-it-works' },
    Visual: () => <Hero3D />,
    accentColor: 'teal',
  },
  {
    id: 'collaborate',
    badge: 'CRDT · Zero-latency · Monaco',
    headline: 'Code together, instantly',
    accent: 'together, instantly',
    body: 'Powered by Yjs CRDT — every keystroke syncs in milliseconds. Named cursors, presence avatars, and zero conflict resolution needed.',
    cta: { label: 'Try live demo', href: '/register' },
    ctaSecondary: { label: 'Learn about the tech', href: '#how-it-works' },
    Visual: EditorVisual,
    accentColor: 'teal',
  },
  {
    id: 'ai',
    badge: 'Claude · Adaptive thinking · Instant',
    headline: 'Instant AI feedback on every line',
    accent: 'AI feedback',
    body: "Powered by Claude with adaptive thinking — complexity, correctness, style, and specific suggestions — delivered in under 3 seconds.",
    cta: { label: 'See AI in action', href: '/register' },
    ctaSecondary: { label: 'Read the docs', href: '#features' },
    Visual: AIVisual,
    accentColor: 'teal',
  },
  {
    id: 'analytics',
    badge: 'Data-driven · Reproducible · Fair',
    headline: 'Hire with data, not gut',
    accent: 'data, not gut',
    body: 'Every session produces a structured report: score, complexity analysis, code snapshot timeline, and comparative percentile rank.',
    cta: { label: 'Book a demo', href: '/register' },
    ctaSecondary: { label: 'View sample report', href: '#features' },
    Visual: AnalyticsVisual,
    accentColor: 'amber',
  },
];

// ── Main HeroSlider ────────────────────────────────────────────────────────────

export function HeroSlider() {
  const [active, setActive]       = useState(0);
  const [dir, setDir]             = useState<1 | -1>(1);
  const [reduced, setReduced]     = useState(false);
  const isLocked                  = useRef(false);
  const wheelAccum                = useRef(0);
  const touchStart                = useRef(0);
  const containerRef              = useRef<HTMLDivElement>(null);

  // detect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const h = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  const go = useCallback((next: number) => {
    if (isLocked.current) return;
    if (next < 0 || next >= SLIDES.length) return;
    isLocked.current = true;
    setDir(next > active ? 1 : -1);
    setActive(next);
    setTimeout(() => { isLocked.current = false; }, 600);
  }, [active]);

  // Mouse wheel
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      wheelAccum.current += e.deltaY;
      if (Math.abs(wheelAccum.current) >= 80) {
        go(active + (wheelAccum.current > 0 ? 1 : -1));
        wheelAccum.current = 0;
      }
    }

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [active, go]);

  // Keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') go(active + 1);
      if (e.key === 'ArrowLeft')  go(active - 1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, go]);

  // Touch
  function onTouchStart(e: React.TouchEvent) {
    touchStart.current = e.touches[0]!.clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    const delta = touchStart.current - e.changedTouches[0]!.clientX;
    if (Math.abs(delta) >= 50) go(active + (delta > 0 ? 1 : -1));
  }

  const slide = SLIDES[active]!;
  const isAmber = slide.accentColor === 'amber';

  // Spring x offset for the strip
  const rawX   = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 280, damping: 40, mass: 1 });

  useEffect(() => {
    rawX.set(-active * 100);
  }, [active, rawX]);

  // Variants for the text content (per-slide)
  const textVariants = {
    enter: (d: number) => ({ opacity: 0, x: reduced ? 0 : d * 32, y: reduced ? 8 : 0 }),
    center: { opacity: 1, x: 0, y: 0, transition: { duration: reduced ? 0.18 : 0.42, ease: [0.22, 1, 0.36, 1] } },
    exit:  (d: number) => ({ opacity: 0, x: reduced ? 0 : d * -24, transition: { duration: 0.2 } }),
  };

  // Accent badge color classes
  const badgeCls = isAmber
    ? 'border-amber-500/20 bg-amber-500/10 text-amber-400'
    : 'border-teal-500/20 bg-teal-500/10 text-teal-400';
  const dotActiveCls = isAmber ? 'bg-amber-400' : 'bg-teal-400';
  const accentTextCls = isAmber ? 'text-gradient-amber' : 'text-gradient';

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden pb-24 pt-20 focus-within:outline-none"
      aria-roledescription="carousel"
      aria-label="Standor feature highlights"
      tabIndex={0}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Background dot grid + glow ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#1F2937_1px,transparent_0)] bg-[size:28px_28px] opacity-70"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[480px] w-[800px] rounded-full blur-3xl transition-colors duration-700"
        style={{ background: isAmber ? 'rgba(245,158,11,0.05)' : 'rgba(14,165,164,0.05)' }}
      />

      {/* ── Progress bar ── */}
      <div className="absolute top-0 inset-x-0 h-0.5 bg-border z-30">
        <motion.div
          className="h-full transition-colors duration-500"
          style={{ background: isAmber ? '#F59E0B' : '#0EA5A4' }}
          animate={{ width: `${((active + 1) / SLIDES.length) * 100}%` }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {/* ── Main content ── */}
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">

          {/* Left: animated text */}
          <div className="max-w-xl">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={slide.id}
                custom={dir}
                variants={textVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {/* Badge */}
                <span className={`mb-6 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${badgeCls}`}>
                  <Zap className="h-3 w-3" aria-hidden="true" />
                  {slide.badge}
                </span>

                {/* Headline */}
                <h1 className="text-display font-extrabold tracking-tight text-text-primary">
                  {slide.headline.replace(slide.accent, '').trimEnd()}{' '}
                  <span className={accentTextCls}>{slide.accent}</span>
                </h1>

                {/* Body */}
                <p className="mt-6 text-lg leading-8 text-text-secondary">{slide.body}</p>

                {/* CTAs */}
                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <Link href={slide.cta.href} className="btn-primary px-6 py-3 text-base">
                    {slide.cta.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link href={slide.ctaSecondary.href} className="btn-secondary px-6 py-3 text-base">
                    {slide.ctaSecondary.label}
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: slide visual */}
          <div className="relative overflow-hidden rounded-panel border border-border">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={slide.id + '-visual'}
                custom={dir}
                initial={{ opacity: 0, x: reduced ? 0 : dir * 60, scale: reduced ? 1 : 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1, transition: { duration: reduced ? 0.18 : 0.45, ease: [0.22, 1, 0.36, 1] } }}
                exit={{ opacity: 0, x: reduced ? 0 : dir * -40, scale: reduced ? 1 : 0.97, transition: { duration: 0.2 } }}
              >
                <slide.Visual />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="mt-12 flex items-center justify-between">
          {/* Prev / Next arrows */}
          <div className="flex gap-2">
            <button
              onClick={() => go(active - 1)}
              disabled={active === 0}
              aria-label="Previous slide"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-bg-surface text-text-secondary transition-all duration-180 hover:border-border-strong hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => go(active + 1)}
              disabled={active === SLIDES.length - 1}
              aria-label="Next slide"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-bg-surface text-text-secondary transition-all duration-180 hover:border-border-strong hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Dot indicators */}
          <div className="flex items-center gap-2" role="tablist" aria-label="Slide indicators">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                role="tab"
                aria-selected={i === active}
                aria-label={`Go to slide ${i + 1}: ${s.id}`}
                onClick={() => go(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active
                    ? `w-6 ${dotActiveCls}`
                    : 'w-1.5 bg-border-strong hover:bg-text-tertiary'
                }`}
              />
            ))}
          </div>

          {/* Slide counter */}
          <p className="text-xs tabular-nums text-text-tertiary">
            {String(active + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
          </p>
        </div>
      </div>

      {/* Screen reader live region */}
      <div aria-live="polite" className="sr-only">
        Slide {active + 1} of {SLIDES.length}: {slide.headline}
      </div>
    </section>
  );
}
