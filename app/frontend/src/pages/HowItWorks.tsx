import { ArrowDown } from 'lucide-react';
import FadeUp from '../components/FadeUp';
import { motion } from 'framer-motion';
import { useState } from 'react';
import NetworkTopology from '../components/NetworkTopology';

const STEPS = [
    {
        num: 1,
        title: 'Ingest',
        subtitle: 'Raw Network Traffic',
        desc: 'Securely import PCAP/PCAPNG captures or stream live packet data through containerized agents.',
        highlight: ['Agent', 'Firewall', 'Collector']
    },
    {
        num: 2,
        title: 'Reconstruct',
        subtitle: 'Protocol Reassembly',
        desc: 'Automatically detect OSI protocols and rebuild fragmented packets into complete TCP, TLS, and application-layer streams.',
        highlight: ['Parser', 'Router', 'Collector']
    },
    {
        num: 3,
        title: 'Deep Dive',
        subtitle: 'Temporal Exploration',
        desc: 'Explore reconstructed sessions through interactive timelines. Scrub traffic flows, inspect payloads, and trace anomalies.',
        highlight: ['DPI', 'Indexer', 'Router']
    },
    {
        num: 4,
        title: 'Verify',
        subtitle: 'Forensic Integrity',
        desc: 'Export structured reports with cryptographically verifiable chain-of-custody logs, ensuring defensible results.',
        highlight: ['Store', 'Client A', 'Client B']
    },
];

export default function HowItWorks() {
    const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);

    return (
        <div className="pt-40 pb-24 px-6 bg-ns-bg-900">
            <div className="ns-container">

                {/* Header */}
                <FadeUp>
                    <div className="max-w-3xl mb-8">

                        <h1 className="text-[clamp(1.75rem,5vw,2.75rem)] font-bold text-white leading-[1.1] tracking-tight mb-4 italic whitespace-nowrap">
                            Zero to Insight, <span className="text-ns-grey-600 not-italic">in Milliseconds.</span>
                        </h1>
                        <p className="text-lg text-ns-grey-400 leading-relaxed font-medium max-w-xl">
                            From raw packet captures to verified forensic evidence. Standor reconstructs network traffic, surfaces hidden tunnels, and enables teams to investigate incidents in real time.
                        </p>
                    </div>
                </FadeUp>

                {/* Visual Section */}
                <FadeUp>
                    <div className="">
                        <div className="grid lg:grid-cols-2 gap-12 items-start">
                            {/* Left: steps */}
                            <div>
                                <div className="space-y-0">
                                    {STEPS.map((s, idx) => (
                                        <div key={s.num} className="relative">
                                            <motion.div
                                                initial={{ opacity: 0, x: -16 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.4, delay: idx * 0.08 }}
                                                viewport={{ once: true, margin: '-60px' }}
                                                onMouseEnter={() => setHighlightedNodes(s.highlight)}
                                                onMouseLeave={() => setHighlightedNodes([])}
                                                className="flex gap-8 group py-4"
                                            >
                                                <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0 font-bold text-ns-grey-500 group-hover:bg-white group-hover:text-black group-hover:border-white transition-all duration-300 text-base z-10">
                                                    {s.num}
                                                </div>
                                                <div className="pt-1">
                                                    <h4 className="text-[10px] font-mono text-ns-accent uppercase tracking-widest mb-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                        {s.subtitle}
                                                    </h4>
                                                    <h3 className="text-xl font-bold text-white mb-1.5 tracking-tight group-hover:text-ns-accent transition-colors">
                                                        {s.title}
                                                    </h3>
                                                    <p className="text-sm text-ns-grey-500 leading-relaxed max-w-md">
                                                        {s.desc}
                                                    </p>
                                                </div>
                                            </motion.div>

                                            {/* Connector line/arrow */}
                                            {idx < STEPS.length - 1 && (
                                                <div className="absolute left-6 top-12 bottom-0 w-px flex flex-col items-center">
                                                    <div className="h-full w-px bg-gradient-to-b from-white/20 to-transparent" />
                                                    <ArrowDown size={14} className="text-ns-grey-700 absolute -bottom-4" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right: NetworkTopology visual */}
                            <div className="lg:sticky lg:top-24 aspect-square ns-glass-dark rounded-[2rem] border border-white/[0.05] relative overflow-hidden shadow-2xl">
                                <NetworkTopology highlightedNodes={highlightedNodes} />
                            </div>
                        </div>
                    </div>
                </FadeUp>

            </div>
        </div>
    );
}
