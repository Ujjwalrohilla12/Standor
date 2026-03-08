import { motion, type Variants } from 'framer-motion';
import { ArrowRight, Binary, Clock, Fingerprint, Users, FileCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FadeUp from '../components/FadeUp';
import SpotlightCard from '../components/SpotlightCard';
import ParallaxGrid from '../components/ParallaxGrid';
import PacketTimeline from '../components/PacketTimeline';
import ThroughputViz from '../components/ThroughputViz';
import EntropyRadar from '../components/EntropyRadar';
import HeroPipelineGraph from '../components/HeroPipelineGraph';
import ArchitectureDiagram from '../components/ArchitectureDiagram';

// ── Motion presets ──────────────────────────────────────────
const stagger: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.09 } },
};
const fadeItem: Variants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

// ── Feature Story sections ───────────────────────────────────
const TEAM_EVENTS = [
    { user: 'Alex', color: '#0A84FF', action: 'flagged TLS anomaly on packet #3820' },
    { user: 'Sarah', color: '#32D74B', action: 'opened session timeline at 00:12:44' },
    { user: 'Marcus', color: '#A855F7', action: 'added annotation — covert channel suspected' },
];

export default function Features() {
    const navigate = useNavigate();

    return (
        <div className="bg-ns-bg-900 relative overflow-hidden">

            {/* ── 3-Layer Parallax Background ── */}
            <ParallaxGrid />

            <div className="ns-container relative z-10 px-6 pt-40 pb-32">

                {/* ══════════════════════════════════════════
            1️⃣  HERO — split layout
        ══════════════════════════════════════════ */}
                <div className="mb-36 grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
                    {/* Left: headline */}
                    <FadeUp>

                        <h1 className="text-[clamp(1.6rem,3.5vw,2.5rem)] font-bold text-white leading-[1.05] tracking-tighter mb-8 italic">
                            Everything you need<br />
                            <span className="text-ns-grey-600 not-italic">to master the wire.</span>
                        </h1>
                        <p className="text-xl text-ns-grey-400 leading-relaxed font-medium max-w-lg mb-10">
                            Standor is engineered for high-performance ingestion, deep stateful reconstruction,
                            and real-time team collaboration across live network sessions.
                        </p>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                            <button
                                onClick={() => navigate('/register')}
                                className="group px-8 py-3.5 bg-white text-black rounded-full font-bold hover:bg-ns-grey-100 transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                Get Started
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => navigate('/architecture')}
                                className="px-8 py-3.5 rounded-full border border-white/10 text-white font-bold hover:bg-white/5 transition-all text-sm"
                            >
                                Architecture
                            </button>
                        </div>
                    </FadeUp>

                    {/* Right: animated pipeline graph */}
                    <FadeUp delay={0.15}>
                        <div className="ns-glass rounded-3xl border border-white/[0.06] p-6 relative overflow-hidden">
                            <div className="absolute inset-0 rounded-3xl" style={{ background: 'radial-gradient(circle at 50% 30%, rgba(10,132,255,0.06) 0%, transparent 65%)' }} />
                            <p className="text-[9px] font-mono text-ns-grey-600 uppercase tracking-widest mb-2">Live Pipeline</p>
                            <HeroPipelineGraph />
                        </div>
                    </FadeUp>
                </div>

                {/* ══════════════════════════════════════════
            2️⃣  FEATURE STORY: Performance
        ══════════════════════════════════════════ */}
                <div className="mb-36 max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left: text */}
                        <FadeUp>
                            <p className="text-[10px] font-mono text-ns-accent uppercase tracking-widest mb-4">01 — Performance</p>
                            <h2 className="text-4xl font-bold text-white tracking-tight mb-6 leading-tight">
                                Industrial-Grade<br />Throughput
                            </h2>
                            <p className="text-lg text-ns-grey-400 leading-relaxed mb-8">
                                Stateful TCP/TLS reconstruction with out-of-order segment handling and zero-copy
                                buffer management. Designed for multi-gigabit throughput at sub-millisecond latency.
                            </p>
                            <div className="space-y-3">
                                {['Zero-copy buffer management', 'Out-of-order segment reassembly', 'Multi-core parallel ingestion', 'PCAP + live capture modes'].map(f => (
                                    <div key={f} className="flex items-center gap-3 text-sm text-ns-grey-500">
                                        <div className="w-1 h-1 rounded-full bg-ns-accent shrink-0" />
                                        {f}
                                    </div>
                                ))}
                            </div>
                        </FadeUp>

                        {/* Right: live throughput viz */}
                        <FadeUp delay={0.1}>
                            <div className="ns-glass rounded-3xl border border-white/[0.06] p-8">
                                <p className="text-[9px] font-mono text-ns-grey-600 uppercase tracking-widest mb-6">Protocol Distribution — Live</p>
                                <ThroughputViz />
                            </div>
                        </FadeUp>
                    </div>
                </div>

                {/* ══════════════════════════════════════════
            3️⃣  FEATURE STORY: Temporal Navigation
        ══════════════════════════════════════════ */}
                <div className="mb-36 max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center flex-col-reverse lg:flex-row">
                        {/* Left: timeline viz */}
                        <FadeUp className="order-2 lg:order-1">
                            <div className="ns-glass rounded-3xl border border-white/[0.06] p-8">
                                <p className="text-[9px] font-mono text-ns-grey-600 uppercase tracking-widest mb-4">Session Timeline — hover to inspect</p>
                                <PacketTimeline />
                            </div>
                        </FadeUp>

                        {/* Right: text */}
                        <FadeUp delay={0.1} className="order-1 lg:order-2">
                            <p className="text-[10px] font-mono text-ns-accent uppercase tracking-widest mb-4">02 — Temporal Navigation</p>
                            <h2 className="text-4xl font-bold text-white tracking-tight mb-6 leading-tight">
                                Scrub Through Time,<br />Not Just Packets
                            </h2>
                            <p className="text-lg text-ns-grey-400 leading-relaxed mb-8">
                                Navigate any capture with microsecond precision. Index-backed seeking across
                                multi-gigabyte datasets — jump to any session event instantly without re-parsing.
                            </p>
                            <div className="space-y-3">
                                {['Microsecond-precision timeline', 'Index-backed instant seek', 'Multi-session overlay view', 'Deterministic packet replay'].map(f => (
                                    <div key={f} className="flex items-center gap-3 text-sm text-ns-grey-500">
                                        <div className="w-1 h-1 rounded-full bg-ns-accent shrink-0" />
                                        {f}
                                    </div>
                                ))}
                            </div>
                        </FadeUp>
                    </div>
                </div>

                {/* ══════════════════════════════════════════
            4️⃣  FEATURE STORY: Entropy Analysis
        ══════════════════════════════════════════ */}
                <div className="mb-36 max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left: text */}
                        <FadeUp>
                            <p className="text-[10px] font-mono text-ns-accent uppercase tracking-widest mb-4">03 — Entropy Analysis</p>
                            <h2 className="text-4xl font-bold text-white tracking-tight mb-6 leading-tight">
                                Detect the Hidden<br />Inside Encrypted Traffic
                            </h2>
                            <p className="text-lg text-ns-grey-400 leading-relaxed mb-8">
                                Shannon entropy scoring on every stream detects obfuscated payloads, covert channels,
                                and encrypted tunnels that signature-based tools miss entirely.
                            </p>
                            <div className="space-y-3">
                                {['Shannon entropy per protocol', 'Covert channel fingerprinting', 'Sub-millisecond scoring', 'Automated anomaly flagging'].map(f => (
                                    <div key={f} className="flex items-center gap-3 text-sm text-ns-grey-500">
                                        <div className="w-1 h-1 rounded-full bg-ns-accent shrink-0" />
                                        {f}
                                    </div>
                                ))}
                            </div>
                        </FadeUp>

                        {/* Right: entropy radar */}
                        <FadeUp delay={0.1}>
                            <div className="ns-glass rounded-3xl border border-white/[0.06] p-8 flex flex-col items-center overflow-x-auto">
                                <p className="text-[9px] font-mono text-ns-grey-600 uppercase tracking-widest mb-6 self-start">Entropy Radar — Live</p>
                                <EntropyRadar />
                            </div>
                        </FadeUp>
                    </div>
                </div>

                {/* ══════════════════════════════════════════
            5️⃣  FEATURE STORY: Team Collaboration
        ══════════════════════════════════════════ */}
                <div className="mb-36 max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center flex-col-reverse lg:flex-row">
                        {/* Left: live activity panel */}
                        <FadeUp className="order-2 lg:order-1">
                            <div className="ns-glass rounded-3xl border border-white/[0.06] p-8 space-y-4">
                                <p className="text-[9px] font-mono text-ns-grey-600 uppercase tracking-widest mb-2">Live Collaboration — Active Session</p>
                                {/* Presence bar */}
                                <div className="flex items-center gap-2 pb-4 border-b border-white/[0.05]">
                                    {[['A', '#0A84FF'], ['S', '#32D74B'], ['M', '#A855F7']].map(([l, c]) => (
                                        <div key={l} className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-ns-bg-900"
                                            style={{ backgroundColor: c + '55', borderColor: c + '40' }}>
                                            {l}
                                        </div>
                                    ))}
                                    <span className="text-[9px] font-mono text-ns-grey-600 ml-2">3 analysts in session</span>
                                    <div className="ml-auto flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                        <span className="text-[9px] font-mono text-green-400">LIVE</span>
                                    </div>
                                </div>
                                {/* Activity feed */}
                                {TEAM_EVENTS.map((ev, i) => (
                                    <motion.div
                                        key={ev.user}
                                        initial={{ opacity: 0, x: -8 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.15, duration: 0.4 }}
                                        className="flex items-start gap-3"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: ev.color }} />
                                        <div>
                                            <span className="text-[10px] font-bold" style={{ color: ev.color }}>{ev.user} </span>
                                            <span className="text-[10px] text-ns-grey-600">{ev.action}</span>
                                        </div>
                                    </motion.div>
                                ))}
                                {/* Annotation mock */}
                                <div className="mt-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] overflow-hidden">
                                    <p className="text-[9px] font-mono text-ns-grey-700 mb-1">SHARED FILTER ACTIVE</p>
                                    <p className="text-[11px] text-white font-mono break-all whitespace-normal">src.ip == 172.16.0.22 &amp;&amp; entropy &gt; 7.4</p>
                                </div>
                            </div>
                        </FadeUp>

                        {/* Right: text */}
                        <FadeUp delay={0.1} className="order-1 lg:order-2">
                            <p className="text-[10px] font-mono text-ns-accent uppercase tracking-widest mb-4">04 — Team Collaboration</p>
                            <h2 className="text-4xl font-bold text-white tracking-tight mb-6 leading-tight">
                                Investigate Together,<br />in Real Time
                            </h2>
                            <p className="text-lg text-ns-grey-400 leading-relaxed mb-8">
                                Shared workspace state, cursor presence, filter sync, and real-time annotations —
                                so distributed SOC teams can work as if they're in the same room.
                            </p>
                            <div className="space-y-3">
                                {['Live cursor sync across analysts', 'Shared packet filters & views', 'Annotation threads on any packet', 'Role-based access control'].map(f => (
                                    <div key={f} className="flex items-center gap-3 text-sm text-ns-grey-500">
                                        <div className="w-1 h-1 rounded-full bg-ns-accent shrink-0" />
                                        {f}
                                    </div>
                                ))}
                            </div>
                        </FadeUp>
                    </div>
                </div>

                {/* ══════════════════════════════════════════
            6️⃣  INTERACTIVE SPOTLIGHT FEATURE CARDS
        ══════════════════════════════════════════ */}
                <FadeUp>
                    <div className="max-w-7xl mx-auto mb-36">
                        <p className="text-[10px] font-mono text-ns-accent uppercase tracking-widest text-center mb-4">Capabilities</p>
                        <h2 className="text-3xl font-bold text-white tracking-tight text-center mb-12">More Tools, Less Noise</h2>
                        <motion.div
                            variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
                            className="grid md:grid-cols-3 gap-5"
                        >
                            {[
                                {
                                    icon: Clock,
                                    title: 'Temporal Navigation',
                                    desc: 'Scrub through any session at microsecond precision without re-parsing raw captures.',
                                    accent: '#0A84FF',
                                },
                                {
                                    icon: FileCheck,
                                    title: 'Forensic Compliance',
                                    desc: 'SHA-256 integrity manifests and signed reports for chain-of-custody evidentiary exports.',
                                    accent: '#32D74B',
                                },
                                {
                                    icon: Binary,
                                    title: 'Protocol Decoders',
                                    desc: 'Sandboxed WebWorker decoders for Protobuf, gRPC, Brotli, and 40+ protocols.',
                                    accent: '#A855F7',
                                },
                                {
                                    icon: Fingerprint,
                                    title: 'Entropy Scoring',
                                    desc: 'Shannon entropy analysis detects covert channels inside encrypted payloads.',
                                    accent: '#FF9F0A',
                                },
                                {
                                    icon: Users,
                                    title: 'SOC Collaboration',
                                    desc: 'Real-time analyst presence, annotation threads, and synchronized filter views.',
                                    accent: '#14B8A6',
                                },
                                {
                                    icon: Binary,
                                    title: 'Chain of Custody',
                                    desc: 'Every action is timestamped and recorded for compliance and audit trails.',
                                    accent: '#F472B6',
                                },
                            ].map((card, i) => (
                                <motion.div key={card.title} variants={fadeItem}>
                                    <SpotlightCard className="p-7 ns-glass rounded-2xl border border-white/[0.05] hover:border-white/[0.12] hover:-translate-y-1.5 transition-all duration-500 h-full">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 border"
                                            style={{ backgroundColor: card.accent + '18', borderColor: card.accent + '30' }}>
                                            <card.icon size={18} style={{ color: card.accent }} />
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-2 tracking-tight">{card.title}</h3>
                                        <p className="text-sm text-ns-grey-500 leading-relaxed">{card.desc}</p>
                                    </SpotlightCard>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </FadeUp>

                {/* ══════════════════════════════════════════
            7️⃣  ARCHITECTURE DIAGRAM
        ══════════════════════════════════════════ */}
                <FadeUp>
                    <div className="max-w-7xl mx-auto mb-36">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <p className="text-[10px] font-mono text-ns-accent uppercase tracking-widest mb-4">Platform Architecture</p>
                                <h2 className="text-3xl font-bold text-white tracking-tight mb-6">
                                    Built on a forensically sound data path
                                </h2>
                                <p className="text-ns-grey-400 leading-relaxed mb-8">
                                    From raw bytes to investigation workspace — every layer is designed for correctness,
                                    performance, and tamper-evidence.
                                </p>
                                <div className="space-y-3">
                                    {[
                                        'Agent capture → lossless PCAP stream',
                                        'Protocol reconstruction at L2–L7',
                                        'Entropy + DPI classification engine',
                                        'Immutable forensic index',
                                        'Collaborative investigation UI',
                                    ].map((s, i) => (
                                        <div key={i} className="flex items-center gap-3 text-sm text-ns-grey-500">
                                            <div className="w-5 h-5 rounded-full border border-white/[0.07] flex items-center justify-center text-[9px] font-mono text-ns-grey-600 shrink-0">
                                                {i + 1}
                                            </div>
                                            {s}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="ns-glass rounded-3xl border border-white/[0.06] p-6">
                                <p className="text-[9px] font-mono text-ns-grey-600 uppercase tracking-widest mb-4">Data Flow</p>
                                <ArchitectureDiagram />
                            </div>
                        </div>
                    </div>
                </FadeUp>
            </div>
        </div>
    );
}
