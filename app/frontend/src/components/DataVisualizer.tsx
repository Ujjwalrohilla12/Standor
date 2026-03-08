import { motion } from 'framer-motion';

const BARS = [
    { label: 'TLS 1.3', value: 88, color: '#0A84FF' },
    { label: 'HTTP/2', value: 54, color: '#32D74B' },
    { label: 'DNS', value: 37, color: '#FF9F0A' },
    { label: 'QUIC', value: 66, color: '#A855F7' },
    { label: 'SMTP', value: 22, color: '#14B8A6' },
    { label: 'SSH', value: 45, color: '#F97316' },
];

const ENTROPY_POINTS = [72, 85, 61, 90, 55, 78, 92, 68, 84, 96, 73, 80];

export default function DataVisualizer() {
    const maxEntropy = Math.max(...ENTROPY_POINTS);
    const w = 280, h = 80;
    const points = ENTROPY_POINTS.map((v, i) => {
        const x = (i / (ENTROPY_POINTS.length - 1)) * w;
        const y = h - (v / maxEntropy) * h;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="flex flex-col gap-6">
            {/* Traffic Distribution bars */}
            <div>
                <p className="text-[10px] font-mono text-ns-grey-600 uppercase tracking-widest mb-4">Protocol Traffic Distribution</p>
                <div className="space-y-2.5">
                    {BARS.map((b, i) => (
                        <div key={b.label} className="flex items-center gap-3">
                            <span className="text-[10px] font-mono text-ns-grey-600 w-12 shrink-0">{b.label}</span>
                            <div className="flex-1 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${b.value}%` }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, delay: i * 0.08, ease: [0.22, 0.9, 0.3, 1] }}
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: b.color, boxShadow: `0 0 8px ${b.color}60` }}
                                />
                            </div>
                            <span className="text-[10px] font-mono text-ns-grey-700 w-8 text-right">{b.value}%</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Entropy Timeline */}
            <div>
                <p className="text-[10px] font-mono text-ns-grey-600 uppercase tracking-widest mb-4">Session Entropy Score</p>
                <div className="relative">
                    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 80 }}>
                        {/* Grid lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map(t => (
                            <line
                                key={t}
                                x1={0} y1={h * (1 - t)}
                                x2={w} y2={h * (1 - t)}
                                stroke="rgba(255,255,255,0.04)"
                                strokeWidth={1}
                            />
                        ))}
                        {/* Area fill */}
                        <defs>
                            <linearGradient id="entropyGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#0A84FF" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#0A84FF" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <motion.polygon
                            points={`0,${h} ${points} ${w},${h}`}
                            fill="url(#entropyGrad)"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                        />
                        {/* Line */}
                        <motion.polyline
                            points={points}
                            fill="none"
                            stroke="#0A84FF"
                            strokeWidth={1.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0, opacity: 0 }}
                            whileInView={{ pathLength: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                            style={{ pathLength: 0 }}
                        />
                        {/* Anomaly spike indicator */}
                        <motion.circle
                            cx={(9 / 11) * w} cy={h - (96 / maxEntropy) * h}
                            r={3}
                            fill="#FF453A"
                            style={{ boxShadow: '0 0 8px red' }}
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: 1.2 }}
                        />
                    </svg>
                    <div className="flex justify-between mt-1">
                        {['00:00', '01:00', '02:00', '03:00', '04:00', '05:00'].map(t => (
                            <span key={t} className="text-[8px] font-mono text-ns-grey-800">{t}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
