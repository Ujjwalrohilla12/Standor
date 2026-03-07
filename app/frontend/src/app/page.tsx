'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight, Shield, Users, Lock, Server, Eye,
  Zap, Building2, GraduationCap, Mail
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { HeroSlider } from '@/components/HeroSlider';
import { FeatureGrid } from '@/components/FeatureGrid';
import { HowItWorks } from '@/components/HowItWorks';
import { Footer } from '@/components/Footer';
import { DemoPlayer } from '@/components/DemoPlayer';

const TRUST_LOGOS = ['Google', 'Stripe', 'Figma', 'Linear', 'Vercel', 'Anthropic'];

const SECURITY_ITEMS = [
  {
    Icon: Lock,
    title: 'Sandboxed execution',
    desc: 'All code runs in isolated Piston containers — 2s wall-time limit, zero host access.',
  },
  {
    Icon: Server,
    title: 'Encrypted snapshots',
    desc: 'Code snapshots and AI results are encrypted at rest. Sessions are purged after 30 days.',
  },
  {
    Icon: Eye,
    title: 'No candidate PII',
    desc: 'The platform stores no names or emails beyond what users explicitly provide. GDPR-compliant.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg-base">
      <Navbar />

      {/* ══ §1 HERO SLIDER ═══════════════════════════════════════════════ */}
      <HeroSlider />

      {/* ══ §2 TRUST STRIP ═══════════════════════════════════════════════ */}
      <section className="border-y border-border bg-bg-surface py-8" aria-label="Companies we take inspiration from">
        <div className="mx-auto max-w-5xl px-6">
          <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-text-tertiary">
            Inspired by teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10">
            {TRUST_LOGOS.map((name) => (
              <span key={name} className="text-sm font-bold tracking-tight text-text-tertiary/50">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ §3 METRICS ═══════════════════════════════════════════════════ */}
      <section className="py-14" aria-label="Platform statistics">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-8 sm:grid-cols-4"
          >
            {[
              { label: 'Interviews run',  value: '12,000+' },
              { label: 'Languages',       value: '20+' },
              { label: 'Avg session',     value: '47 min' },
              { label: 'AI accuracy',     value: '94%' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-extrabold text-text-primary">{stat.value}</p>
                <p className="mt-1 text-sm text-text-secondary">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ §4 PRODUCT FEATURES ══════════════════════════════════════════ */}
      <FeatureGrid />

      {/* ══ §5 INTERACTIVE DEMO ══════════════════════════════════════════ */}
      <section className="py-24" aria-labelledby="demo-heading">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.38 }}
            className="mb-12 text-center"
          >
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-400">
              Interactive demo
            </span>
            <h2 id="demo-heading" className="text-display-sm font-extrabold text-text-primary">
              See it in action
            </h2>
            <p className="mt-3 text-text-secondary">
              Watch a candidate type, run code, and receive instant AI feedback — all in one room.
            </p>
          </motion.div>
          <DemoPlayer />
        </div>
      </section>

      {/* ══ §6 HOW IT WORKS ══════════════════════════════════════════════ */}
      <HowItWorks />

      {/* ══ §7 SECURITY ══════════════════════════════════════════════════ */}
      <section className="py-24" aria-labelledby="security-heading">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.38 }}
            className="mb-14 text-center"
          >
            <h2 id="security-heading" className="text-display-sm font-extrabold text-text-primary">
              Built with security in mind
            </h2>
            <p className="mt-3 text-text-secondary">
              From sandboxed execution to GDPR-compliant data handling.
            </p>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-3">
            {SECURITY_ITEMS.map(({ Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                className="card p-6"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-bg-elevated text-text-secondary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mb-2 font-semibold text-text-primary">{title}</h3>
                <p className="text-sm leading-relaxed text-text-secondary">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ §8 AUDIENCE CARDS ════════════════════════════════════════════ */}
      <section className="border-y border-border bg-bg-surface py-20" aria-labelledby="audience-heading">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <h2 id="audience-heading" className="mb-12 text-center text-display-sm font-extrabold text-text-primary">
            Built for every hiring team
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                Icon: Building2,
                title:  'For companies',
                desc:   'Run structured, reproducible interviews with AI scoring. Build an evidence-based hiring pipeline.',
                cta:    'Book a demo',
                accent: 'text-teal-400',
              },
              {
                Icon: Users,
                title:  'For candidates',
                desc:   'Practice in a real interview environment. Receive detailed AI feedback on every submission.',
                cta:    'Try it free',
                accent: 'text-amber-400',
              },
              {
                Icon: GraduationCap,
                title:  'For universities',
                desc:   'Run campus placement drives at scale. Export results and share with recruiting partners.',
                cta:    'Contact us',
                accent: 'text-status-info',
              },
            ].map(({ Icon, title, desc, cta, accent }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                className="card p-6"
              >
                <Icon className={`mb-4 h-7 w-7 ${accent}`} aria-hidden="true" />
                <h3 className="mb-2 font-semibold text-text-primary">{title}</h3>
                <p className="mb-6 text-sm leading-relaxed text-text-secondary">{desc}</p>
                <Link href="/register" className="btn-secondary w-full justify-center py-2 text-sm">
                  {cta} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ §9 FINAL CTA ═════════════════════════════════════════════════ */}
      <section className="py-24" aria-label="Final call to action">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-panel border border-border bg-bg-surface p-12 shadow-elevation-2"
          >
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(14,165,164,0.07),transparent)]" />
            <div className="relative">
              <Mail className="mx-auto mb-4 h-10 w-10 text-teal-400" aria-hidden="true" />
              <h2 className="text-display-sm font-extrabold text-text-primary">
                Ready to run better interviews?
              </h2>
              <p className="mt-3 text-text-secondary">
                Create your first room in 30 seconds — no setup, no credit card.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link href="/register" className="btn-primary px-8 py-3 text-base">
                  Get started free <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/register" className="btn-secondary px-8 py-3 text-base">
                  Book enterprise demo
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
