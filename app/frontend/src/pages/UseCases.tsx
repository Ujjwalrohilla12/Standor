import { ArrowRight, Shield, Search, Zap, FileCheck, Bug, Scale, ChevronRight, TrendingDown, Clock, ShieldCheck, TrendingUp, Eye, Users, Lock, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const USE_CASES = [
  {
    icon: Shield,
    title: 'Incident Response',
    desc: 'When a breach is detected, every second counts. Standor lets IR teams reconstruct attack timelines from raw packets and identify lateral movement in minutes.',
    benefits: [
      { text: '65% faster root cause analysis', icon: Clock },
      { text: 'Verify lateral movement paths', icon: Search },
      { text: 'Court-admissible session logs', icon: ShieldCheck }
    ],
    color: '#3B82F6',
    path: '/architecture#forensic-engine'
  },
  {
    icon: Search,
    title: 'SOC Triage',
    desc: 'SOC analysts deal with alert fatigue daily. Standor speeds up validation by providing deep packet inspection with protocol-aware filtering.',
    benefits: [
      { text: '80% reduction in false positives', icon: TrendingDown },
      { text: 'Direct packet-to-alert mapping', icon: Zap },
      { text: 'Team-wide shared annotations', icon: Users }
    ],
    color: '#22C55E',
    path: '/#collaboration'
  },
  {
    icon: Bug,
    title: 'Threat Hunting',
    desc: 'Proactive hunting requires surfacing anomalies without predefined rules. Our entropy radar reveals suspicious patterns that signatures miss.',
    benefits: [
      { text: 'Surface zero-day C2 tunnels', icon: Bug },
      { text: 'Statistical anomaly scoring', icon: TrendingUp },
      { text: 'Visual entropy fingerprinting', icon: Eye }
    ],
    color: '#FBBF24',
    path: '/features#entropy'
  },
  {
    icon: Zap,
    title: 'SRE & Debugging',
    desc: 'When production fails, SREs need packet-level visibility. Pinpoint the root cause of network latency and TCP resets instantly.',
    benefits: [
      { text: 'Identify TCP storm sources <1s', icon: Zap },
      { text: 'Visualize DNS/TLS handshake lag', icon: Clock },
      { text: 'Zero-latency pcap navigation', icon: Zap }
    ],
    color: '#06B6D4',
    path: '/docs#performance'
  },
  {
    icon: FileCheck,
    title: 'Digital Forensics',
    desc: 'Legal requires court-admissible evidence. Our chain-of-custody logging and IP obfuscation ensure integrity throughout the process.',
    benefits: [
      { text: 'Immutable SHA-256 hashing', icon: Lock },
      { text: 'GDPR-compliant PII masking', icon: Shield },
      { text: 'Verifiable export manifests', icon: FileCheck }
    ],
    color: '#8B5CF6',
    path: '/architecture#persistence-layer'
  },
  {
    icon: Scale,
    title: 'Compliance & Audit',
    desc: 'PCI DSS, HIPAA, and SOC 2 require provable monitoring. Generate the visibility and documentation needed for your next audit.',
    benefits: [
      { text: 'Automated compliance reporting', icon: FileCheck },
      { text: 'Provable traffic isolation', icon: Scale },
      { text: 'On-premise data residency', icon: Database }
    ],
    color: '#EF4444',
    path: '/privacy'
  },
];


export default function UseCases() {
  const navigate = useNavigate();

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="ns-container">
        {/* Header */}
        <div className="max-w-4xl mb-24">
          <h1 className="text-[clamp(2.5rem,8vw,5.5rem)] font-bold text-white leading-[0.9] tracking-tighter mb-10">
            Engineered for <br />
            <span className="text-ns-grey-600">every scenario.</span>
          </h1>
          <p className="text-2xl text-ns-grey-400 leading-relaxed font-medium max-w-2xl">
            From high-stakes incident response to routine compliance audits. Standor provides the visibility your team needs to move faster.
          </p>
        </div>

        {/* Use Case Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-48">
          {USE_CASES.map((uc, i) => (
            <div
              key={i}
              className="group relative flex flex-col rounded-[2.5rem] bg-ns-bg-900 border border-white/[0.05] p-10 hover:border-white/10 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-white/[0.05] transition-all duration-500">
                  <uc.icon size={24} className="text-white group-hover:text-ns-accent transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{uc.title}</h3>
                <p className="text-sm text-ns-grey-500 leading-relaxed mb-10 min-h-[80px]">{uc.desc}</p>

                <div className="space-y-4 mb-12">
                  <div className="text-[10px] font-bold text-ns-grey-600 uppercase tracking-widest mb-1">Key Benefits</div>
                  {uc.benefits.map((b, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <b.icon size={12} className="text-ns-accent/60 group-hover:text-ns-accent transition-colors" />
                      <span className="text-xs text-ns-grey-400 font-medium">{b.text}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate(uc.path)}
                  className="flex items-center gap-2 text-[10px] font-bold text-white uppercase tracking-widest group/btn"
                >
                  Explore Solution
                  <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Industry Focus */}
        <div className="ns-glass-dark rounded-[3.5rem] border border-white/[0.05] p-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-ns-accent/5 blur-[120px] -z-10" />
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6 tracking-tighter">Bespoke solutions for <br />critical infrastructure.</h2>
              <p className="text-lg text-ns-grey-400 mb-8">
                We specialize in sectors where network integrity is non-negotiable. Our platform adapts to the unique regulatory and technical constraints of your industry.
              </p>
              <div className="flex flex-wrap gap-3">
                {['FinTech', 'HealthCare', 'Defense', 'Energy', 'GovTech'].map(tag => (
                  <span key={tag} className="px-5 py-2 rounded-full bg-white/[0.03] border border-white/10 text-[10px] font-bold text-ns-grey-300 uppercase tracking-widest">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="ns-glass p-8 rounded-3xl border border-white/5 space-y-2">
                <div className="text-3xl font-bold text-white">99%</div>
                <div className="text-[10px] font-mono text-ns-grey-500 uppercase tracking-widest">Packet Reassembly</div>
              </div>
              <div className="ns-glass p-8 rounded-3xl border border-white/5 space-y-2 translate-y-8">
                <div className="text-3xl font-bold text-white">0s</div>
                <div className="text-[10px] font-mono text-ns-grey-500 uppercase tracking-widest">Latency Floor</div>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-48 text-center">
          <h3 className="text-2xl font-bold text-white mb-10">Ready to see Standor in action?</h3>
          <button
            onClick={() => navigate('/register')}
            className="group px-12 py-5 bg-white text-black rounded-full font-bold hover:bg-ns-grey-100 transition-all flex items-center gap-2 mx-auto shadow-2xl"
          >
            Get Started
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
