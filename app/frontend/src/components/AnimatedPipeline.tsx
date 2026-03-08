import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

const STAGES = [
    { label: 'Capture Agent', sub: 'PCAP / Stream Input', color: '#32D74B' },
    { label: 'Protocol Parser', sub: 'OSI L2–L7 Decode', color: '#0A84FF' },
    { label: 'DPI Engine', sub: 'Entropy & Anomaly', color: '#A855F7' },
    { label: 'Forensic Index', sub: 'Hash & Metadata', color: '#FF9F0A' },
    { label: 'Investigation UI', sub: 'Collaborative Analysis', color: '#14B8A6' },
];

const CYCLE_DURATION = 5600; // ms per full run

export default function AnimatedPipeline() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: false, margin: '-80px' });
    const [activeStage, setActiveStage] = useState(-1);
    const [packetPos, setPacketPos] = useState<{ idx: number; progress: number } | null>(null);

    useEffect(() => {
        if (!isInView) return;

        let cancelled = false;
        let frame = 0;

        const run = async () => {
            const stageDelay = CYCLE_DURATION / STAGES.length;
            while (!cancelled) {
                for (let i = 0; i < STAGES.length; i++) {
                    if (cancelled) break;
                    setActiveStage(i);

                    // Animate packet between stages
                    if (i < STAGES.length - 1) {
                        const startTime = performance.now();
                        const travel = 1200;
                        await new Promise<void>(resolve => {
                            const tick = () => {
                                const elapsed = performance.now() - startTime;
                                const progress = Math.min(elapsed / travel, 1);
                                setPacketPos({ idx: i, progress });
                                if (progress < 1 && !cancelled) requestAnimationFrame(tick);
                                else resolve();
                            };
                            requestAnimationFrame(tick);
                        });
                    }
                    await new Promise(r => setTimeout(r, stageDelay - 1200));
                }
                await new Promise(r => setTimeout(r, 500));
                setActiveStage(-1);
                await new Promise(r => setTimeout(r, 400));
            }
        };

        run();
        return () => { cancelled = true; };
    }, [isInView]);

    return (
        <div ref={ref} className="flex flex-col gap-0 w-full max-w-sm mx-auto select-none">
            {STAGES.map((stage, i) => {
                const isActive = activeStage === i;
                const isPast = activeStage > i;

                return (
                    <div key={stage.label} className="flex flex-col items-center">
                        {/* Stage node */}
                        <motion.div
                            animate={{
                                opacity: activeStage < 0 ? 0.4 : isActive || isPast ? 1 : 0.35,
                                scale: isActive ? 1.02 : 1,
                            }}
                            transition={{ duration: 0.4 }}
                            className="w-full"
                        >
                            <div
                                className="relative px-5 py-4 rounded-2xl border transition-all duration-500"
                                style={{
                                    borderColor: isActive ? `${stage.color}50` : 'rgba(255,255,255,0.07)',
                                    backgroundColor: isActive ? `${stage.color}0D` : 'rgba(255,255,255,0.02)',
                                    boxShadow: isActive ? `0 0 20px ${stage.color}18` : 'none',
                                }}
                            >
                                {/* Glow dot */}
                                <motion.div
                                    className="w-2 h-2 rounded-full mb-2"
                                    animate={{
                                        backgroundColor: isActive || isPast ? stage.color : 'rgba(255,255,255,0.2)',
                                        boxShadow: isActive ? `0 0 12px ${stage.color}` : 'none',
                                    }}
                                    transition={{ duration: 0.3 }}
                                />
                                <p className="text-[10px] font-mono uppercase tracking-widest mb-0.5"
                                    style={{ color: isActive ? stage.color : 'rgba(255,255,255,0.3)' }}>
                                    0{i + 1}
                                </p>
                                <h4 className="text-sm font-bold text-white tracking-tight">{stage.label}</h4>
                                <p className="text-[11px] text-ns-grey-600 leading-relaxed mt-0.5">{stage.sub}</p>
                            </div>
                        </motion.div>

                        {/* Connector with animated packet */}
                        {i < STAGES.length - 1 && (
                            <div className="relative flex flex-col items-center" style={{ height: 36, width: 2 }}>
                                {/* Static connector line */}
                                <div className="absolute inset-0 w-px mx-auto bg-gradient-to-b from-white/[0.12] to-transparent" />

                                {/* Traveling packet dot */}
                                {packetPos?.idx === i && (
                                    <motion.div
                                        className="absolute w-2.5 h-2.5 rounded-full z-10"
                                        style={{
                                            top: `${packetPos.progress * 100}%`,
                                            left: '50%',
                                            x: '-50%',
                                            backgroundColor: stage.color,
                                            boxShadow: `0 0 10px ${stage.color}, 0 0 20px ${stage.color}60`,
                                        }}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
