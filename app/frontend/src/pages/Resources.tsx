import { FileText, Download, ArrowRight, Filter, Search, BookOpen, Video, Newspaper } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RESOURCES = [
  {
    type: 'Whitepaper',
    title: 'Shannon Entropy in Encrypted Tunnel Detection',
    desc: 'A quantitative analysis of using high-order entropy scoring to identify obfuscated C2 channels and unauthorized tunnels without TLS decryption.',
    tags: ['Forensics', 'Mathematics', 'L7'],
    icon: FileText,
    color: '#3B82F6'
  },
  {
    type: 'Guide',
    title: 'High-Performance TCP Reassembly Algorithms',
    desc: 'Deep dive into the zero-copy buffer management and stateful reassembly logic used in the Standor ingestion engine for 10GbE line rates.',
    tags: ['TCP', 'Networking', 'Optimization'],
    icon: BookOpen,
    color: '#8B5CF6'
  },
  {
    type: 'Technical',
    title: 'TLS 1.3 Forensic Workflows & PFS',
    desc: 'Strategies for navigating Perfect Forward Secrecy in modern incident response. Key-log integration and structural analysis of encrypted handshakes.',
    tags: ['Security', 'TLS', 'Compliance'],
    icon: Newspaper,
    color: '#22C55E'
  },
  {
    type: 'Webinar',
    title: 'Collaborative Hunting with CRDTs',
    desc: 'Learn how to leverage real-time state synchronization to reduce MTTR by 40% during multi-analyst forensic investigations.',
    tags: ['IR', 'Collaboration', 'Video'],
    icon: Video,
    color: '#06B6D4'
  },
];

const CATEGORIES = ['All', 'Whitepaper', 'Guide', 'Webinar', 'Technical'];

const FADE_UP: any = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const STAGGER: any = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Resources() {
  const [activeCat, setActiveCat] = useState('All');
  const [search, setSearch] = useState('');

  const filteredResources = RESOURCES.filter(r =>
    (activeCat === 'All' || r.type === activeCat) &&
    (r.title.toLowerCase().includes(search.toLowerCase()) || r.desc.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="ns-container">
        {/* Header */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={STAGGER}
          className="max-w-4xl mb-24"
        >
          <motion.h1 variants={FADE_UP} className="text-[clamp(2.5rem,8vw,5.5rem)] font-bold text-white leading-[0.9] tracking-tighter mb-10">
            Forensic <br />
            <span className="text-ns-grey-600">intelligence.</span>
          </motion.h1>
          <motion.p variants={FADE_UP} className="text-2xl text-ns-grey-400 leading-relaxed font-medium max-w-2xl">
            Deep dives into the protocols, mathematics, and workflows that power modern network forensics at scale.
          </motion.p>
        </motion.div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-wrap gap-2"
          >
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeCat === cat
                  ? 'bg-white text-black'
                  : 'bg-white/[0.03] border border-white/10 text-ns-grey-500 hover:text-white hover:border-white/20'
                  }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative w-full md:w-80"
          >
            <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-ns-grey-700" />
            <input
              type="text"
              placeholder="Search intelligence..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-6 py-3 rounded-full bg-white/[0.03] border border-white/10 text-sm text-white focus:border-ns-accent outline-none transition-all placeholder:text-ns-grey-800"
            />
          </motion.div>
        </div>

        {/* Grid */}
        <motion.div
          layout
          className="grid md:grid-cols-2 gap-8 mb-24"
        >
          <AnimatePresence mode="popLayout">
            {filteredResources.map((res, i) => (
              <motion.div
                layout
                key={res.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="group ns-glass-dark rounded-[2.5rem] border border-white/[0.05] p-10 hover:border-white/15 transition-all duration-500 flex flex-col gap-12"
              >
                <div className="flex justify-between items-start">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/[0.05] transition-all duration-500 text-white group-hover:text-ns-accent">
                    <res.icon size={24} />
                  </div>
                  <button className="p-3 rounded-xl bg-white/5 text-ns-grey-500 hover:text-white hover:bg-white/10 transition-all">
                    <Download size={18} />
                  </button>
                </div>

                <div>
                  <div className="flex gap-2 mb-4">
                    {res.tags.map(tag => (
                      <span key={tag} className="text-[9px] font-mono text-ns-grey-600 uppercase tracking-widest px-2 py-0.5 rounded bg-white/[0.03] border border-white/5">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 tracking-tight group-hover:text-glow transition-all">{res.title}</h3>
                  <p className="text-sm text-ns-grey-500 leading-relaxed max-w-sm mb-8">{res.desc}</p>

                  <button className="flex items-center gap-2 text-[10px] font-bold text-white uppercase tracking-widest group/btn">
                    Access Intelligence
                    <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
