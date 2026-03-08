import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Users, Search, Code, Lock, ArrowRight, X, Layers, Activity } from 'lucide-react';
import FadeUp from '../components/FadeUp';
import ParallaxGrid from '../components/ParallaxGrid';
import { cn } from '@/lib/utils';

// ── Types ───────────────────────────────────────────────────

interface Stage {
  id: string;
  label: string;
  desc: string;
  summary: string;
  color: string;
}

const STAGES: Stage[] = [
  {
    id: 'create',
    label: 'Create Session',
    desc: 'Interviewers generate a structured coding interview workspace.',
    summary: 'Standor provisions a real-time collaborative interview environment where candidates and interviewers interact in the same coding workspace.',
    color: '#32D74B'
  },
  {
    id: 'collaborate',
    label: 'Collaborate',
    desc: 'Candidates and interviewers write code together in a synchronized editor.',
    summary: 'CRDT-powered synchronization ensures every keystroke is shared instantly across participants with live cursors and presence indicators.',
    color: '#0A84FF'
  },
  {
    id: 'execute',
    label: 'Execute',
    desc: 'Candidate solutions run inside secure sandbox environments.',
    summary: 'Code execution occurs in isolated containers supporting multiple programming languages with deterministic runtime behavior.',
    color: '#A855F7'
  },
  {
    id: 'analyze',
    label: 'Analyze',
    desc: 'AI models evaluate code quality, complexity, and correctness.',
    summary: 'Standor evaluates algorithmic complexity, detects potential bugs, and analyzes coding style using AI-based code analysis.',
    color: '#FF9F0A'
  },
  {
    id: 'evaluate',
    label: 'Evaluate',
    desc: 'Interview sessions generate structured evaluation insights.',
    summary: 'Complete coding timelines, execution logs, and AI insights are aggregated into structured interview reports.',
    color: '#14B8A6'
  }
];

// ── Components ──────────────────────────────────────────────

