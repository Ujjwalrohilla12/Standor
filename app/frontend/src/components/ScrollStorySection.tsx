import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, AnimatePresence } from 'framer-motion';

// ── Story steps ────────────────────────────────────────────
const STEPS = [
    {
        step: '01',
        label: 'Capture',
        title: 'Packets Enter the Network',
        body: 'Lightweight capture agents deployed across network boundaries ingest raw traffic — TCP, UDP, ICMP — at line rate without packet loss, streaming directly into the ingestion layer.',
        activeNodes: [0, 1],
        activeEdges: [0],
        packetColor: '#32D74B',
    },
    {
        step: '02',
        label: 'Reconstruction',
        title: 'TLS Streams Reassembled',
        body: "Standor's stateful engine reassembles fragmented TCP segments and maps TLS sessions across thousands of concurrent flows — restoring full protocol context that raw captures obscure.",
        activeNodes: [1, 2, 3],
        activeEdges: [0, 1, 2],
        packetColor: '#0A84FF',
    },
    {
        step: '03',
        label: 'Deep Inspection',
        title: 'DPI Node Activates',
        body: 'Protocol decoders and the entropy engine run in sandboxed workers. Shannon scoring, L7 dissection, covert tunnel detection, and anomaly classification happen in parallel — sub-second.',
        activeNodes: [2, 3, 4],
        activeEdges: [2, 3],
        packetColor: '#A855F7',
    },
    {
        step: '04',
        label: 'Index & Investigate',
        title: 'Sessions Stored for Investigation',
        body: 'Reconstructed sessions are written to the forensic index with SHA-256 integrity manifests. Investigation workspaces open instantly — analysts scrub the timeline, annotate, and collaborate live.',
        activeNodes: [4, 5, 6],
        activeEdges: [3, 4, 5],
        packetColor: '#FF9F0A',
    },
];

// ── SVG Network Diagram ────────────────────────────────────
const NODES = [
    { id: 0, x: 120, y: 80, label: 'Agent', color: '#32D74B' },
    { id: 1, x: 290, y: 50, label: 'Firewall', color: '#FF9F0A' },
    { id: 2, x: 420, y: 160, label: 'Router', color: '#0A84FF' },
    { id: 3, x: 310, y: 260, label: 'Parser', color: '#0A84FF' },
    { id: 4, x: 460, y: 300, label: 'DPI', color: '#A855F7' },
    { id: 5, x: 150, y: 310, label: 'Indexer', color: '#14B8A6' },
    { id: 6, x: 300, y: 390, label: 'Store', color: '#FF9F0A' },
];
const EDGES = [
    { from: 0, to: 1 },
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 4 },
    { from: 4, to: 6 },
    { from: 5, to: 6 },
];

interface PacketDot { id: number; edgeIdx: number; progress: number; color: string }
let dotId = 0;

function NetworkViz({ activeNodes, activeEdges, packetColor }: {
    activeNodes: number[]; activeEdges: number[]; packetColor: string;
}) {
    const [packets, setPackets] = useState<PacketDot[]>([]);

    useEffect(() => {
        setPackets([]);
        let id: ReturnType<typeof setInterval>;
        const spawn = () => {
            if (activeEdges.length === 0) return;
            const edgeIdx = activeEdges[Math.floor(Math.random() * activeEdges.length)];
            setPackets(prev => [...prev.slice(-6), { id: dotId++, edgeIdx, progress: 0, color: packetColor }]);
        };
        spawn();
        id = setInterval(spawn, 900);
        return () => clearInterval(id);
    }, [activeEdges.join(','), packetColor]);

    useEffect(() => {
        let cancelled = false;
        const tick = () => {
            if (cancelled) return;
            setPackets(prev => prev.map(p => {
                const np = p.progress + 0.012;
                return np >= 1 ? null as unknown as PacketDot : { ...p, progress: np };
            }).filter(Boolean));
            requestAnimationFrame(tick);
        };
        const raf = requestAnimationFrame(tick);
        return () => { cancelled = true; cancelAnimationFrame(raf); };
    }, []);

    return (
        <svg viewBox="0 0 580 440" className="w-full h-full" style={{ overflow: 'visible' }}>
            {/* Edges */}
            {EDGES.map((e, i) => {
                const f = NODES[e.from], t = NODES[e.to];
                const active = activeEdges.includes(i);
                return (
                    <motion.line key={i}
                        x1={f.x} y1={f.y} x2={t.x} y2={t.y}
                        stroke={active ? packetColor : 'rgba(255,255,255,0.06)'}
                        strokeWidth={active ? 1.5 : 1}
                        strokeDasharray={active ? 'none' : '5 5'}
                        animate={{ opacity: active ? 1 : 0.3 }}
                        transition={{ duration: 0.5 }}
                    />
                );
            })}

            {/* Nodes */}
            {NODES.map(n => {
                const active = activeNodes.includes(n.id);
                return (
                    <g key={n.id}>
                        {/* Glow ring */}
                        {active && (
                            <motion.circle cx={n.x} cy={n.y} r={22}
                                fill="none" stroke={n.color} strokeWidth="1"
                                initial={{ opacity: 0, r: 14 }}
                                animate={{ opacity: [0.6, 0], r: [18, 30] }}
                                transition={{ duration: 1.4, repeat: Infinity }}
                            />
                        )}
                        {/* Node circle */}
                        <motion.circle cx={n.x} cy={n.y} r={12}
                            fill={active ? n.color + '22' : 'rgba(255,255,255,0.03)'}
                            stroke={active ? n.color : 'rgba(255,255,255,0.12)'}
                            strokeWidth={active ? 1.5 : 0.8}
                            animate={{ opacity: active ? 1 : 0.45 }}
                            transition={{ duration: 0.4 }}
                            style={active ? { filter: `drop-shadow(0 0 6px ${n.color})` } : {}}
                        />
                        {/* Label */}
                        <text x={n.x} y={n.y + 26} textAnchor="middle"
                            fontSize="8.5" fontFamily="monospace" fontWeight="600"
                            fill={active ? n.color : 'rgba(255,255,255,0.3)'}>
                            {n.label}
                        </text>
                    </g>
                );
            })}

            {/* Traveling packets */}
            {packets.map(p => {
                const edge = EDGES[p.edgeIdx];
                if (!edge) return null;
                const f = NODES[edge.from], t = NODES[edge.to];
                const x = f.x + (t.x - f.x) * p.progress;
                const y = f.y + (t.y - f.y) * p.progress;
                return (
                    <circle key={p.id} cx={x} cy={y} r={4} fill={p.color}
                        style={{ filter: `drop-shadow(0 0 5px ${p.color})` }}
                        opacity={0.9} />
                );
            })}
        </svg>
    );
}

