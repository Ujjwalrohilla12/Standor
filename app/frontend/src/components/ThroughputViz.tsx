import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

const BARS = [
    { label: 'TCP', color: '#0A84FF', base: 72 },
    { label: 'TLS', color: '#A855F7', base: 58 },
    { label: 'HTTP', color: '#FF9F0A', base: 44 },
    { label: 'DNS', color: '#32D74B', base: 28 },
    { label: 'UDP', color: '#FF453A', base: 18 },
];

export default function ThroughputViz() {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: false, margin: '-80px' });
    const [tick, setTick] = useState(0);
    const [counter, setCounter] = useState(0);

    // Animate counter
    useEffect(() => {
        if (!inView) return;
        const id = setInterval(() => {
            setTick(t => t + 1);
            setCounter(c => Math.min(c + 187341, 10_000_000));
        }, 60);
        return () => clearInterval(id);
    }, [inView]);

    return (
        <div ref={ref} className="space-y-4 w-full">
            {/* Live counter */}
            <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold text-white tabular-nums tracking-tighter">
                    {counter.toLocaleString()}
                </span>
                <span className="text-[10px] font-mono text-ns-grey-600 uppercase tracking-widest">packets / session</span>
            </div>

            {/* Protocol throughput bars */}
            {BARS.map((bar, i) => {
                const jitter = Math.sin(tick * 0.18 + i * 1.1) * 12;
                const width = Math.max(8, Math.min(98, bar.base + jitter));
                return (
                    <div key={bar.label} className="flex items-center gap-3">
                        <span className="text-[9px] font-mono text-ns-grey-600 uppercase tracking-widest w-8 shrink-0">{bar.label}</span>
                        <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                            <motion.div
                                className="h-full rounded-full"
                                animate={{ width: `${width}%` }}
                                transition={{ duration: 0.2, ease: 'linear' }}
                                style={{ backgroundColor: bar.color, boxShadow: `0 0 8px ${bar.color}60` }}
                            />
                        </div>
                        <span className="text-[9px] font-mono w-8 text-right shrink-0" style={{ color: bar.color }}>
                            {Math.round(width)}%
                        </span>
                    </div>
                );
            })}

            {/* Latency callout */}
            <div className="mt-5 pt-4 border-t border-white/[0.05] flex items-center gap-6">
                <div>
                    <p className="text-xs font-bold text-white">&lt;50ms</p>
                    <p className="text-[9px] font-mono text-ns-grey-700 uppercase tracking-widest">Reconstruction</p>
                </div>
                <div>
                    <p className="text-xs font-bold text-white">5 GB/s</p>
                    <p className="text-[9px] font-mono text-ns-grey-700 uppercase tracking-widest">Ingestion</p>
                </div>
                <div>
                    <p className="text-xs font-bold text-white">0 loss</p>
                    <p className="text-[9px] font-mono text-ns-grey-700 uppercase tracking-widest">Packet drop</p>
                </div>
            </div>
        </div>
    );
}
