import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

const NODES = [
    { id: 'agent', label: 'Agent', x: 120, y: 40, color: '#32D74B' },
    { id: 'fw', label: 'Firewall', x: 260, y: 100, color: '#FF9F0A' },
    { id: 'parser', label: 'Parser', x: 120, y: 160, color: '#0A84FF' },
    { id: 'dpi', label: 'DPI', x: 260, y: 220, color: '#A855F7' },
    { id: 'store', label: 'Store', x: 120, y: 280, color: '#14B8A6' },
];

const EDGES = [
    { from: 0, to: 1 }, { from: 1, to: 2 },
    { from: 2, to: 3 }, { from: 3, to: 4 },
];

const PACKET_COLORS = ['#0A84FF', '#A855F7', '#32D74B', '#FF9F0A'];

interface PacketState {
    edgeIdx: number;
    progress: number;
    color: string;
    id: number;
}

let pid = 0;

export default function HeroPipelineGraph() {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: false });
    const [packets, setPackets] = useState<PacketState[]>([]);
    const [activeNode, setActiveNode] = useState(-1);

    useEffect(() => {
        if (!inView) return;
        let cancelled = false;

        const spawnPacket = () => {
            const edgeIdx = 0; // always start at beginning
            const p: PacketState = { edgeIdx, progress: 0, color: PACKET_COLORS[pid % PACKET_COLORS.length], id: pid++ };
            setPackets(prev => [...prev.slice(-6), p]);
        };

        const tick = () => {
            if (cancelled) return;
            setPackets(prev =>
                prev
                    .map(p => {
                        const newProgress = p.progress + 0.018;
                        if (newProgress >= 1) {
                            const nextEdge = p.edgeIdx + 1;
                            if (nextEdge >= EDGES.length) return null as unknown as PacketState;
                            return { ...p, edgeIdx: nextEdge, progress: 0 };
                        }
                        return { ...p, progress: newProgress };
                    })
                    .filter(Boolean)
            );
            requestAnimationFrame(tick);
        };

        const spawnId = setInterval(spawnPacket, 900);
        const rafId = requestAnimationFrame(tick);

        return () => {
            cancelled = true;
            clearInterval(spawnId);
            cancelAnimationFrame(rafId);
        };
    }, [inView]);

    // Derive active node from packets
    useEffect(() => {
        if (packets.length === 0) return;
        const last = packets[packets.length - 1];
        if (last.progress > 0.7) setActiveNode(EDGES[last.edgeIdx]?.to ?? -1);
    }, [packets]);

    return (
        <div ref={ref} className="relative w-full h-48 sm:h-64 md:h-80 select-none">
            <svg viewBox="0 0 380 320" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full">
                {/* Edges */}
                {EDGES.map((e, i) => {
                    const from = NODES[e.from], to = NODES[e.to];
                    return (
                        <line key={i}
                            x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                            stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" strokeDasharray="4 4"
                        />
                    );
                })}

                {/* Nodes */}
                {NODES.map((n, i) => {
                    const isActive = activeNode === i;
                    return (
                        <g key={n.id}>
                            <motion.circle
                                cx={n.x} cy={n.y} r={isActive ? 22 : 18}
                                fill={isActive ? `${n.color}22` : 'rgba(255,255,255,0.04)'}
                                stroke={n.color}
                                strokeWidth={isActive ? 1.5 : 0.8}
                                animate={{ r: isActive ? [18, 22, 18] : 18, opacity: isActive ? [0.6, 1, 0.6] : 0.6 }}
                                transition={{ duration: 0.6, repeat: isActive ? Infinity : 0 }}
                            />
                            {isActive && (
                                <motion.circle
                                    cx={n.x} cy={n.y} r={30}
                                    fill="none" stroke={n.color} strokeWidth="0.5"
                                    initial={{ opacity: 0, r: 18 }}
                                    animate={{ opacity: [0.5, 0], r: [18, 36] }}
                                    transition={{ duration: 0.8, repeat: Infinity }}
                                />
                            )}
                            <text x={n.x} y={n.y + 1.5} textAnchor="middle" dominantBaseline="middle"
                                fontSize="7.5" fontFamily="monospace" fontWeight="600"
                                fill={isActive ? n.color : 'rgba(255,255,255,0.45)'}>
                                {n.label}
                            </text>
                        </g>
                    );
                })}

                {/* Traveling packets */}
                {packets.map(p => {
                    const edge = EDGES[p.edgeIdx];
                    if (!edge) return null;
                    const from = NODES[edge.from], to = NODES[edge.to];
                    const x = from.x + (to.x - from.x) * p.progress;
                    const y = from.y + (to.y - from.y) * p.progress;
                    return (
                        <g key={p.id}>
                            <circle cx={x} cy={y} r={4} fill={p.color} opacity={0.9}
                                style={{ filter: `drop-shadow(0 0 5px ${p.color})` }} />
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}
