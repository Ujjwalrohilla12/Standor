import { motion, useMotionValue } from 'framer-motion';
import { useState, useRef, useCallback } from 'react';

const TIMELINE_EVENTS = [
    { label: 'TLS Handshake', packets: 12, latency: '38ms', x: 0.08, proto: 'TLS', color: '#0A84FF' },
    { label: 'DNS Query', packets: 2, latency: '4ms', x: 0.22, proto: 'DNS', color: '#32D74B' },
    { label: 'HTTP/2 Stream', packets: 47, latency: '112ms', x: 0.42, proto: 'HTTP', color: '#FF9F0A' },
    { label: 'Covert Channel', packets: 8, latency: '1.2ms', x: 0.61, proto: 'DPI', color: '#A855F7' },
    { label: 'TLS Session', packets: 204, latency: '890ms', x: 0.80, proto: 'TLS', color: '#0A84FF' },
];

const NODES = [
    { label: 'Client', x: 0 },
    { label: 'Firewall', x: 0.33 },
    { label: 'Router', x: 0.66 },
    { label: 'Server', x: 1 },
];

export default function PacketTimeline() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrubX, setScrubX] = useState<number | null>(null);
    const [tooltip, setTooltip] = useState<typeof TIMELINE_EVENTS[0] | null>(null);
    const [hovering, setHovering] = useState(false);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const relX = (e.clientX - rect.left) / rect.width;
        setScrubX(relX);

        // Find nearest event
        const nearest = TIMELINE_EVENTS.reduce((a, b) =>
            Math.abs(b.x - relX) < Math.abs(a.x - relX) ? b : a
        );
        if (Math.abs(nearest.x - relX) < 0.09) setTooltip(nearest);
        else setTooltip(null);
    }, []);

    return (
        <div className="space-y-4">
            {/* Header */}
            <p className="text-[10px] font-mono text-ns-grey-600 uppercase tracking-widest">
                Session Traffic Timeline — hover to inspect
            </p>

            {/* Timeline Container */}
            <div
                ref={containerRef}
                className="relative w-full cursor-crosshair pt-6 pb-10"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => { setHovering(false); setScrubX(null); setTooltip(null); }}
            >
                {/* Horizontal rail */}
                <div className="absolute left-0 right-0" style={{ top: '50%' }}>
                    <div className="h-px w-full bg-white/[0.08]" />
                    {/* Gradient fill up to scrub position */}
                    {scrubX !== null && (
                        <motion.div
                            className="absolute left-0 top-0 h-px"
                            style={{ width: `${scrubX * 100}%`, background: 'rgba(10,132,255,0.4)' }}
                        />
                    )}
                </div>

                {/* Network nodes (Client, Firewall, Router, Server) */}
                {NODES.map((node) => (
                    <div
                        key={node.label}
                        className="absolute flex flex-col items-center"
                        style={{ left: `${node.x * 100}%`, top: '50%', transform: 'translate(-50%, -50%)' }}
                    >
                        <div className="w-3 h-3 rounded-full bg-white/10 border border-white/20" />
                        <span className="text-[8px] font-mono text-ns-grey-700 mt-6 whitespace-nowrap">{node.label}</span>
                    </div>
                ))}

                {/* Events */}
                {TIMELINE_EVENTS.map((ev, i) => {
                    const isHighlighted = tooltip?.label === ev.label;
                    return (
                        <div
                            key={ev.label}
                            className="absolute"
                            style={{ left: `${ev.x * 100}%`, top: '50%', transform: 'translate(-50%, -50%)' }}
                        >
                            <motion.div
                                animate={{
                                    scale: isHighlighted ? 1.6 : 1,
                                    boxShadow: isHighlighted ? `0 0 16px ${ev.color}` : 'none',
                                    backgroundColor: isHighlighted ? ev.color : `${ev.color}99`,
                                }}
                                transition={{ duration: 0.2 }}
                                className="w-2.5 h-2.5 rounded-full cursor-pointer"
                                style={{ backgroundColor: `${ev.color}99` }}
                            />
                        </div>
                    );
                })}

                {/* Scrub vertical line */}
                {scrubX !== null && (
                    <motion.div
                        className="absolute top-0 bottom-0 w-px bg-white/20 z-10 pointer-events-none"
                        style={{ left: `${scrubX * 100}%` }}
                    />
                )}

                {/* Tooltip */}
                {tooltip && scrubX !== null && (
                    <motion.div
                        key={tooltip.label}
                        initial={{ opacity: 0, y: 6, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-20 pointer-events-none"
                        style={{
                            left: `${Math.min(Math.max(scrubX * 100, 8), 80)}%`,
                            top: 'calc(50% - 64px)',
                        }}
                    >
                        <div className="bg-[#0d0d0d] border border-white/[0.12] rounded-xl px-3 py-2.5 shadow-2xl min-w-[120px]">
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tooltip.color }} />
                                <span className="text-[9px] font-mono text-ns-grey-500 uppercase tracking-wider">{tooltip.proto}</span>
                            </div>
                            <p className="text-xs font-bold text-white mb-1">{tooltip.label}</p>
                            <p className="text-[9px] font-mono text-ns-grey-600">{tooltip.packets} packets · {tooltip.latency}</p>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
