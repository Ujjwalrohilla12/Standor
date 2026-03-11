import { Suspense, lazy, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Code2, Brain, Terminal, Zap, Users, Clock, Shield, BarChart3, GitMerge
} from 'lucide-react';
import { FeatureGrid } from '../components/features/FeatureGrid';
import { ComparisonGrid } from '../components/features/ComparisonGrid';
import { CTASection } from '../components/features/CTASection';
import { HeroSceneFallback } from '../components/features/HeroScene';
import { SEOMetadata } from '../components/features/SEOMetadata';
import { FAQStructuredData, SoftwareApplicationStructuredData, BreadcrumbStructuredData } from '../components/features/StructuredData';
import type { FeatureCardProps } from '../components/features/FeatureCard';
import type { ComparisonRow } from '../components/features/ComparisonGrid';

// Lazy load HeroScene for performance
const HeroScene = lazy(() => import('../components/features/HeroScene'));

/**
 * Features Page - FAANG-Grade Implementation
 * 
 * Production-quality marketing page following Apple/Stripe/Linear standards.
 * 
 * Performance Targets:
 * - FCP < 900ms on 4G
 * - Lighthouse Performance >= 85
 * - Lighthouse Accessibility >= 90
 * - Initial bundle < 250KB gzipped
 * 
 * Features:
 * - Tightened visual hierarchy
 * - Single accent color (Teal #0EA5A4)
 * - Uniform card system
 * - Responsive comparison grid
 * - Strong CTA hierarchy
 * - 3D hero scene with lazy loading
 * - Reduced motion support
 * - WCAG AA compliance
 */

// Feature data - 9 features with 12-18 word descriptions
const FEATURES: FeatureCardProps[] = [
  {
    icon: Code2,
    title: 'Monaco Editor Integration',
    description: 'Industry-standard code editor with IntelliSense, syntax highlighting, and multi-cursor support for seamless coding.',
    accentColor: '#0EA5A4',
    learnMoreHref: '/features/editor',
  },
  {
    icon: GitMerge,
    title: 'Real-Time Collaboration',
    description: 'CRDT-powered synchronization ensures conflict-free editing with sub-50ms latency across global teams.',
    accentColor: '#0EA5A4',
    learnMoreHref: '/features/collaboration',
  },
  {
    icon: Brain,
    title: 'AI Code Analysis',
    description: 'Claude-powered analysis provides instant complexity detection, bug reports, and quality scoring for every submission.',
    accentColor: '#0EA5A4',
    learnMoreHref: '/features/ai-analysis',
  },
  {
    icon: Terminal,
    title: 'Sandboxed Execution',
    description: 'Secure container runtime supports 12+ languages with deterministic execution and comprehensive test coverage.',
    accentColor: '#0EA5A4',
    learnMoreHref: '/features/execution',
  },
  {
    icon: Clock,
    title: 'Session Replay',
    description: 'Automatic snapshots every 30 seconds enable complete interview review with exportable reports and transcripts.',
    accentColor: '#0EA5A4',
    learnMoreHref: '/features/replay',
  },
  {
    icon: BarChart3,
    title: 'Integrity Monitoring',
    description: 'Track paste events, focus changes, and typing patterns to maintain interview authenticity and confidence.',
    accentColor: '#0EA5A4',
    learnMoreHref: '/features/integrity',
  },
  {
    icon: Users,
    title: 'Multiplayer Presence',
    description: 'Real-time cursor tracking and collaborative editing create authentic pair programming experiences for interviews.',
    accentColor: '#0EA5A4',
    learnMoreHref: '/features/presence',
  },
  {
    icon: Zap,
    title: 'Team Analytics',
    description: 'Comprehensive dashboards track pass rates, session metrics, and candidate performance across your pipeline.',
    accentColor: '#0EA5A4',
    learnMoreHref: '/features/analytics',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Argon2id hashing, JWT rotation, and GDPR compliance ensure enterprise-grade security for sensitive data.',
    accentColor: '#0EA5A4',
    learnMoreHref: '/features/security',
  },
];