const PipelineVisual = ({ activeId, onHover }: { activeId: string | null; onHover: (id: string | null) => void }) => {
  return (
    <div className="relative w-full aspect-[4/3] flex items-center justify-center group/viz">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(10,132,255,0.05),transparent_70%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm flex flex-col gap-4">
        {STAGES.map((stage, i) => {
          const isActive = activeId === stage.id;
          const isAnyActive = activeId !== null;
          const opacity = !isAnyActive ? 1 : isActive ? 1 : 0.4;

          return (
            <motion.div
              key={stage.id}
              onMouseEnter={() => onHover(stage.id)}
              onMouseLeave={() => onHover(null)}
              className={cn(
                "relative px-6 py-5 rounded-3xl border transition-all duration-500 cursor-pointer overflow-hidden",
                isActive ? "bg-white/[0.04]" : "bg-white/[0.015]",
                isActive ? "border-ns-accent/30" : "border-white/[0.05]"
              )}
              style={{ opacity }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: stage.color,
                      boxShadow: isActive ? `0 0 12px ${stage.color}` : 'none'
                    }}
                  />
                  <span className="text-sm font-bold text-white tracking-tight">{stage.label}</span>
                </div>
                <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Stage 0{i + 1}</span>
              </div>

              {/* Pulse background */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-ns-accent/5 -z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Pulsing connection lines */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-[80%] -z-10 flex flex-col items-center">
        <div className="flex-1 w-px bg-white/[0.06]" />
        <motion.div
          className="w-2 h-2 rounded-full bg-ns-accent shadow-[0_0_10px_#0A84FF]"
          animate={{ y: [-150, 150] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  );
};

const StagePanel = ({ stage, onClose }: { stage: Stage | null; onClose: () => void }) => {
  return (
    <AnimatePresence>
      {stage && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-[420px] bg-ns-bg-900 border-l border-white/[0.05] z-[100] p-12 overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="mt-12">
              <span
                className="text-[10px] font-mono uppercase tracking-[0.4em] mb-4 block"
                style={{ color: stage.color }}
              >
                Pipeline Stage
              </span>
              <h3 className="text-3xl font-bold text-white mb-6 tracking-tight">{stage.label}</h3>
              <div className="w-12 h-1 bg-white/[0.05] mb-8" style={{ backgroundColor: `${stage.color}20` }} />

              <p className="text-ns-grey-400 text-lg leading-relaxed mb-10">
                {stage.summary}
              </p>

              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <h4 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">Functional Spec</h4>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-ns-accent mt-1.5 shrink-0" />
                    <span className="text-sm text-ns-grey-500 font-medium">Automatic verification of artifact provenance at intake.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-ns-accent mt-1.5 shrink-0" />
                    <span className="text-sm text-ns-grey-500 font-medium">Zero-copy data path for maximum performance.</span>
                  </li>
                </ul>
              </div>

              <button className="w-full mt-12 py-4 bg-white text-black rounded-full font-bold hover:bg-ns-grey-100 transition-all flex items-center justify-center gap-2 group">
                View Example Export
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ── Main Page Component ─────────────────────────────────────

export default function Architecture() {
  const [hoveredStageId, setHoveredStageId] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);

  return (
    <div className="bg-ns-bg-900 min-h-screen text-white relative selection:bg-ns-accent/30 font-sans">
      <ParallaxGrid />
      <StagePanel stage={selectedStage} onClose={() => setSelectedStage(null)} />

      {/* ── [01] Hero Section ─────────────────────────────── */}
      <section className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-24 pt-48 pb-32">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <FadeUp>
            <div className="relative">
              <div className="absolute -left-12 -top-12 w-64 h-64 bg-ns-accent/5 blur-[100px] rounded-full pointer-events-none" />
              <span className="text-[11px] font-mono tracking-[0.5em] uppercase text-ns-accent mb-6 block font-bold">Capabilities</span>
              <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-bold leading-[1.02] tracking-tighter mb-8 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                Technical interviews, <br /> powered by a single workflow.
              </h1>
              <p className="text-[18px] text-ns-grey-400 leading-[1.6] mb-12 max-w-[60ch]">
                From collaborative coding to AI-powered evaluation — Standor transforms technical interviews into a structured engineering assessment pipeline.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="h-14 px-8 bg-white text-black rounded-full font-bold hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all flex items-center justify-center">
                  Launch Interview
                </button>
                <button className="h-14 px-8 bg-transparent border border-white/10 text-white rounded-full font-bold hover:bg-white/[0.03] transition-all">
                  Explore the Platform
                </button>
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={0.2} className="relative">
            <div className="absolute inset-0 bg-ns-accent/10 blur-[120px] rounded-full opacity-30 animate-pulse pointer-events-none" />
            <div className="relative border border-white/[0.05] bg-white/[0.02] backdrop-blur-md rounded-[40px] overflow-hidden">
              <PipelineVisual activeId={hoveredStageId} onHover={setHoveredStageId} />
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── [02] Summary Strip ────────────────────────────── */}
      <div className="relative z-10 border-y border-white/[0.03] py-8 bg-black/20">
        <p className="text-[13px] text-ns-grey-600 text-center uppercase tracking-[0.2em] font-medium">
          Designed for engineering teams conducting high-quality technical interviews at scale.
        </p>
      </div>

      {/* ── [03] Detailed Visual Pipeline ─────────────────── */}
      <section className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-24 py-40">
        <div className="grid lg:grid-cols-2 gap-24">
          <FadeUp className="flex flex-col">
            <h2 className="text-3xl font-bold tracking-tight mb-8">How interviews flow</h2>
            <p className="text-ns-grey-400 text-lg leading-relaxed mb-12">
              Every technical interview follows the same structured process: session creation, collaborative coding, code execution, AI evaluation, and structured feedback.
            </p>

            <div className="space-y-4">
              {STAGES.map((stage) => (
                <div
                  key={stage.id}
                  onMouseEnter={() => setHoveredStageId(stage.id)}
                  onMouseLeave={() => setHoveredStageId(null)}
                  onClick={() => setSelectedStage(stage)}
                  className={cn(
                    "group flex gap-6 p-4 rounded-2xl cursor-pointer transition-all duration-300",
                    hoveredStageId === stage.id ? "bg-white/[0.03]" : "hover:bg-white/[0.02]"
                  )}
                >
                  <div
                    className="mt-1 w-6 h-6 rounded-full border border-white/10 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{ borderColor: hoveredStageId === stage.id ? stage.color : 'rgba(255,255,255,0.1)' }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-white/40"
                      style={{ backgroundColor: hoveredStageId === stage.id ? stage.color : 'rgba(255,255,255,0.4)' }}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[15px] font-bold text-white mb-1 tracking-tight flex items-center gap-2">
                      {stage.label}
                      <span className="text-[10px] text-ns-grey-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity">→ View Details</span>
                    </h4>
                    <p className="text-sm text-ns-grey-500 leading-relaxed">{stage.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeUp>

          <div className="hidden lg:flex flex-col justify-center">
            <FadeUp delay={0.2} className="relative p-12 rounded-[48px] bg-white/[0.015] border border-white/[0.04]">
              <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-ns-accent/20 to-transparent" />
              <div className="absolute inset-x-12 bottom-0 h-px bg-gradient-to-r from-transparent via-ns-accent/20 to-transparent" />

              <div className="flex flex-col items-center gap-12 py-8">
                {[Activity, Layers, Search, Code, Shield].map((Icon, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      color: hoveredStageId === STAGES[i].id ? STAGES[i].color : 'rgba(255,255,255,0.15)',
                      scale: hoveredStageId === STAGES[i].id ? 1.2 : 1
                    }}
                    className="transition-colors duration-500"
                  >
                    <Icon size={32} strokeWidth={1} />
                  </motion.div>
                ))}
              </div>

              <p className="text-[10px] font-mono text-center text-ns-grey-600 uppercase tracking-widest mt-8">
                Interactive Pipeline Topology
              </p>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── [04] Core Capability Highlights (Staggered) ─────── */}
      <section className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-24 py-32">
        <div className="flex flex-col gap-12">
          <FadeUp>
            <span className="text-[10px] font-mono tracking-[0.5em] uppercase text-ns-grey-600 mb-6 block font-bold">Design Philosophy</span>
            <h2 className="text-4xl font-bold tracking-tight text-white mb-20 max-w-2xl">
              High-fidelity analysis, <br />
              <span className="text-white/40">unburdened by complexity.</span>
            </h2>
          </FadeUp>

          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            {/* Large Hero Capability Card */}
            <FadeUp className="lg:col-span-8">
              <motion.div
                whileHover={{ y: -6, scale: 1.01 }}
                className="h-full p-10 md:p-12 rounded-[24px] bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] relative group overflow-hidden flex flex-col justify-end min-h-[480px]"
              >
                <div className="absolute top-12 right-12 opacity-5 scale-150 rotate-12 group-hover:scale-[1.6] group-hover:rotate-6 transition-transform duration-700">
                  <Zap size={240} strokeWidth={0.5} />
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-ns-accent/10 border border-ns-accent/20 flex items-center justify-center mb-8">
                    <Zap className="text-ns-accent" size={24} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">Real-time collaborative coding</h3>
                  <p className="text-ns-grey-400 text-lg leading-relaxed max-w-xl">
                    Standor enables candidates and interviewers to collaborate in a shared coding editor with live synchronization, cursor presence, and execution logs.
                  </p>
                  <div className="mt-10 flex items-center gap-4 text-xs font-mono text-ns-grey-600 uppercase tracking-widest">
                    <span className="text-ns-accent font-bold">Performance Milestone</span>
                    <span className="w-8 h-px bg-white/10" />
                    <span>Sub-50ms synchronization latency</span>
                  </div>
                </div>
              </motion.div>
            </FadeUp>

            {/* Supporting Stacks */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              <FadeUp delay={0.1} className="flex-1">
                <motion.div
                  whileHover={{ y: -6, scale: 1.01 }}
                  className="p-8 md:p-10 rounded-[24px] bg-white/[0.015] border border-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] h-full flex flex-col justify-center"
                >
                  <Users className="text-ns-accent mb-6" size={24} strokeWidth={1.5} />
                  <h4 className="text-xl font-bold text-white mb-3">Interview collaboration</h4>
                  <p className="text-ns-grey-500 text-sm leading-relaxed">
                    Live cursors, shared code editors, and real-time communication allow interviewers to evaluate candidate reasoning interactively.
                  </p>
                </motion.div>
              </FadeUp>

              <FadeUp delay={0.2} className="flex-1">
                <motion.div
                  whileHover={{ y: -6, scale: 1.01 }}
                  className="p-8 md:p-10 rounded-[24px] bg-white/[0.015] border border-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] h-full flex flex-col justify-center"
                >
                  <Lock className="text-ns-accent mb-6" size={24} strokeWidth={1.5} />
                  <h4 className="text-xl font-bold text-white mb-3">Secure execution environment</h4>
                  <p className="text-ns-grey-500 text-sm leading-relaxed">
                    Candidate code runs in isolated container sandboxes ensuring deterministic execution and secure evaluation.
                  </p>
                </motion.div>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* ── [05] Minimal Architecture Diagram ─────────────── */}
      <section className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-24 py-40 bg-black/5">
        <FadeUp className="text-center mb-20">
          <h2 className="text-2xl font-bold text-white mb-4">Unified Data Lifecycle</h2>
          <p className="text-ns-grey-500 max-w-xl mx-auto">A lossless path from ingestion to verifiable evidence.</p>
        </FadeUp>

        <div className="relative overflow-x-auto pb-12 overflow-y-hidden">
          <div className="min-w-[1000px] flex items-center justify-between pointer-events-none px-4">
            {[
              'Session Creation', 'Collaborative Editor', 'Code Execution', 'AI Analysis', 'Interview Timeline', 'Evaluation Report'
            ].map((box, i) => (
              <div key={box} className="relative flex items-center gap-12">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative z-10 px-8 py-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl group cursor-help pointer-events-auto"
                >
                  <span className="text-sm font-bold text-white tracking-widest uppercase">{box}</span>
                  {/* Tooltip on hover */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-ns-accent text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity rounded pointer-events-none whitespace-nowrap">
                    Stage {i + 1} System Module
                  </div>
                </motion.div>

                {i < 5 && (
                  <div className="relative w-20 flex items-center">
                    <div className="w-full h-px bg-white/[0.1]" />
                    <motion.div
                      className="absolute w-1.5 h-1.5 rounded-full bg-ns-accent shadow-[0_0_8px_#1084FF]"
                      animate={{ left: ['0%', '100%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[10px] font-mono text-ns-grey-600 uppercase tracking-[0.3em]">End-to-End Auditable Flow</p>
        </div>
      </section>

      {/* ── [06] Why This Matters / Pull Quote ────────────── */}
      <section className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-24 py-56 text-center">
        <FadeUp>
          <blockquote className="text-[clamp(1.5rem,4vw,2.5rem)] font-medium text-white max-w-4xl mx-auto leading-tight italic tracking-tight mb-16">
            "Standor transforms technical interviews into structured engineering evaluations."
          </blockquote>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="h-14 px-12 bg-white text-black rounded-full font-bold hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all">
              Start Interviewing
            </button>
            <button className="h-14 px-12 bg-transparent border border-white/10 text-white rounded-full font-bold hover:bg-white/[0.03] transition-all">
              Request Demo
            </button>
          </div>
        </FadeUp>
      </section>

      {/* ── [07] Footer Callout ───────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.03] py-20 px-6 text-center">
        <FadeUp>
          <p className="text-[13px] text-ns-grey-600 font-medium">
            Standor powers modern engineering interviews. <a href="#" className="text-white hover:text-ns-accent transition-colors">Contact us</a> to explore enterprise deployment.
          </p>
        </FadeUp>
      </footer>
    </div>
  );
}
