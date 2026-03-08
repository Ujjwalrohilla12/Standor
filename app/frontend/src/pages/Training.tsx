import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Wifi, Terminal, Database, Globe, AlertTriangle, CheckCircle2, Clock, BarChart2, BookOpen, ChevronRight, X, Trophy, Target, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageShell from '../components/PageShell';

// ── Types ────────────────────────────────────────────────────────────────────
interface Scenario {
  id: string;
  title: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  durationMin: number;
  description: string;
  background: string;
  skills: string[];
  keyIndicators: string[];
  investigationSteps: string[];
  protocols: string[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 'ddos-detection',
    title: 'DDoS Attack Detection',
    category: 'Availability',
    difficulty: 'Beginner',
    durationMin: 20,
    description: 'A web server is receiving a massive influx of traffic. Identify the attack vector, source IPs, and confirm whether it is a volumetric or protocol-layer DDoS.',
    background: 'The target host 10.0.0.1:80 shows 99% packet loss. SOC alerts fired at 14:32 UTC. You have a 5-minute PCAP captured at the edge router.',
    skills: ['Traffic volume analysis', 'Source IP enumeration', 'Protocol distribution', 'SYN flood identification'],
    keyIndicators: [
      'Extremely high packet rate from multiple sources',
      'Disproportionate SYN to SYN-ACK ratio',
      'Single destination IP/port targeted',
      'Uniform or spoofed source IP patterns',
      'UDP flood: high bandwidth from UDP 0/random ports',
    ],
    investigationSteps: [
      'Sort packets by source IP — identify top talkers',
      'Check TCP flags distribution — SYN flood shows >90% SYN packets',
      'Filter destination port — is a single port targeted?',
      'Check time distribution — sudden spike = volumetric DDoS',
      'Verify if source IPs are spoofed (TTL analysis, geo distribution)',
    ],
    protocols: ['TCP', 'UDP', 'ICMP'],
  },
  {
    id: 'mitm-tls',
    title: 'Man-in-the-Middle (TLS Intercept)',
    category: 'Confidentiality',
    difficulty: 'Intermediate',
    durationMin: 35,
    description: 'A user reports certificate warnings when accessing corporate applications. Investigate whether traffic is being intercepted and identify the rogue certificate authority.',
    background: 'Internal network 192.168.1.0/24. User device 192.168.1.45 accessing app.corp.internal. SSL/TLS errors in browser logs.',
    skills: ['TLS handshake analysis', 'Certificate chain inspection', 'JA3 fingerprinting', 'ARP poisoning detection'],
    keyIndicators: [
      'Unexpected intermediate host in TCP stream (extra hop)',
      'Mismatched certificate issuer vs expected CA',
      'ARP replies from unknown MAC claiming gateway IP',
      'Duplicate ARP entries in network traffic',
      'TLS record layer shows downgrade from TLS 1.3 to 1.2',
    ],
    investigationSteps: [
      'Filter ARP traffic — look for gratuitous ARP or duplicate IP claims',
      'Extract TLS ClientHello — examine SNI and cipher suites',
      'Compare server certificate issuer to known corporate CA',
      'Check for RST injection or TCP sequence anomalies',
      'Map MAC addresses to IPs — identify unexpected gateway MAC',
    ],
    protocols: ['TCP', 'TLS', 'HTTPS', 'ARP'],
  },
  {
    id: 'c2-beaconing',
    title: 'C2 Command & Control Beaconing',
    category: 'Intrusion',
    difficulty: 'Advanced',
    durationMin: 45,
    description: 'An endpoint detection alert fired on host 10.10.5.20. Analyse the network traffic for C2 beaconing patterns, identify the callback interval, and extract indicators of compromise.',
    background: 'Host 10.10.5.20 (Windows workstation) had an EDR alert at 09:15. PCAP spans 2 hours. Suspected malware is "Cobalt Strike" or similar framework.',
    skills: ['Beaconing interval detection', 'DNS over HTTPS detection', 'HTTP user-agent analysis', 'Entropy analysis of payloads'],
    keyIndicators: [
      'Regular outbound connections at fixed intervals (beaconing)',
      'Connections to unusual external IPs on port 443/80',
      'High-entropy payload in what appears to be normal HTTP/S',
      'DNS queries to algorithmically-generated domains (DGA)',
      'Abnormally large HTTP POST bodies to CDN-like hosts',
    ],
    investigationSteps: [
      'Filter traffic from 10.10.5.20 — identify unique external destinations',
      'Plot packet timestamps — look for periodic intervals (e.g., every 60s)',
      'Calculate entropy on HTTP POST bodies — C2 often >0.8 (encrypted)',
      'Extract DNS queries — check for long, random-looking subdomains',
      'Check HTTP Host headers and User-Agent strings for anomalies',
    ],
    protocols: ['TCP', 'HTTPS', 'DNS', 'HTTP'],
  },
  {
    id: 'data-exfiltration',
    title: 'Data Exfiltration via DNS',
    category: 'Exfiltration',
    difficulty: 'Advanced',
    durationMin: 40,
    description: 'Sensitive customer data has potentially been leaked. Investigate DNS traffic from the internal network for data exfiltration patterns encoded in DNS queries.',
    background: 'Compliance alert: unusual DNS query volume from host 10.5.1.100. The host has no legitimate reason to issue hundreds of DNS TXT queries.',
    skills: ['DNS tunneling detection', 'Base64 payload decoding', 'Query frequency analysis', 'Entropy scoring'],
    keyIndicators: [
      'Unusually long DNS query names (>60 characters)',
      'High frequency TXT or NULL record queries',
      'DNS queries to a single external nameserver (not corporate)',
      'Base64/hex encoded strings in subdomain labels',
      'Entropy of subdomain labels significantly higher than legitimate traffic',
    ],
    investigationSteps: [
      'Filter: UDP port 53 — count queries per source host',
      'Sort by DNS query length — exfiltration uses very long hostnames',
      'Check for repeated queries to same parent domain (data being chunked)',
      'Decode subdomain labels: Base64/hex → look for structured data',
      'Compare query entropy: legitimate hostnames ≈ 3.5 bits; tunneling ≈ 5.5+',
    ],
    protocols: ['UDP', 'DNS', 'TCP'],
  },
  {
    id: 'port-scan',
    title: 'Network Reconnaissance / Port Scan',
    category: 'Reconnaissance',
    difficulty: 'Beginner',
    durationMin: 15,
    description: 'An internal host is performing reconnaissance on the network. Identify the scanning host, technique used (SYN scan, connect scan, UDP scan), and targets.',
    background: 'Security sensor detected unusual outbound connection attempts. Host 192.168.0.50 logged multiple RST responses. Time window: 3 minutes.',
    skills: ['RST/ICMP analysis', 'Port scan pattern recognition', 'Nmap signature identification', 'Scan rate estimation'],
    keyIndicators: [
      'Sequential SYN packets to incrementing destination ports',
      'High RST or ICMP port-unreachable rate from target hosts',
      'Very short TCP session lifetime (SYN-RST or SYN-RST/ACK)',
      'Single source IP connecting to many distinct ports on one or more hosts',
      'No completed TCP handshakes (half-open SYN scan)',
    ],
    investigationSteps: [
      'Filter by source IP 192.168.0.50 — count unique dst ports',
      'Check TCP flags: SYN-only packets = stealthy scan',
      'Look at timing: >100 SYN/second = aggressive automated scan',
      'Group by destination IP — is this a host scan or port scan?',
      'Cross-reference Nmap OS/service detection payloads in TCP options',
    ],
    protocols: ['TCP', 'ICMP', 'UDP'],
  },
  {
    id: 'ransomware-lateral',
    title: 'Ransomware Lateral Movement',
    category: 'Intrusion',
    difficulty: 'Advanced',
    durationMin: 50,
    description: 'Multiple hosts have reported encrypted files and ransom notes. Analyse PCAP captured during the propagation phase to reconstruct the lateral movement path and identify the initial entry point.',
    background: 'File servers 10.0.10.10, 10.0.10.11 and 10.0.10.15 affected. Active Directory server 10.0.1.5 shows unusual SMB traffic. PCAPs from core switch span.',
    skills: ['SMB traffic analysis', 'Credential pass-the-hash detection', 'WMI/RPC lateral movement', 'File transfer identification'],
    keyIndicators: [
      'SMB connections to multiple hosts sequentially (propagation)',
      'Authentication failures followed by successful logins (credential spraying)',
      'Large file transfers over SMB (ransomware binary or encrypted files)',
      'NTLM authentication over SMB (pass-the-hash indicator)',
      'WMI/RPC calls for remote service creation or scheduled tasks',
    ],
    investigationSteps: [
      'Filter SMB (TCP 445) — map source → destination tree',
      'Look for authentication events: NTLMSSP packets in SMB sessions',
      'Identify "TREE CONNECT" paths — which shares are accessed?',
      'Track file write operations in SMB — payload size and count',
      'Check for psexec / remcomsvc named pipes (lateral movement tools)',
    ],
    protocols: ['TCP', 'SMB', 'HTTPS', 'DNS'],
  },
];

