import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Activity, Users, FileCheck, ArrowRight, Brain, Code2, ShieldCheck, Clock } from 'lucide-react';
import FadeUp from '../components/FadeUp';
import SpotlightCard from '../components/SpotlightCard';
import AnimatedHero from '../components/AnimatedHero';

const PRINCIPLES = [
  {
    icon: Activity,
    title: 'Structured evaluation',
    desc: 'Standor replaces ad-hoc feedback with a consistent rubric, clear signal, and a record you can revisit.',
  },
  {
    icon: Users,
    title: 'Human collaboration',
    desc: 'Two engineers working in the same session surfaces communication, problem-solving, and judgment together.',
  },
  {
    icon: FileCheck,
    title: 'Decision-grade reporting',
    desc: 'Every session ends with a clean summary, performance view, and host-only insights that are easy to trust.',
  },
];

const STACK = [
  { icon: Code2, label: 'Monaco editor', desc: 'A familiar, precise coding surface' },
  { icon: Brain, label: 'AI analysis', desc: 'Generalized feedback, not canned prompts' },
  { icon: ShieldCheck, label: 'Private delivery', desc: 'Host reports stay host-only' },
  { icon: Clock, label: 'Session replay', desc: 'A timeline you can review later' },
];

export default function About() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0b0d10] text-[#e5e7eb]">
      <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.09),_transparent_48%)] pointer-events-none" />
      <div className="absolute left-1/2 top-24 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-white/5 blur-[160px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <FadeUp>
          <div className="grid gap-14 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div className="max-w-3xl">
              <p className="mb-6 text-[10px] font-mono uppercase tracking-[0.42em] text-[#2f3237]">About Standor</p>
              <h1 className="text-[clamp(2.6rem,6vw,5.2rem)] font-semibold leading-[0.98] tracking-tight text-[#f8fafc]">
                Engineering interviews,
                <span className="block bg-gradient-to-r from-[#f8fafc] via-[#3b3f44] to-[#23272b] bg-clip-text text-transparent">
                  presented with clarity.
                </span>
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-8 text-[#4b4f55]">
                Standor is built for teams that want a calmer, higher-signal way to evaluate technical ability. The product pairs a human-coded live session with a polished 3D visual layer, then turns the result into a report that feels deliberate rather than noisy.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link to="/register" className="ns-btn-primary">
                  Start for free
                  <ArrowRight size={16} />
                </Link>
                <Link to="/how-it-works" className="ns-btn-secondary">
                  How it works
                </Link>
              </div>
            </div>

            <div className="lg:pl-4">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-3 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <AnimatedHero variant="about" />
              </div>
            </div>
          </div>
        </FadeUp>

        <FadeUp>
          <section className="mt-24">
            <div className="mb-8 flex items-end justify-between gap-6 flex-wrap">
              <div>
                <p className="mb-3 text-[10px] font-mono uppercase tracking-[0.38em] text-[#2f3237]">Why it feels different</p>
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#f8fafc]">Built to feel human, not flashy.</h2>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-[#4b4f55]">
                The page language is intentionally restrained: fewer colors, fewer effects, and more space around the message.
              </p>
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
              className="grid gap-5 md:grid-cols-3"
            >
              {PRINCIPLES.map((principle) => (
                <motion.div
                  key={principle.title}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55 } } }}
                >
                  <SpotlightCard
                    accentColor="#4b4f55"
                    className="h-full rounded-[1.9rem] border border-white/10 bg-white/[0.03] p-8 sm:p-9 transition-all duration-300 hover:-translate-y-1 hover:border-white/15"
                  >
                    <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                      <principle.icon className="text-[#f5f7fa]" size={21} />
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-[#f8fafc]">{principle.title}</h3>
                    <p className="max-w-[34ch] text-sm leading-7 text-[#4b4f55]">{principle.desc}</p>
                  </SpotlightCard>
                </motion.div>
              ))}
            </motion.div>
          </section>
        </FadeUp>

        <FadeUp>
          <section className="mt-24 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div>
              <p className="mb-3 text-[10px] font-mono uppercase tracking-[0.38em] text-[#2f3237]">Platform design</p>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#f8fafc]">A small set of parts, arranged with care.</h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-[#4b4f55]">
                The stack is intentionally compact. Each component serves a visible purpose and stays out of the way of the session itself.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {STACK.map((item) => (
                <div key={item.label} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
                  <item.icon size={19} className="text-[#f5f7fa] mb-4" />
                  <p className="mb-1 text-sm font-semibold text-[#f8fafc]">{item.label}</p>
                  <p className="text-xs leading-6 text-[#2f3237]">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </FadeUp>

        <FadeUp>
          <section className="mt-24 rounded-[2rem] border border-white/10 bg-white/[0.03] px-6 py-10 text-center backdrop-blur-sm sm:px-10 sm:py-14 shadow-[0_28px_90px_rgba(196,199,206,0.06)] transition-shadow duration-300 hover:shadow-[0_32px_110px_rgba(196,199,206,0.10)]">
            <p className="text-[10px] font-mono uppercase tracking-[0.38em] text-[#2f3237]">Closing note</p>
            <h2 className="mx-auto mt-4 max-w-4xl text-2xl sm:text-4xl font-semibold tracking-tight text-[#f8fafc]">
              Standor turns interviews into a cleaner, more respectful product experience.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#4b4f55]">
              It should feel like a premium tool used by serious teams, with enough motion to feel alive and enough restraint to feel trustworthy.
            </p>
          </section>
        </FadeUp>

        <FadeUp>
          <div className="mt-20 flex items-center justify-center gap-4 flex-wrap">
            <Link to="/register" className="ns-btn-primary px-8 py-4 rounded-full text-[15px]">
              Get started
              <ArrowRight size={15} />
            </Link>
            <Link to="/code" className="ns-btn-secondary px-8 py-4 rounded-full text-[15px]">
              See the code page
            </Link>
          </div>
        </FadeUp>
      </div>
    </main>
  );
}