// ── Scroll story section ───────────────────────────────────
export default function ScrollStorySection() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [activeStep, setActiveStep] = useState(0);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start start', 'end end'],
    });

    // Map scroll progress → active step index
    useEffect(() => {
        const unsub = scrollYProgress.on('change', v => {
            const idx = Math.min(STEPS.length - 1, Math.floor(v * STEPS.length));
            setActiveStep(idx);
        });
        return unsub;
    }, [scrollYProgress]);

    const step = STEPS[activeStep];

    return (
        <section ref={sectionRef} className="relative" style={{ height: `${STEPS.length * 80}vh` }}>
            {/* Sticky container */}
            <div className="sticky top-0 h-screen flex items-center overflow-hidden">
                {/* Background glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <motion.div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full"
                        animate={{ background: `radial-gradient(ellipse, ${step.packetColor}0F 0%, transparent 65%)` }}
                        transition={{ duration: 0.8 }}
                    />
                </div>

                <div className="ns-container px-6 w-full grid lg:grid-cols-2 gap-20 items-center relative z-10">

                    {/* ── Left: narrative ── */}
                    <div>
                        {/* Section label */}
                        <p className="text-[10px] font-mono text-ns-accent uppercase tracking-wide mb-10">
                            From Raw Packets to Forensic Insight
                        </p>

                        {/* Step list */}
                        <div className="space-y-8">
                            {STEPS.map((s, i) => {
                                const isActive = i === activeStep;
                                return (
                                    <motion.div key={s.step}
                                        animate={{ opacity: isActive ? 1 : 0.25 }}
                                        transition={{ duration: 0.4 }}
                                        className="flex gap-5 cursor-default"
                                    >
                                        {/* Step number + line */}
                                        <div className="flex flex-col items-center gap-2 pt-1 shrink-0">
                                            <motion.div
                                                animate={{
                                                    backgroundColor: isActive ? step.packetColor : 'rgba(255,255,255,0.05)',
                                                    borderColor: isActive ? step.packetColor : 'rgba(255,255,255,0.1)',
                                                }}
                                                transition={{ duration: 0.4 }}
                                                className="w-7 h-7 rounded-full border flex items-center justify-center text-[9px] font-mono font-bold"
                                                style={{ color: isActive ? step.packetColor : 'rgba(255,255,255,0.3)' }}
                                            >
                                                {s.step}
                                            </motion.div>
                                            {i < STEPS.length - 1 && (
                                                <div className="w-px flex-1 min-h-[2rem]"
                                                    style={{ background: isActive ? `linear-gradient(${step.packetColor}, transparent)` : 'rgba(255,255,255,0.05)' }} />
                                            )}
                                        </div>

                                        {/* Text */}
                                        <div className="pb-4">
                                            <p className="text-[9px] font-mono uppercase tracking-widest mb-1"
                                                style={{ color: isActive ? step.packetColor : 'rgba(255,255,255,0.25)' }}>
                                                {s.label}
                                            </p>
                                            <h3 className="text-[clamp(1rem,2vw,1.35rem)] font-bold text-white tracking-tight mb-2">
                                                {s.title}
                                            </h3>
                                            <AnimatePresence mode="wait">
                                                {isActive && (
                                                    <motion.p key={s.step}
                                                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -4 }}
                                                        transition={{ duration: 0.35 }}
                                                        className="text-sm text-ns-grey-500 leading-relaxed max-w-md">
                                                        {s.body}
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Right: sticky network viz ── */}
                    <div className="relative">
                        <div className="ns-glass rounded-3xl border border-white/[0.07] p-6 aspect-[4/3]">
                            <div className="absolute top-4 left-4 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: step.packetColor }} />
                                <span className="text-[9px] font-mono text-ns-grey-600 uppercase tracking-widest">Live Network — {step.label}</span>
                            </div>
                            <AnimatePresence mode="wait">
                                <motion.div key={activeStep} className="w-full h-full pt-6"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}>
                                    <NetworkViz
                                        activeNodes={step.activeNodes}
                                        activeEdges={step.activeEdges}
                                        packetColor={step.packetColor}
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Progress indicator */}
                        <div className="flex gap-1.5 justify-center mt-4">
                            {STEPS.map((_, i) => (
                                <motion.div key={i}
                                    animate={{ width: i === activeStep ? 24 : 6, backgroundColor: i === activeStep ? step.packetColor : 'rgba(255,255,255,0.15)' }}
                                    transition={{ duration: 0.3 }}
                                    className="h-1 rounded-full"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
