'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Shield, Users, Zap } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { FeatureGrid } from '@/components/FeatureGrid';
import { HowItWorks } from '@/components/HowItWorks';
import { Footer } from '@/components/Footer';

// Lazy-load heavy 3D hero — fallback shown until JS hydrates
const Hero3D = dynamic(() => import('@/components/3d/Hero3D'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[480px] items-center justify-center">
      <div className="h-64 w-64 animate-pulse rounded-full bg-teal-500/10" />
    </div>
  ),
});

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg-base">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pb-24 pt-20">
        {/* Subtle dot grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#26282B_1px,transparent_0)] bg-[size:32px_32px] opacity-60"
        />
        {/* Radial glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[480px] w-[800px] rounded-full bg-teal-500/5 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Left: copy */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="max-w-xl"
            >
              <motion.div variants={fadeUp}>
                <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-400">
                  <Zap className="h-3 w-3" aria-hidden="true" />
                  Real-time · AI-powered · 100% free stack
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-display font-extrabold tracking-tight text-text-primary"
              >
                The standard for{' '}
                <span className="text-gradient">technical interviews</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-6 text-lg leading-8 text-text-secondary"
              >
                Collaborate in Monaco editor in real-time, run code in 20+ languages,
                get instant AI feedback, and close hires faster — all in one room.
              </motion.p>

              <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-4">
                <Link href="/register" className="btn-primary px-6 py-3 text-base">
                  Start for free
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/login" className="btn-secondary px-6 py-3 text-base">
                  <Play className="h-4 w-4" aria-hidden="true" />
                  See a demo
                </Link>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="mt-8 flex flex-wrap gap-5 text-sm text-text-tertiary"
              >
                {['No credit card', 'Open source', 'WCAG AA'].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-teal-500" aria-hidden="true" />
                    {t}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: 3D hero */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative rounded-panel overflow-hidden border border-border"
            >
              <Hero3D />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Social proof numbers ── */}
      <section className="border-y border-border bg-bg-surface py-10">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-8 sm:grid-cols-4"
          >
            {[
              { label: 'Interviews run', value: '12,000+' },
              { label: 'Languages', value: '20+' },
              { label: 'Avg session', value: '47 min' },
              { label: 'AI accuracy', value: '94%' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-extrabold text-text-primary">{stat.value}</p>
                <p className="mt-1 text-sm text-text-secondary">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <FeatureGrid />
      <HowItWorks />

      {/* ── CTA banner ── */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="card-elevated rounded-panel p-12"
          >
            {/* Teal glow behind CTA card */}
            <div aria-hidden className="pointer-events-none absolute inset-0 rounded-panel bg-teal-500/5" />
            <Users className="mx-auto mb-4 h-10 w-10 text-teal-400" aria-hidden="true" />
            <h2 className="text-display-sm font-extrabold text-text-primary">
              Ready to run better interviews?
            </h2>
            <p className="mt-3 text-text-secondary">
              Create your first room in 30 seconds — no setup required.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/register" className="btn-primary px-8 py-3 text-base">
                Get started free <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