// Comparison data
const COMPARISON_DATA: ComparisonRow[] = [
  { feature: 'Real-time collaborative editor', standor: true, competitor1: true, competitor2: false },
  { feature: 'CRDT conflict-free sync', standor: true, competitor1: false, competitor2: false },
  { feature: 'AI code analysis', standor: true, competitor1: false, competitor2: false },
  { feature: 'Session replay & snapshots', standor: true, competitor1: false, competitor2: true },
  { feature: 'Open source', standor: true, competitor1: false, competitor2: false },
  { feature: '12+ sandboxed languages', standor: true, competitor1: true, competitor2: true },
  { feature: 'Free tier available', standor: true, competitor1: false, competitor2: false },
  { feature: 'Self-hostable', standor: true, competitor1: false, competitor2: false },
];

const COMPARISON_COLUMNS = ['Feature', 'Standor', 'CoderPad', 'HackerRank'];

export default function FeaturesNew() {
  const [reducedMotion, setReducedMotion] = useState(false);

  // Detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <main className="w-full min-h-screen bg-[var(--bg-900)] text-white">
      
      {/* SEO Metadata */}
      <SEOMetadata
        title="Features - Standor | FAANG-Grade Technical Interview Platform"
        description="Discover Standor's enterprise-grade features: real-time collaborative coding, AI analysis, session replay, and more. Built for scale, designed for speed."
        canonicalUrl="https://standor.com/features"
        ogImage="/og-features.png"
        keywords={['technical interview platform', 'collaborative coding', 'AI code analysis', 'interview software', 'hiring platform']}
      />

      {/* Structured Data */}
      <FAQStructuredData />
      <SoftwareApplicationStructuredData />
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', url: 'https://standor.com' },
          { name: 'Features', url: 'https://standor.com/features' },
        ]}
      />
      
      {/* Hero Section */}
      <section className="relative w-full min-h-[90vh] flex flex-col justify-center pt-24 pb-16 px-6 lg:px-12">
        {/* 3D Background Scene */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <Suspense fallback={<HeroSceneFallback />}>
            <HeroScene reducedMotion={reducedMotion} />
          </Suspense>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 mb-6">
              <Zap size={12} className="text-[var(--accent)]" />
              <span className="text-[10px] font-mono text-[var(--accent)] uppercase tracking-widest">
                Platform Features
              </span>
            </div>

            {/* Headline - clamp(36px, 5.5vw, 56px) */}
            <h1 className="text-[clamp(2.25rem,5.5vw,3.5rem)] font-bold leading-[1.1] tracking-tight mb-6 text-white max-w-4xl mx-auto">
              Built for scale.{' '}
              <span className="text-[var(--accent)]">Designed for speed.</span>
            </h1>

            {/* Subhead - 20-22px */}
            <p className="text-[clamp(1.25rem,2vw,1.375rem)] text-white/70 mb-10 max-w-prose mx-auto leading-relaxed">
              Every component in Standor eliminates friction from the technical interview process —
              from the first keystroke to the final hiring decision.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="w-full py-24 px-6 lg:px-12 mt-12 md:mt-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything you need to hire top talent
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Production-grade features built for enterprise scale and developer experience.
            </p>
          </motion.div>

          <FeatureGrid features={FEATURES} />
        </div>
      </section>

      {/* Comparison Section */}
      <section className="w-full py-24 px-6 lg:px-12 mt-12 md:mt-16 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[10px] font-mono text-[var(--accent)] uppercase tracking-widest mb-4">
              Comparison
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why teams choose Standor
            </h2>
            <p className="text-lg text-white/60">
              See how we stack up against the alternatives.
            </p>
          </motion.div>

          <ComparisonGrid rows={COMPARISON_DATA} columns={COMPARISON_COLUMNS} />
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        heading="Ready to transform your hiring?"
        description="Join thousands of companies using Standor to hire top engineering talent faster and more effectively."
        primaryCTA={{
          text: 'Get Started Free',
          href: '/register',
          ariaLabel: 'Sign up for a free Standor account',
        }}
        secondaryCTA={{
          text: 'Schedule Demo',
          href: '/demo',
          ariaLabel: 'Schedule a product demonstration',
        }}
        className="mt-12 md:mt-16"
      />

      {/* Trust Signals Section */}
      <section className="w-full py-16 px-6 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">99.9%</div>
              <div className="text-sm text-white/60">Uptime SLA</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">12+</div>
              <div className="text-sm text-white/60">Global Regions</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">10K+</div>
              <div className="text-sm text-white/60">Interviews Conducted</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-sm text-white/60">Companies Trust Us</div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
