import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Download, Monitor, Activity, Search, Users, Shield, BarChart2, ChevronRight } from 'lucide-react';
import PageShell from '../components/PageShell';

// ── Category definitions ──────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'session', label: 'Session Analysis' },
  { id: 'packets', label: 'Packet Inspector' },
  { id: 'collaboration', label: 'Collaboration' },
  { id: 'admin', label: 'Admin & Security' },
] as const;

type CategoryId = typeof CATEGORIES[number]['id'];

interface GalleryItem {
  id: string;
  category: Exclude<CategoryId, 'all'>;
  title: string;
  description: string;
  badge?: string;
  visual: React.ReactNode;
}

// ── Shared chrome / window frame ─────────────────────────────────────────────
function AppFrame({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-white/[0.07] bg-[#0d0d0f] shadow-2xl">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#141416] border-b border-white/[0.05]">
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        {label && <span className="ml-3 text-[10px] text-neutral-600 font-mono">{label}</span>}
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

// ── Individual SVG / CSS mockups ──────────────────────────────────────────────

function DashboardMockup() {
  return (
    <AppFrame label="Standor — Dashboard">
      <div className="space-y-2">
        {/* Stat row */}
        <div className="grid grid-cols-3 gap-2">
          {[['Sessions', '2,847'], ['Packets', '1.4M'], ['Alerts', '12']].map(([k, v]) => (
            <div key={k} className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.05]">
              <p className="text-[9px] text-neutral-500 mb-1">{k}</p>
              <p className="text-sm font-bold text-white font-mono">{v}</p>
            </div>
          ))}
        </div>
        {/* Activity sparkline placeholder */}
        <div className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.05]">
          <p className="text-[9px] text-neutral-500 mb-2">Ingest activity — last 24 h</p>
          <svg viewBox="0 0 200 40" className="w-full h-8" aria-label="Activity sparkline">
            <polyline points="0,35 20,28 40,30 60,15 80,20 100,10 120,18 140,12 160,22 180,8 200,14"
              fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinejoin="round" />
            <polyline points="0,40 0,35 20,28 40,30 60,15 80,20 100,10 120,18 140,12 160,22 180,8 200,14 200,40"
              fill="rgba(255,255,255,0.04)" />
          </svg>
        </div>
        {/* Session list */}
        <div className="space-y-1">
          {['capture-2026-02-28.pcap', 'incident-001.pcapng', 'lateral-move.pcap'].map((f, i) => (
            <div key={f} className="flex items-center justify-between bg-white/[0.02] rounded-md px-3 py-2 border border-white/[0.04]">
              <span className="text-[9px] font-mono text-neutral-400 truncate">{f}</span>
              <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${i === 1 ? 'text-red-400 bg-red-500/10' : 'text-green-400 bg-green-500/10'}`}>
                {i === 1 ? 'Alert' : 'Clean'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AppFrame>
  );
}

function SessionMockup() {
  return (
    <AppFrame label="Session — incident-001.pcapng">
      <div className="space-y-2">
        {/* Time range bar */}
        <div className="flex items-center gap-2 bg-white/[0.02] rounded-md px-3 py-2 border border-white/[0.04]">
          <span className="text-[9px] text-neutral-500 font-mono">00:00.000</span>
          <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] relative">
            <div className="absolute left-[20%] right-[45%] h-full rounded-full bg-white/20" />
            <div className="absolute left-[20%] w-2 h-2 rounded-full bg-white -top-[3px]" />
          </div>
          <span className="text-[9px] text-neutral-500 font-mono">04:12.800</span>
        </div>
        {/* Protocol breakdown */}
        <div className="grid grid-cols-4 gap-1">
          {[['TCP', '#3b82f6', '62%'], ['TLS', '#8b5cf6', '21%'], ['UDP', '#22c55e', '11%'], ['DNS', '#f59e0b', '6%']].map(([p, c, pct]) => (
            <div key={p} className="bg-white/[0.02] rounded-md p-2 border border-white/[0.04] text-center">
              <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ background: c }} />
              <p className="text-[8px] text-neutral-500">{p}</p>
              <p className="text-[10px] font-bold text-white font-mono">{pct}</p>
            </div>
          ))}
        </div>
        {/* Packet rows */}
        <div className="space-y-0.5">
          {[
            ['#1', '00:00.012', 'TCP', '192.168.1.5', '10.0.0.1', 'SYN'],
            ['#2', '00:00.013', 'TCP', '10.0.0.1', '192.168.1.5', 'SYN-ACK'],
            ['#3', '00:00.014', 'TLS', '192.168.1.5', '10.0.0.1', 'ClientHello'],
          ].map(([n, t, proto, src, dst, flag]) => (
            <div key={n} className="grid grid-cols-6 gap-1 text-[8px] font-mono bg-white/[0.015] rounded px-2 py-1.5">
              <span className="text-neutral-600">{n}</span>
              <span className="text-neutral-500">{t}</span>
              <span className="text-blue-400">{proto}</span>
              <span className="text-neutral-400 truncate">{src}</span>
              <span className="text-neutral-400 truncate">{dst}</span>
              <span className="text-green-400">{flag}</span>
            </div>
          ))}
        </div>
      </div>
    </AppFrame>
  );
}

function PacketMockup() {
  return (
    <AppFrame label="Packet Inspector — Payload Transforms">
      <div className="space-y-2">
        {/* Field breakdown */}
        <div className="space-y-1">
          {[
            ['Source IP', '192.168.1.5', 'text-blue-400'],
            ['Destination IP', '10.0.0.1', 'text-blue-400'],
            ['Protocol', 'TCP', 'text-green-400'],
            ['Flags', 'SYN ACK PSH', 'text-yellow-400'],
            ['TTL', '64', 'text-neutral-400'],
            ['Payload Size', '1,452 bytes', 'text-neutral-400'],
          ].map(([k, v, vc]) => (
            <div key={k} className="flex items-center justify-between px-2 py-1 bg-white/[0.02] rounded border border-white/[0.04]">
              <span className="text-[9px] text-neutral-500">{k}</span>
              <span className={`text-[9px] font-mono font-bold ${vc}`}>{v}</span>
            </div>
          ))}
        </div>
        {/* Transform panel */}
        <div className="bg-white/[0.02] rounded-lg p-2 border border-white/[0.05]">
          <div className="flex gap-1 mb-2">
            {['HEX', 'BASE64', 'ASCII', 'URL'].map((m, i) => (
              <span key={m} className={`text-[8px] font-bold px-2 py-0.5 rounded ${i === 0 ? 'bg-white/10 text-white' : 'text-neutral-600'}`}>{m}</span>
            ))}
          </div>
          <div className="font-mono text-[8px] text-green-400/70 leading-relaxed">
            47 45 54 20 2f 61 70 69 2f 73 65 73 73 69 6f 6e<br />
            73 20 48 54 54 50 2f 31 2e 31 0d 0a 48 6f 73 74
          </div>
        </div>
      </div>
    </AppFrame>
  );
}

function CollaborationMockup() {
  return (
    <AppFrame label="Team Session — Collaborative Investigation">
      <div className="space-y-2">
        {/* Presence indicators */}
        <div className="flex items-center gap-2 px-2 py-1.5 bg-white/[0.02] rounded-lg border border-white/[0.04]">
          <span className="text-[9px] text-neutral-500">Active investigators:</span>
          <div className="flex -space-x-1.5">
            {['A', 'B', 'C'].map((l, i) => (
              <div key={l} className="w-5 h-5 rounded-full border border-black flex items-center justify-center text-[7px] font-bold"
                style={{ background: ['#3b82f6', '#22c55e', '#f59e0b'][i] }}>
                {l}
              </div>
            ))}
          </div>
          <span className="ml-auto flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[8px] text-green-400">Live</span>
          </span>
        </div>
        {/* Annotation thread */}
        <div className="space-y-1.5">
          {[
            { user: 'Alice', color: '#3b82f6', msg: 'Suspicious DNS query to 185.x.x.x — possible C2 beacon', time: '14:02' },
            { user: 'Bob', color: '#22c55e', msg: 'Confirmed — entropy spike on port 443 payload matches exfil pattern', time: '14:04' },
            { user: 'Carol', color: '#f59e0b', msg: 'Escalating to IR — tagging packet #847 as IOC', time: '14:05' },
          ].map(({ user, color, msg, time }) => (
            <div key={user} className="bg-white/[0.02] rounded-lg p-2 border border-white/[0.04]">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[6px] font-bold" style={{ background: color }}>
                  {user[0]}
                </div>
                <span className="text-[8px] font-bold text-white">{user}</span>
                <span className="ml-auto text-[8px] text-neutral-600">{time}</span>
              </div>
              <p className="text-[8px] text-neutral-400 leading-relaxed">{msg}</p>
            </div>
          ))}
        </div>
      </div>
    </AppFrame>
  );
}

function AdminMockup() {
  return (
    <AppFrame label="Admin Console — Security & Audit">
      <div className="space-y-2">
        {/* Metrics row */}
        <div className="grid grid-cols-2 gap-2">
          {[['Active Users', '142', '+12%'], ['Failed Logins', '3', '-8%']].map(([k, v, d]) => (
            <div key={k} className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.05]">
              <p className="text-[8px] text-neutral-500 mb-1">{k}</p>
              <div className="flex items-end gap-2">
                <span className="text-sm font-bold text-white font-mono">{v}</span>
                <span className={`text-[8px] font-mono ${d.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{d}</span>
              </div>
            </div>
          ))}
        </div>
        {/* Audit log */}
        <div className="bg-white/[0.02] rounded-lg border border-white/[0.05]">
          <p className="text-[8px] text-neutral-500 px-2 pt-2 pb-1.5 border-b border-white/[0.04]">Recent Audit Events</p>
          <div className="divide-y divide-white/[0.04]">
            {[
              { action: 'Login Successful', user: 'alice@corp.io', status: 'success', time: '14:02' },
              { action: 'API Key Created', user: 'bob@corp.io', status: 'success', time: '13:58' },
              { action: 'MFA Enabled', user: 'carol@corp.io', status: 'success', time: '13:45' },
              { action: 'Login Failed', user: 'unknown@mail.io', status: 'failure', time: '13:40' },
            ].map(({ action, user, status, time }) => (
              <div key={`${action}-${time}`} className="flex items-center gap-2 px-2 py-1.5">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status === 'success' ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-[8px] text-neutral-400 flex-1 truncate">{action}</span>
                <span className="text-[8px] font-mono text-neutral-600 truncate max-w-[80px]">{user}</span>
                <span className="text-[8px] font-mono text-neutral-600">{time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppFrame>
  );
}

function EntropyMockup() {
  return (
    <AppFrame label="Entropy Radar — Anomaly Detection">
      <div className="space-y-2">
        <div className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.05]">
          <p className="text-[9px] text-neutral-500 mb-2">Shannon entropy by flow — last 500 packets</p>
          {/* Bar chart */}
          <div className="flex items-end gap-1 h-16">
            {[0.3, 0.4, 0.35, 0.55, 0.45, 0.38, 0.92, 0.88, 0.91, 0.42, 0.36, 0.5, 0.48, 0.37, 0.44].map((v, i) => (
              <div key={i} className="flex-1 rounded-sm transition-all"
                style={{
                  height: `${v * 100}%`,
                  background: v > 0.8 ? 'rgba(239,68,68,0.7)' : v > 0.6 ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.12)',
                }} />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[7px] text-neutral-600">Low entropy</span>
            <span className="text-[7px] text-red-400 font-bold">↑ Anomalies detected</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {[['Flows analysed', '2,341'], ['Anomalies', '3'], ['Avg entropy', '0.44']].map(([k, v]) => (
            <div key={k} className="bg-white/[0.02] rounded-md p-2 border border-white/[0.04] text-center">
              <p className="text-[7px] text-neutral-500">{k}</p>
              <p className="text-[10px] font-bold text-white font-mono">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </AppFrame>
  );
}

// ── Gallery items ─────────────────────────────────────────────────────────────
const ITEMS: GalleryItem[] = [
  {
    id: 'dashboard-overview',
    category: 'dashboard',
    title: 'Investigation Dashboard',
    description: 'Centralised overview of active sessions, ingest metrics, alert counts, and recent captures at a glance.',
    visual: <DashboardMockup />,
  },
  {
    id: 'entropy-radar',
    category: 'dashboard',
    title: 'Entropy Radar',
    badge: 'New',
    description: 'Server-side Shannon entropy calculations surface high-entropy flows instantly — flag encrypted tunnels, exfiltration, or anomalous payloads without opening a single packet.',
    visual: <EntropyMockup />,
  },
  {
    id: 'session-timeline',
    category: 'session',
    title: 'Time-Warp Timeline',
    description: 'Scrub through millions of packets with sub-millisecond precision. Jump to any timestamp in O(log n) time using the indexed time-warp engine.',
    visual: <SessionMockup />,
  },
  {
    id: 'packet-inspector',
    category: 'packets',
    title: 'Deep Packet Inspector',
    description: 'L2–L7 field breakdown with live payload transforms: HEX, BASE64, ASCII, and URL decode. Read-only sandboxed execution — no native code, no risk.',
    visual: <PacketMockup />,
  },
  {
    id: 'collaboration',
    category: 'collaboration',
    title: 'Real-Time CRDT Collaboration',
    description: 'Multiple investigators annotate, tag, and escalate packets simultaneously. Yjs CRDTs guarantee convergent state across all sessions — even with network partitions.',
    visual: <CollaborationMockup />,
  },
  {
    id: 'audit-admin',
    category: 'admin',
    title: 'Audit Log & Admin Console',
    description: 'Append-only audit trail for every auth event, API key operation, and privilege change. Full admin visibility with per-user drill-down and tamper-evident logs.',
    visual: <AdminMockup />,
  },
];

// ── Page component ────────────────────────────────────────────────────────────
export default function Gallery() {
  const navigate = useNavigate();
  const [active, setActive] = useState<CategoryId>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = active === 'all' ? ITEMS : ITEMS.filter(i => i.category === active);

  return (
    <main className="min-h-screen bg-ns-bg-900 text-white">

      {/* ── Hero ── */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-neutral-500 mb-6">Product Gallery</p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-5">
            Built for how<br className="hidden sm:block" /> investigators actually work
          </h1>
          <p className="text-base text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            A visual tour of Standor's investigation surface — from high-throughput ingest to real-time collaborative forensics.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate('/contact')}
              className="px-7 py-3 bg-white text-black rounded-full text-sm font-bold hover:bg-neutral-200 transition-all"
            >
              Request a live demo
            </button>
            <button
              onClick={() => navigate('/docs')}
              className="flex items-center gap-2 px-7 py-3 border border-white/[0.12] text-white rounded-full text-sm hover:border-white/30 transition-all"
            >
              Read docs <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Category filter ── */}
      <section className="pb-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActive(cat.id)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${active === cat.id
                  ? 'bg-white text-black'
                  : 'bg-white/[0.04] text-neutral-400 hover:bg-white/[0.08] hover:text-white border border-white/[0.07]'
                  }`}
                aria-pressed={active === cat.id}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Grid ── */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filtered.map(item => (
              <article
                key={item.id}
                className="group flex flex-col bg-white/[0.015] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/[0.14] transition-all duration-300"
                tabIndex={0}
                aria-label={item.title}
                onKeyDown={e => e.key === 'Enter' && setExpanded(expanded === item.id ? null : item.id)}
              >
                {/* Mockup preview */}
                <div
                  className="p-5 bg-[#0a0a0c] cursor-pointer"
                  onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                >
                  <div className={`transition-all duration-500 ${expanded === item.id ? 'scale-100' : 'scale-[0.97] group-hover:scale-100'}`}>
                    {item.visual}
                  </div>
                </div>

                {/* Description */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <h3 className="text-sm font-bold text-white flex-1">{item.title}</h3>
                    {item.badge && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-white bg-white/10 border border-white/10 px-2 py-0.5 rounded-full flex-shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed flex-1">{item.description}</p>
                  <div className="mt-4 flex items-center gap-4">
                    <button
                      onClick={() => navigate('/docs')}
                      className="flex items-center gap-1 text-xs text-neutral-500 hover:text-white transition-colors"
                    >
                      Documentation <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature icon strip ── */}
      <section className="py-16 px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-600 mb-12">
            Every feature. Production-ready.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
            {[
              { icon: Monitor, label: 'Dashboard' },
              { icon: Activity, label: 'Time Warp' },
              { icon: Search, label: 'Deep Inspect' },
              { icon: Users, label: 'Collaborate' },
              { icon: Shield, label: 'Audit Logs' },
              { icon: BarChart2, label: 'Entropy Radar' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-3 text-center">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-neutral-400">
                  <Icon size={18} />
                </div>
                <span className="text-[10px] text-neutral-500 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>


    </main>
  );
}
