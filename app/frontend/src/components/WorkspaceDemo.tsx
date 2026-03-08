import { motion, animate, useMotionValue, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Activity, Search, Shield } from 'lucide-react';

const PACKET_ROWS = [
    { src: '192.168.1.42', dst: '10.0.0.5', proto: 'TLS', size: '1420B', flag: 'ANOMALY' },
    { src: '10.0.0.1', dst: '8.8.8.8', proto: 'DNS', size: '68B', flag: null },
    { src: '172.16.0.22', dst: '10.0.0.5', proto: 'HTTP', size: '892B', flag: 'COVERT' },
    { src: '192.168.1.1', dst: '192.168.1.42', proto: 'TCP', size: '344B', flag: null },
    { src: '10.0.0.5', dst: '172.31.4.88', proto: 'TLS', size: '2048B', flag: null },
];

const TEAM_EVENTS = [
    { user: 'Alex', action: 'inspecting packet #3', color: '#0A84FF', row: 2 },
    { user: 'Sarah', action: 'added annotation', color: '#32D74B', row: 0 },
    { user: 'Alex', action: 'flagged session', color: '#0A84FF', row: 4 },
    { user: 'Marcus', action: 'opened timeline', color: '#A855F7', row: 1 },
];

const STATUS_MESSAGES = [
    'Reconstructing TCP streams…',
    'DPI scan complete — 2 anomalies',
    'Session indexed • SHA-256 verified',
    'Entropy spike detected on port 443',
];

