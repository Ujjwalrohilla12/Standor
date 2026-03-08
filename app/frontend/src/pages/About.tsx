import { motion, type Variants } from 'framer-motion';
import { ArrowRight, Activity, Users, FileCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FadeUp from '../components/FadeUp';
import SpotlightCard from '../components/SpotlightCard';
import AnimatedPipeline from '../components/AnimatedPipeline';
import WorkspaceDemo from '../components/WorkspaceDemo';
import DataVisualizer from '../components/DataVisualizer';
import ArchitectureDiagram from '../components/ArchitectureDiagram';
import ParallaxGrid from '../components/ParallaxGrid';
import PacketTimeline from '../components/PacketTimeline';



const PRINCIPLES = [
  {
    icon: Activity,
    title: 'Structure Over Gut Feeling',
    desc: 'Standor replaces ad-hoc interview feedback with structured rubrics, consistent scoring, and reproducible evaluation criteria.',
    accent: 'text-ns-accent',
    bg: 'bg-ns-accent/10',
    border: 'border-ns-accent/20',
    accentHex: '#D8D8E8',
  },
  {
    icon: Users,
    title: 'Collaborate, Don\'t Interrogate',
    desc: 'Two engineers working together in a shared coding environment reveals more signal than one-way whiteboard problems.',
    accent: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    accentHex: '#34D399',
  },
  {
    icon: FileCheck,
    title: 'Evidence-Based Hiring',
    desc: 'Every session produces a timestamped record: code evolution, AI analysis, and interviewer notes — ready for team review.',
    accent: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    accentHex: '#FBBF24',
  },
];

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="bg-ns-bg-900 relative overflow-hidden">

      {/* ── Parallax 3-Layer Background ── */}
      <ParallaxGrid />


      <div className="ns-container relative z-10 px-6 pt-40 pb-32">

        {/* ── HERO ── */}
        <FadeUp>
          <div className="mb-32 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 items-center max-w-6xl">
            {/* Left: headline */}
            <h1 className="text-[clamp(2.2rem,5vw,3.5rem)] font-bold text-white leading-[1.05] tracking-tighter italic">
              Technical Interviews, <br />
              <span className="text-ns-grey-600 not-italic">Reimagined.</span>
            </h1>
            {/* Right: subtitle — vertically aligned to baseline of headline */}
            <p className="text-lg text-ns-grey-400 leading-relaxed font-medium">
              Standor transforms the fragmented technical interview process into a structured, evidence-based evaluation — enabling teams to assess engineering talent in real time, with AI-powered analysis and complete session replay.
            </p>
          </div>
        </FadeUp>

        {/* ── THE PROBLEM ── */}
        <div className="mb-32 max-w-4xl">
          <FadeUp>
            <p className="text-[10px] font-mono text-ns-accent uppercase tracking-wide mb-4">The Problem</p>
            <h2 className="text-3xl font-bold text-white tracking-tight leading-snug mb-8">The Technical Interview Process Is Broken</h2>
            <div className="space-y-4 text-ns-grey-400 leading-relaxed">
              <p>Hiring teams rely on rushed, inconsistent interviews that reveal almost nothing about how a candidate thinks. Notes are incomplete, feedback is subjective, and decisions are made on gut instinct.</p>
              <p>Traditional interview tools focus on the editor — but rarely capture the full picture: how the candidate approached the problem, where they got stuck, and how they communicated under pressure.</p>
              <p className="text-white font-semibold">Standor was built to fix that.</p>
            </div>
          </FadeUp>
        </div>



        {/* ── HOW IT WORKS: Animated Pipeline ── */}
        <div className="mb-32">
          <FadeUp>
            <p className="text-[10px] font-mono text-ns-accent uppercase tracking-widest text-center mb-4">How It Works</p>
            <h2 className="text-3xl font-bold text-white tracking-tight text-center mb-16">How Standor Structures the Interview</h2>
          </FadeUp>
          <div className="grid lg:grid-cols-2 gap-16 items-start max-w-6xl mx-auto">
            {/* Left: text */}
            <FadeUp>
              <div className="space-y-6 text-ns-grey-400 text-lg leading-relaxed">
                <p>When a session starts, Standor provisions a shared coding environment with Monaco Editor — synced live between interviewer and candidate via CRDTs. Both participants see the same state, in real time.</p>
                <p>As the candidate codes, Standor captures periodic snapshots of the solution's evolution. At any point, the interviewer can trigger AI analysis — powered by Standor AI — to evaluate correctness, complexity, and code quality.</p>
                <p>Every session produces a structured forensic record: the full code history, AI evaluation scores, and a timeline of events — ready for async review by the broader hiring team.</p>
                <div className="flex items-center gap-3 mt-8">
                  <div className="w-2 h-2 rounded-full bg-ns-accent shadow-[0_0_8px_rgba(10,132,255,0.8)]" />
                  <span className="text-sm font-mono text-ns-grey-500">Live CRDT sync animation</span>
                </div>
              </div>
            </FadeUp>
            {/* Right: pipeline */}
            <FadeUp delay={0.1}>
              <AnimatedPipeline />
            </FadeUp>
          </div>
        </div>

        {/* ── INVESTIGATION WORKSPACE ── */}
        <div className="mb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            {/* Left: UI demo */}
            <FadeUp className="order-2 lg:order-1">
              <WorkspaceDemo />
            </FadeUp>

            {/* Right: text */}
            <FadeUp delay={0.1} className="order-1 lg:order-2">
              <div className="space-y-6">
                <p className="text-[10px] font-mono text-ns-accent uppercase tracking-widest">Interview Interface</p>
                <h2 className="text-3xl font-bold text-white tracking-tight">Inside the Coding Interview Environment</h2>
                <div className="space-y-4 text-ns-grey-400 leading-relaxed text-lg">
                  <p>Standor provides a unified environment for collaborative coding, AI-powered feedback, and structured evaluation — all inside a single browser tab, with no setup required.</p>
                  <p>Interviewers can observe the candidate's thinking in real time, trigger AI analysis mid-session, and add timestamped annotations that become part of the session record.</p>
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  {['Shared Monaco Editor', 'Live AI Analysis', 'Timestamped Notes', 'Team Presence'].map(t => (
                    <span key={t} className="px-3 py-1 rounded-full border border-white/[0.07] text-[10px] font-mono text-ns-grey-600 bg-white/[0.02]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </FadeUp>
          </div>
        </div>

        {/* ── PACKET TIMELINE ── */}
        <FadeUp>
          <div className="max-w-6xl mx-auto mb-32 p-8 ns-glass rounded-3xl border border-white/[0.05]">
            <div className="mb-2">
              <p className="text-[10px] font-mono text-ns-accent uppercase tracking-widest mb-2">Deep Dive</p>
              <h2 className="text-2xl font-bold text-white tracking-tight mb-1">Interview Session Timeline</h2>
              <p className="text-sm text-ns-grey-500">Hover to inspect code snapshots, AI analysis triggers, and key moments in the session.</p>
            </div>
            <PacketTimeline />
          </div>
        </FadeUp>

        {/* ── CORE PRINCIPLES: Spotlight Cards ── */}
        <div className="mb-32">
          <FadeUp>
            <p className="text-[10px] font-mono text-ns-accent uppercase tracking-widest text-center mb-4">Principles</p>
            <h2 className="text-3xl font-bold text-white tracking-tight text-center mb-12">Core Design Principles</h2>
          </FadeUp>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto"
          >
            {PRINCIPLES.map((p) => (
              <motion.div key={p.title} variants={fadeItem}>
                <SpotlightCard
                  accentColor={p.accentHex}
                  className="ns-glass p-8 rounded-3xl border border-white/[0.05] hover:border-white/[0.12] hover:-translate-y-1.5 transition-all duration-500 h-full"
                >
                  <div className={`w-12 h-12 rounded-xl ${p.bg} flex items-center justify-center mb-6 border ${p.border}`}>
                    <p.icon className={p.accent} size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{p.title}</h3>
                  <p className="text-ns-grey-500 leading-relaxed text-sm">{p.desc}</p>
                </SpotlightCard>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── DATA VISUALIZATION ── */}
        <div className="mb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-start max-w-6xl mx-auto">
            {/* Left: text */}
            <FadeUp>
              <div className="space-y-6">
                <p className="text-[10px] font-mono text-ns-accent uppercase tracking-widest">Under The Hood</p>
                <h2 className="text-3xl font-bold text-white tracking-tight">Understanding Candidate Performance</h2>
                <div className="space-y-4 text-ns-grey-400 leading-relaxed text-lg">
                  <p>Standor tracks code evolution, complexity progression, and AI scoring across the session — surfacing behavioral patterns invisible in a traditional interview debrief.</p>
                  <p>A sudden pivot in approach, improving complexity scores, or consistent edge-case handling all become visible signals — giving hiring teams quantifiable data to support their decision.</p>
                </div>
              </div>
            </FadeUp>
            {/* Right: data chart */}
            <FadeUp delay={0.1}>
              <div className="p-8 ns-glass rounded-3xl border border-white/[0.05]">
                <DataVisualizer />
              </div>
            </FadeUp>
          </div>
        </div>

        {/* ── ARCHITECTURE DIAGRAM ── */}
        <div className="mb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-start max-w-6xl mx-auto">
            {/* Left: diagram */}
            <FadeUp className="order-2 lg:order-1">
              <div className="p-8 ns-glass rounded-3xl border border-white/[0.05]">
                <ArchitectureDiagram />
              </div>
            </FadeUp>
            {/* Right: text */}
            <FadeUp delay={0.1} className="order-1 lg:order-2">
              <div className="space-y-6">
                <p className="text-[10px] font-mono text-ns-accent uppercase tracking-widest">Platform Design</p>
                <h2 className="text-3xl font-bold text-white tracking-tight">Standor Platform Architecture</h2>
                <p className="text-ns-grey-400 leading-relaxed text-lg">
                  Standor is built as a modular interview infrastructure designed for scale. The collaborative editor, AI analysis engine, session recorder, and replay system operate as independent components — deployable as a managed SaaS or self-hosted in your own cloud environment.
                </p>
              </div>
            </FadeUp>
          </div>
        </div>



        {/* ── BRAND STATEMENT ── */}
        <FadeUp>
          <div className="text-center mb-24 max-w-5xl mx-auto px-6 py-16 border-y border-white/[0.05]">
            <p className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold text-white tracking-tight italic">
              "Standor transforms technical interviews into structured engineering evaluations."
            </p>
          </div>
        </FadeUp>

        {/* ── CTA ── */}
        <FadeUp>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 sm:gap-6">
            <button
              onClick={() => navigate('/register')}
              className="group px-10 py-4 bg-white text-black rounded-full font-bold hover:bg-ns-grey-100 transition-all flex items-center justify-center gap-2 shadow-2xl w-full sm:w-auto"
            >
              Start Interviewing
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/how-it-works')}
              className="px-10 py-4 rounded-full border border-white/10 text-white font-bold hover:bg-white/5 transition-all text-sm uppercase tracking-widest w-full sm:w-auto text-center"
            >
              See How Standor Works
            </button>
          </div>
        </FadeUp>

      </div>
    </div>
  );
}