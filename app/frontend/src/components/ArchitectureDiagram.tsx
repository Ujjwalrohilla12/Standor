import { motion } from 'framer-motion';

const NODES = [
    { id: 0, label: 'Capture Agent', sub: 'Edge collection', color: '#32D74B', x: 50, y: 10 },
    { id: 1, label: 'Packet Ingestion', sub: 'PCAP / Stream', color: '#0A84FF', x: 50, y: 28 },
    { id: 2, label: 'Protocol Parser', sub: 'OSI L2–L7 decoding', color: '#0A84FF', x: 50, y: 46 },
    { id: 3, label: 'DPI Engine', sub: 'Entropy + anomaly', color: '#A855F7', x: 50, y: 64 },
    { id: 4, label: 'Forensic Index', sub: 'Hash + metadata', color: '#FF9F0A', x: 50, y: 82 },
];

const EDGES = [[0, 1], [1, 2], [2, 3], [3, 4]];

export default function ArchitectureDiagram() {
    return (
        <div className="relative w-full">
            {NODES.map((node, i) => (
                <div key={node.id} className="flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 0.9, 0.3, 1] }}
                        className="group relative w-full max-w-xs mx-auto"
                    >
                        <div className="flex items-center gap-4 px-5 py-3 bg-white/[0.025] border border-white/[0.07] rounded-2xl hover:border-white/[0.14] hover:bg-white/[0.04] transition-all duration-300">
                            {/* Node circle */}
                            <div
                                className="w-3 h-3 rounded-full shrink-0 shadow-[0_0_10px_currentColor]"
                                style={{ backgroundColor: node.color, color: node.color }}
                            />
                            <div>
                                <p className="text-sm font-bold text-white tracking-tight">{node.label}</p>
                                <p className="text-[10px] text-ns-grey-600 font-mono">{node.sub}</p>
                            </div>
                            {/* Layer badge */}
                            <div className="ml-auto text-[9px] font-mono text-ns-grey-700 opacity-60">
                                L{i + 1}
                            </div>
                        </div>
                    </motion.div>

                    {/* Connector */}
                    {i < NODES.length - 1 && (
                        <div className="relative flex flex-col items-center w-px h-7 my-0">
                            <div className="absolute inset-0 w-px bg-gradient-to-b from-white/[0.12] to-transparent" />
                            <motion.div
                                className="absolute w-1.5 h-1.5 rounded-full bg-ns-accent/80 shadow-[0_0_6px_rgba(10,132,255,0.8)]"
                                animate={{ y: [0, 24] }}
                                transition={{ duration: 1, delay: i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