export default function WorkspaceDemo() {
    const [highlighted, setHighlighted] = useState(0);
    const [annotationVisible, setAnnotationVisible] = useState(false);
    const [teamEvent, setTeamEvent] = useState(0);
    const [statusIdx, setStatusIdx] = useState(0);
    const [flashRow, setFlashRow] = useState<number | null>(null);
    const [scanY, setScanY] = useState(0);
    const cursorX = useMotionValue(24);
    const cursorY = useMotionValue(100);

    // Cycle highlighted row every 2.2s + flash on change
    useEffect(() => {
        const id = setInterval(() => {
            setHighlighted(prev => {
                const next = (prev + 1) % PACKET_ROWS.length;
                setFlashRow(next);
                setTimeout(() => setFlashRow(null), 350);
                return next;
            });
            setAnnotationVisible(false);
            setTimeout(() => setAnnotationVisible(true), 380);
        }, 2200);
        return () => clearInterval(id);
    }, []);

    // Cycle team presence toast every 3s
    useEffect(() => {
        const id = setInterval(() => setTeamEvent(prev => (prev + 1) % TEAM_EVENTS.length), 3000);
        return () => clearInterval(id);
    }, []);

    // Cycle status bar message every 4s
    useEffect(() => {
        const id = setInterval(() => setStatusIdx(prev => (prev + 1) % STATUS_MESSAGES.length), 4000);
        return () => clearInterval(id);
    }, []);

    // Scanning line — moves top→bottom continuously
    useEffect(() => {
        let raf: number;
        let start: number;
        const DURATION = 3500;
        const step = (ts: number) => {
            if (!start) start = ts;
            const pct = ((ts - start) % DURATION) / DURATION;
            setScanY(pct * 100);
            raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, []);

    // Smooth cursor path
    useEffect(() => {
        const seq = async () => {
            await animate(cursorX, 140, { duration: 1.3, ease: 'easeInOut' });
            await animate(cursorY, 165, { duration: 0.85, ease: 'easeInOut' });
            await animate(cursorX, 55, { duration: 1.1, ease: 'easeInOut' });
            await animate(cursorY, 110, { duration: 0.7, ease: 'easeInOut' });
            await animate(cursorX, 190, { duration: 1.0, ease: 'easeInOut' });
            await animate(cursorY, 140, { duration: 0.7, ease: 'easeInOut' });
            await animate(cursorX, 80, { duration: 0.9, ease: 'easeInOut' });
            await animate(cursorY, 100, { duration: 0.6, ease: 'easeInOut' });
            seq();
        };
        seq();
    }, []);

    const evt = TEAM_EVENTS[teamEvent];

    return (
        <div className="aspect-[4/3] rounded-2xl bg-[#07090C] border border-white/[0.08] shadow-2xl overflow-hidden flex flex-col hover:border-white/[0.14] transition-colors duration-500 relative">

            {/* macOS chrome */}
            <div className="h-9 border-b border-white/[0.05] bg-white/[0.01] flex items-center px-4 gap-2 shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50 hover:bg-red-500 transition-colors" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50 hover:bg-yellow-500 transition-colors" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50 hover:bg-green-500 transition-colors" />
                {/* URL bar */}
                <div className="ml-2 flex-1 bg-white/[0.04] rounded-md h-4 max-w-[180px] flex items-center px-2 gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-ns-accent/40" />
                    <div className="h-1.5 w-16 bg-white/[0.1] rounded-sm" />
                </div>
                {/* Live status badge */}
                <div className="ml-auto flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[7px] font-mono text-emerald-400 uppercase tracking-widest">Live</span>
                    </div>
                    {/* Team avatars */}
                    {['#0A84FF', '#32D74B', '#A855F7'].map((c, i) => (
                        <div key={i} className="w-5 h-5 rounded-full border border-[#07090C] flex items-center justify-center text-[7px] font-bold text-white"
                            style={{ backgroundColor: c + '60' }}>
                            {['A', 'S', 'M'][i]}
                        </div>
                    ))}
                </div>
            </div>

            {/* App layout */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Sidebar */}
                <div className="w-12 border-r border-white/[0.04] bg-white/[0.01] flex flex-col items-center py-4 gap-3 shrink-0">
                    <div className="w-7 h-7 rounded-lg bg-ns-accent/15 border border-ns-accent/25 flex items-center justify-center">
                        <LayoutDashboard size={12} className="text-ns-accent" />
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                        <Activity size={12} className="text-ns-grey-700" />
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                        <Search size={12} className="text-ns-grey-700" />
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                        <Shield size={12} className="text-ns-grey-700" />
                    </div>
                </div>

                {/* Main panel */}
                <div className="flex-1 flex flex-col overflow-hidden p-2 sm:p-3 gap-2">
                    {/* Top bar */}
                    <div className="flex items-center justify-between shrink-0">
                        <div className="h-4 w-24 bg-white/[0.04] rounded-md" />
                        <div className="flex gap-2">
                            <div className="h-5 w-12 bg-ns-accent/20 rounded-full border border-ns-accent/30" />
                            <div className="h-5 w-12 bg-white/[0.03] rounded-full" />
                        </div>
                    </div>

                    {/* Packet table */}
                    <div className="flex-1 rounded-xl bg-black/20 border border-white/[0.04] overflow-hidden relative">
                        {/* Scanning line */}
                        <div
                            className="pointer-events-none absolute left-0 right-0 h-px z-10"
                            style={{
                                top: `${scanY}%`,
                                background: 'linear-gradient(90deg, transparent 0%, rgba(216,216,232,0.12) 40%, rgba(216,216,232,0.22) 50%, rgba(216,216,232,0.12) 60%, transparent 100%)',
                            }}
                        />
                        {/* Column headers */}
                        <div className="flex items-center px-3 py-1.5 border-b border-white/[0.04] gap-4">
                            {['SRC', 'DST', 'PROTO', 'SZ', 'FLAG'].map(h => (
                                <span key={h} className="text-[8px] font-mono text-ns-grey-700 uppercase tracking-widest flex-1">{h}</span>
                            ))}
                        </div>
                        {/* Rows */}
                        {PACKET_ROWS.map((row, i) => (
                            <motion.div key={i}
                                animate={{
                                    backgroundColor: i === highlighted
                                        ? 'rgba(216,216,232,0.05)'
                                        : i === flashRow
                                            ? 'rgba(216,216,232,0.08)'
                                            : 'transparent',
                                    borderColor: i === highlighted ? 'rgba(216,216,232,0.12)' : 'transparent',
                                }}
                                transition={{ duration: 0.22 }}
                                className="flex items-center px-1.5 sm:px-3 py-1.5 border-b border-transparent gap-2 sm:gap-4 relative"
                            >
                                <span className="text-[7px] sm:text-[8px] font-mono text-ns-grey-600 flex-1 truncate">{row.src}</span>
                                <span className="text-[7px] sm:text-[8px] font-mono text-ns-grey-600 flex-1 truncate">{row.dst}</span>
                                <span className="text-[7px] sm:text-[8px] font-mono text-ns-grey-500 flex-1 truncate">{row.proto}</span>
                                <span className="text-[7px] sm:text-[8px] font-mono text-ns-grey-700 flex-1 truncate">{row.size}</span>
                                <div className="flex-1 hidden xs:block">
                                    {row.flag && (
                                        <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded-full ${row.flag === 'ANOMALY' ? 'bg-red-500/15 text-red-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                                            {row.flag}
                                        </span>
                                    )}
                                </div>
                                {/* Annotation popup */}
                                <AnimatePresence>
                                    {i === highlighted && annotationVisible && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.88, y: -6 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.92, y: -4 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-3 -top-9 bg-[#0B1118] border border-white/[0.14] rounded-xl px-3 py-2 shadow-xl z-20 whitespace-nowrap"
                                        >
                                            <p className="text-[8px] font-bold text-white mb-0.5">{row.proto} Session</p>
                                            <div className="flex gap-3">
                                                <span className="text-[7px] font-mono text-ns-grey-600">Latency: {30 + i * 8}ms</span>
                                                <span className="text-[7px] font-mono text-ns-grey-600">Pkts: {12 + i * 5}</span>
                                                {row.flag && (
                                                    <span className={`text-[7px] font-bold ${row.flag === 'ANOMALY' ? 'text-red-400' : 'text-yellow-400'}`}>
                                                        {row.flag}
                                                    </span>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>

                    {/* Status bar */}
                    <div className="shrink-0 h-5 relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div key={statusIdx}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.25 }}
                                className="absolute inset-0 flex items-center gap-2"
                            >
                                <div className="w-1 h-1 rounded-full bg-ns-accent/60" />
                                <span className="text-[8px] font-mono text-ns-grey-700">{STATUS_MESSAGES[statusIdx]}</span>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Team event toast */}
                    <div className="shrink-0 relative h-5">
                        <AnimatePresence mode="wait">
                            <motion.div key={teamEvent}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.25 }}
                                className="absolute inset-0 flex items-center gap-2"
                            >
                                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: evt.color }} />
                                <span className="text-[8px] font-mono" style={{ color: evt.color }}>{evt.user}</span>
                                <span className="text-[8px] font-mono text-ns-grey-700">{evt.action}</span>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Timeline scrub bar */}
                    <div className="shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="h-0.5 flex-1 bg-white/[0.05] rounded-full relative overflow-hidden">
                                <motion.div
                                    className="absolute left-0 top-0 h-full bg-ns-accent/50 rounded-full"
                                    animate={{ width: ['15%', '78%', '15%'] }}
                                    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                                />
                                <motion.div
                                    className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white border border-ns-accent/60 shadow-[0_0_6px_rgba(216,216,232,0.5)]"
                                    animate={{ left: ['15%', '78%', '15%'] }}
                                    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                                />
                            </div>
                            <span className="text-[8px] font-mono text-ns-grey-700">00:23:45</span>
                        </div>
                    </div>
                </div>

                {/* Animated cursor */}
                <motion.div
                    className="pointer-events-none absolute w-3 h-3 z-20 drop-shadow-lg"
                    style={{ x: cursorX, y: cursorY }}
                >
                    <svg viewBox="0 0 12 12" fill="white">
                        <path d="M0 0L0 9L3 7L5 11L6.5 10.5L4.5 6.5L8 6Z" />
                    </svg>
                </motion.div>
            </div>
        </div>
    );
}