// ── Difficulty badge ──────────────────────────────────────────────────────────
const DIFF_STYLES = {
  Beginner: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  Intermediate: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  Advanced: 'text-red-400 bg-red-400/10 border-red-400/20',
};
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Availability: Wifi, Confidentiality: Shield, Intrusion: Terminal,
  Exfiltration: Database, Reconnaissance: Globe,
};

// ── Scenario detail modal ─────────────────────────────────────────────────────
function ScenarioModal({ scenario, onClose }: { scenario: Scenario; onClose: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-2xl bg-ns-bg-800 border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${DIFF_STYLES[scenario.difficulty]}`}>
                {scenario.difficulty}
              </span>
              <span className="text-[10px] text-neutral-600">{scenario.category} · {scenario.durationMin} min</span>
            </div>
            <h2 className="text-lg font-bold text-white">{scenario.title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-neutral-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <div>
            <div className="text-[10px] font-semibold text-neutral-600 uppercase tracking-wider mb-2">Scenario</div>
            <p className="text-sm text-neutral-300 leading-relaxed">{scenario.description}</p>
          </div>

          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/15">
            <div className="text-[10px] font-semibold text-amber-400/70 uppercase tracking-wider mb-1.5">Background Briefing</div>
            <p className="text-xs text-neutral-400 font-mono leading-relaxed">{scenario.background}</p>
          </div>

          <div>
            <div className="text-[10px] font-semibold text-neutral-600 uppercase tracking-wider mb-2">Key Indicators to Find</div>
            <ul className="space-y-1.5">
              {scenario.keyIndicators.map((ind, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-neutral-400">
                  <div className="w-1 h-1 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                  {ind}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-[10px] font-semibold text-neutral-600 uppercase tracking-wider mb-2">Investigation Steps</div>
            <ol className="space-y-2">
              {scenario.investigationSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-neutral-400">
                  <span className="text-[9px] font-bold text-neutral-600 bg-white/[0.04] rounded w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div>
            <div className="text-[10px] font-semibold text-neutral-600 uppercase tracking-wider mb-2">Skills Trained</div>
            <div className="flex flex-wrap gap-1.5">
              {scenario.skills.map(s => (
                <span key={s} className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[10px] text-neutral-400">{s}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 border-t border-white/[0.06] bg-black/20">
          <div className="flex items-center gap-1.5 text-[10px] text-neutral-600 flex-1">
            <Clock size={11} /> ~{scenario.durationMin} min
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-white/[0.08] text-xs text-neutral-400 hover:text-white hover:border-white/[0.15] transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => { navigate('/upload'); onClose(); }}
            className="px-4 py-2 rounded-lg bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors flex items-center gap-1.5"
          >
            Upload PCAP to Practice <ChevronRight size={12} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Training() {
  const [selected, setSelected] = useState<Scenario | null>(null);
  const [filter, setFilter] = useState<string>('All');
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('ns_training_completed') || '[]');
      setCompleted(new Set(stored));
    } catch { /* ignore */ }
  }, []);

  const toggleComplete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompleted(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem('ns_training_completed', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const categories = ['All', ...Array.from(new Set(SCENARIOS.map(s => s.category)))];
  const filtered = filter === 'All' ? SCENARIOS : SCENARIOS.filter(s => s.category === filter);
  const completedCount = SCENARIOS.filter(s => completed.has(s.id)).length;

  return (
    <PageShell title="Security Training — Standor" description="Practice network forensics with curated real-world attack scenarios. Build investigation skills with DDoS, MITM, C2, exfiltration, and lateral movement PCAPs.">
      <div className="min-h-screen pt-28 pb-20 px-4 relative overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0], scale: [1, 1.1, 0.95, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-white/[0.015] rounded-full blur-[120px]"
          />
          <motion.div
            animate={{ x: [0, -30, 20, 0], y: [0, 30, -30, 0], scale: [1, 0.95, 1.1, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-white/[0.01] rounded-full blur-[100px]"
          />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <motion.h1
              className="text-4xl font-black text-white tracking-tight mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              Security Investigation<br />
              <motion.span
                className="text-neutral-500 inline-block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                Training Scenarios
              </motion.span>{' '}
              <motion.span
                className="text-neutral-500 inline-block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                (Scenario-Based Training)
              </motion.span>
            </motion.h1>
            <motion.p
              className="text-neutral-500 text-base max-w-xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Sharpen your network forensics skills with curated attack scenarios. Upload a matching PCAP and follow the investigation guide to identify threats, extract IoCs, and build expertise.
            </motion.p>
          </motion.div>

          {/* Progress banner */}
          {completedCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 p-4 mb-8 rounded-xl bg-emerald-500/5 border border-emerald-500/15"
            >
              <Trophy size={20} className="text-emerald-400 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-white mb-0.5">
                  {completedCount} of {SCENARIOS.length} scenarios completed
                </div>
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${(completedCount / SCENARIOS.length) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-emerald-400 font-semibold">{Math.round(completedCount / SCENARIOS.length * 100)}%</span>
            </motion.div>
          )}

          {/* Category filter */}
          <motion.div
            className="flex items-center gap-2 mb-8 flex-wrap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {categories.map((cat, i) => (
              <motion.button
                key={cat}
                onClick={() => setFilter(cat)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${filter === cat
                  ? 'bg-white text-black shadow-lg shadow-white/10'
                  : 'bg-white/[0.03] border border-white/[0.06] text-neutral-500 hover:text-white hover:border-white/[0.12]'
                  }`}
              >
                {cat}
              </motion.button>
            ))}
            <motion.span
              className="ml-auto text-[10px] text-neutral-700 font-mono"
              key={filtered.length}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {filtered.length} scenarios
            </motion.span>
          </motion.div>

          {/* Scenario cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((scenario, i) => {
              const Icon = CATEGORY_ICONS[scenario.category] ?? Shield;
              const done = completed.has(scenario.id);
              return (
                <motion.div
                  key={scenario.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.5 }}
                  onClick={() => setSelected(scenario)}
                  whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.25 } }}
                  whileTap={{ scale: 0.98 }}
                  className={`group relative p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${done
                    ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/35 hover:shadow-lg hover:shadow-emerald-500/5'
                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.15] hover:shadow-xl hover:shadow-white/[0.03]'
                    }`}
                >
                  {done && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    </div>
                  )}

                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${done ? 'bg-emerald-500/15' : 'bg-white/[0.04] border border-white/[0.06]'}`}>
                      <Icon size={15} className={done ? 'text-emerald-400' : 'text-neutral-400'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${DIFF_STYLES[scenario.difficulty]}`}>
                          {scenario.difficulty}
                        </span>
                        <span className="text-[9px] text-neutral-700">{scenario.category}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-white leading-tight">{scenario.title}</h3>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-500 leading-relaxed mb-4 line-clamp-2">
                    {scenario.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {scenario.protocols.map(p => (
                      <span key={p} className="px-1.5 py-0.5 rounded text-[8px] font-mono font-semibold bg-white/[0.04] text-neutral-600">{p}</span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[10px] text-neutral-700">
                      <Clock size={10} /> {scenario.durationMin} min
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={e => toggleComplete(scenario.id, e)}
                        className={`text-[9px] font-semibold px-2 py-0.5 rounded transition-colors ${done
                          ? 'text-emerald-400 hover:text-neutral-400'
                          : 'text-neutral-600 hover:text-emerald-400'
                          }`}
                      >
                        {done ? 'Completed ✓' : 'Mark done'}
                      </button>
                      <span className="text-[10px] text-neutral-600 group-hover:text-white transition-colors flex items-center gap-0.5">
                        View guide <ChevronRight size={10} />
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Info section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: 'How to practice',
                desc: 'Capture or download a PCAP matching the scenario (Wireshark sample captures, malware traffic samples, or capture your own). Upload it to Standor and follow the investigation guide.',
              },
              {
                icon: BarChart2,
                title: 'Scoring criteria',
                desc: 'Each scenario has a checklist of indicators to identify. Track your completion manually or use the "Mark done" button when you\'ve found all key indicators.',
              },
              {
                icon: BookOpen,
                title: 'Resources',
                desc: 'Use the Docs section for entropy thresholds, TCP reconstruction, and payload analysis techniques. Cross-reference with MITRE ATT&CK for tactic mapping.',
              },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
                className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.04] transition-colors cursor-default"
              >
                <Icon size={16} className="text-white/60 mb-3" />
                <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Scenario detail modal */}
      <AnimatePresence>
        {selected && <ScenarioModal scenario={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </PageShell >
  );
}
