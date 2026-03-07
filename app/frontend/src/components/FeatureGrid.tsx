'use client';

import { motion } from 'framer-motion';
import { Code2, Video, Zap, Brain, MailCheck, BarChart3 } from 'lucide-react';

const FEATURES = [
  {
    Icon: Code2,
    title: 'Monaco Editor + Yjs',
    desc: 'Google Docs–style real-time editing with CRDT conflict resolution. 0ms latency on same region.',
    accent: 'text-teal-400 bg-teal-500/10',
  },
  {
    Icon: Video,
    title: 'WebRTC Video',
    desc: 'Peer-to-peer video with PeerJS. No extra infra, no plugins — works in every modern browser.',
    accent: 'text-status-info bg-status-info/10',
  },
  {
    Icon: Zap,
    title: '20+ Languages',
    desc: 'Run code instantly via Piston API. Python, JS, Java, C++, Go, Rust and more — 2s timeout.',
    accent: 'text-amber-400 bg-amber-500/10',
  },
  {
    Icon: Brain,
    title: 'AI Code Analysis',
    desc: 'DeepSeek Coder via OpenRouter reviews your code: complexity, bugs, style, tests — in seconds.',
    accent: 'text-teal-400 bg-teal-500/10',
  },
  {
    Icon: MailCheck,
    title: 'Email Reports',
    desc: 'Both participants get a detailed HTML summary with AI scores and code snapshots after each session.',
    accent: 'text-status-success bg-status-success/10',
  },
  {
    Icon: BarChart3,
    title: 'Hiring Analytics',
    desc: 'Track candidate performance across sessions. Compare scores, filter by difficulty, export CSV.',
    accent: 'text-text-secondary bg-bg-subtle',
  },
];

export function FeatureGrid() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-display-sm font-extrabold text-text-primary"
          >
            Everything in one room
          </motion.h2>
          <p className="mt-4 text-text-secondary">
            No cobbling together Zoom + LeetCode + Notion. Standor is your complete interview stack.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ Icon, title, desc, accent }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
              className="card p-6"
            >
              <div className={`mb-4 inline-flex rounded-xl p-2.5 ${accent}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mb-2 font-semibold text-text-primary">{title}</h3>
              <p className="text-sm leading-relaxed text-text-secondary">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
