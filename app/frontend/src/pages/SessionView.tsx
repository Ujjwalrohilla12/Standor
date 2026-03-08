import { useState, useEffect, useRef } from 'react';
import { List, RowComponentProps } from 'react-window';
import { useParams, useNavigate } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Share2, Download, MessageSquarePlus, ExternalLink, ArrowLeft, Users, Search, X, Loader2, Code2, ScanSearch, Layers, Activity, Network, PlayCircle, GitBranch } from 'lucide-react';
import OSISlicer from '../components/3d/OSISlicer';
import Timeline from '../components/Timeline';
import PacketFilters from '../components/PacketFilters';
import AnnotationModal from '../components/AnnotationModal';
import LayerInspectorModal from '../components/LayerInspectorModal';
import EntropyRadar from '../components/EntropyRadar';
import FlowAnalysisPanel from '../components/FlowAnalysisPanel';
import NetworkTopology from '../components/NetworkTopology';
import ReplayPanel from '../components/ReplayPanel';
import AnomalyPanel from '../components/AnomalyPanel';
import StreamsPanel from '../components/StreamsPanel';
import ActivityFeed from '../components/ActivityFeed';
import useStore from '../store/useStore';
import { sessionsApi, packetsApi, annotationsApi, DpiResult, DpiFlowDetail } from '../utils/api';
import { copyToClipboard } from '../utils/clipboard';
import { toast } from 'sonner';
import { io } from 'socket.io-client';

type CenterView = 'osi' | 'flow' | 'topology' | 'replay' | 'streams';

const LAYER_COLORS = {
  7: '#6366f1', 6: '#a855f7', 5: '#14b8a6',
  4: '#06b6d4', 3: '#f59e0b', 2: '#f43f5e', 1: '#84cc16',
};

type TransformMode = 'hex' | 'base64' | 'url' | 'ascii';

function PayloadTransformPanel({ packet }: { packet: any }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<TransformMode>('hex');

  // Build a raw byte-like string from the packet's payload field (if any)
  const raw: string = packet?.payload ?? packet?.rawPayload ?? '';

  function transform(input: string, m: TransformMode): string {
    if (!input) return '(no payload data)';
    try {
      if (m === 'hex') {
        // If it's already hex-looking, return as-is; otherwise encode to hex
        if (/^[0-9a-f\s]+$/i.test(input)) return input.replace(/(.{2})/g, '$1 ').trim().toUpperCase();
        return Array.from(input).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ').toUpperCase();
      }
      if (m === 'base64') {
        // Try to decode as base64 first
        try { return atob(input.trim()); } catch { /* not valid base64 */ }
        // Otherwise encode to base64
        return btoa(input);
      }
      if (m === 'url') {
        try { return decodeURIComponent(input); } catch { return input; }
      }
      if (m === 'ascii') {
        return input.replace(/[^\x20-\x7e]/g, '.');
      }
    } catch { /* fall through */ }
    return input;
  }

  if (!raw && !open) return null;

  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] overflow-hidden shadow-card">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-neutral-400 hover:text-white transition-colors"
      >
        <span className="flex items-center gap-2"><Code2 size={15} /> Payload Transforms</span>
        <span className="text-xs">{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4">
          <div className="flex gap-1.5 mb-3">
            {(['hex', 'base64', 'url', 'ascii'] as TransformMode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${mode === m ? 'bg-white text-black' : 'text-neutral-400 hover:text-white border border-white/10'}`}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>
          <pre className="text-xs text-neutral-400 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed bg-black/30 rounded-lg p-3">
            {transform(raw, mode)}
          </pre>
        </div>
      )}
    </div>
  );
}

// ── DPI Analysis Panel ───────────────────────────────────────────────────────
const APP_COLORS: Record<string, string> = {
  YouTube: '#ff0000', Google: '#4285f4', Facebook: '#1877f2', Instagram: '#e1306c',
  Twitter: '#1da1f2', 'Twitter/X': '#1da1f2', Netflix: '#e50914', Amazon: '#ff9900',
  Microsoft: '#00a1f1', Apple: '#a2aaad', Discord: '#5865f2', GitHub: '#6e5494',
  Spotify: '#1db954', Zoom: '#2d8cff', Telegram: '#26a5e4', TikTok: '#ff0050',
  Cloudflare: '#f6821f', WhatsApp: '#25d366', Twitch: '#9147ff', Reddit: '#ff4500',
  LinkedIn: '#0077b5', Dropbox: '#0061ff', Slack: '#4a154b', Snapchat: '#fffc00',
  HTTPS: '#6366f1', 'HTTPS-Alt': '#818cf8', QUIC: '#a78bfa', 'HTTP/3': '#a78bfa',
  'DNS-over-TLS': '#14b8a6', HTTP: '#f59e0b',
  'HTTP-Alt': '#fbbf24', DNS: '#14b8a6', SSH: '#22d3ee', FTP: '#f472b6',
  SMTP: '#fb923c', IMAP: '#fb923c', POP3: '#fb923c', RDP: '#ef4444',
  ICMP: '#84cc16', ARP: '#f0abfc', IPv6: '#818cf8',
  NTP: '#94a3b8', DHCP: '#94a3b8', SNMP: '#94a3b8',
  SIP: '#c084fc', OpenVPN: '#10b981', PPTP: '#6ee7b7', IPsec: '#34d399',
  BitTorrent: '#f87171', TCP: '#475569', UDP: '#64748b', Unknown: '#374151',
};

// Anomaly type → human label + colour
const ANOMALY_STYLE: Record<string, { label: string; color: string }> = {
  dns_long_name: { label: 'DNS Tunnel?', color: '#f59e0b' },
  high_entropy_nonstandard: { label: 'C2 Beacon?', color: '#f87171' },
  ip_fragment: { label: 'IP Fragment', color: '#fb923c' },
  ttl_anomaly: { label: 'TTL Anomaly', color: '#facc15' },
  tcp_zero_window: { label: 'Zero Window', color: '#f43f5e' },
  icmp_flood: { label: 'ICMP Flood', color: '#e879f9' },
};

const TCP_STATE_STYLE: Record<DpiFlowDetail['state'], { label: string; color: string }> = {
  CLASSIFIED: { label: 'CLSF', color: '#818cf8' },   // C++ CLASSIFIED: ESTABLISHED + named app
  ESTABLISHED: { label: 'ESTAB', color: '#22c55e' },
  SYN_ONLY: { label: 'SYN', color: '#f59e0b' },
  CLOSED_FIN: { label: 'FIN', color: '#94a3b8' },
  CLOSED_RST: { label: 'RST', color: '#ef4444' },
  ACTIVE: { label: 'ACTV', color: '#6366f1' },
};

const ACTION_STYLE: Record<DpiFlowDetail['action'], { label: string; color: string }> = {
  FORWARD: { label: 'FWD', color: '#22c55e' },
  LOG_ONLY: { label: 'LOG', color: '#f59e0b' },
  DROP: { label: 'DROP', color: '#ef4444' },
};

function fmtBytes(b: number): string {
  if (b < 1024) return `${b}B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)}K`;
  return `${(b / 1048576).toFixed(1)}M`;
}

/** Generate a text report matching C++ DPIEngine::generateReport() format */
function generateDpiReport(result: DpiResult, title: string): string {
  const sep = '═'.repeat(55);
  const hr = '─'.repeat(55);
  const pad = (s: string, w: number) => s.padEnd(w);
  const lines: string[] = [
    sep,
    '      Standor DPI Analysis Report',
    sep,
    `Session   : ${title}`,
    `Analysed  : ${new Date(result.analysedAt).toLocaleString()}`,
    `Packets   : ${result.totalPackets.toLocaleString()}`,
    `Flows     : ${result.activeFlows.toLocaleString()}`,
    `Class Rate: ${result.classificationRate}%`,
    `Forwarded : ${result.forwarded.toLocaleString()}`,
    `Dropped   : ${result.dropped.toLocaleString()} (high-entropy / suspicious)`,
    '',
    sep,
    'FP Processing Stats',
    hr,
    `SNI Extractions      : ${result.processingStats.sniExtractions}`,
    `ALPN Extractions     : ${result.processingStats.alpnExtractions}`,
    `DNS Query Extractions: ${result.processingStats.dnsExtractions}`,
    `HTTP Host Extractions: ${result.processingStats.httpHostExtractions}`,
    `QUIC Detections      : ${result.processingStats.quicDetections}`,
    `Classification Hits  : ${result.processingStats.classificationHits}`,
    '',
    sep,
    'Connection Statistics',
    hr,
    `TCP Flows : ${result.connectionStats.tcpFlows}`,
    `  CLASSIFIED (named app + 3WHS) : ${result.connectionStats.classified}`,
    `  ESTABLISHED (3WHS, no app)    : ${result.connectionStats.established}`,
    `  SYN-only (port scan?)         : ${result.connectionStats.synOnly}`,
    `  CLOSED FIN (graceful)         : ${result.connectionStats.closedFin}`,
    `  CLOSED RST (forced)           : ${result.connectionStats.closedRst}`,
    `  ACTIVE                        : ${result.connectionStats.active}`,
    `UDP Flows : ${result.connectionStats.udpFlows}`,
    `Other     : ${result.connectionStats.otherFlows}`,
  ];

  if (result.portScans.length > 0) {
    lines.push('', sep, 'Port Scan Detection', hr);
    for (const s of result.portScans) {
      lines.push(`Scanner: ${s.scannerIp} (${s.isPrivate ? 'LAN' : 'WAN'})  targets=${s.targetsCount}  ports=[${s.portsTargeted.slice(0, 10).join(',')}${s.portsTargeted.length > 10 ? '…' : ''}]`);
    }
  }

  lines.push('', sep, 'Application Distribution', hr);
  lines.push(`${pad('Application', 22)} ${pad('Flows', 8)} %`);
  lines.push(hr);
  for (const { app, count, percent } of result.appStats) {
    lines.push(`${pad(app, 22)} ${pad(String(count), 8)} ${percent}%`);
  }

  if (result.topTalkers.length > 0) {
    lines.push('', sep, 'Top Talkers', hr);
    lines.push(`${pad('IP', 20)} ${pad('Bytes', 10)} ${pad('Flows', 7)} Type  Top App`);
    lines.push(hr);
    for (const { ip, bytes, flows, isPrivate, topApp } of result.topTalkers) {
      lines.push(`${pad(ip, 20)} ${pad(fmtBytes(bytes), 10)} ${pad(String(flows), 7)} ${isPrivate ? 'LAN  ' : 'WAN  '} ${topApp}`);
    }
  }

  if (result.detectedDomains.length > 0) {
    lines.push('', sep, `Top Domains (${result.detectedDomains.length})`, hr);
    lines.push(`${pad('Domain', 40)} ${pad('App', 15)} Count`);
    lines.push(hr);
    for (const { domain, app, count } of result.detectedDomains.slice(0, 30)) {
      lines.push(`${pad(domain, 40)} ${pad(app, 15)} ${count}`);
    }
  }

  if (result.protocolAnomalies.length > 0) {
    lines.push('', sep, 'Protocol Anomalies', hr);
    for (const a of result.protocolAnomalies) {
      lines.push(`[${a.type === 'dns_long_name' ? 'DNS-TUNNEL' : 'C2-BEACON'}] ${a.src}:${a.srcPort} → ${a.dst}:${a.dstPort}`);
      lines.push(`  ${a.detail}`);
    }
  }

  if (result.ipv6Packets || result.arpPackets || result.fragmentedPackets) {
    lines.push('', sep, 'Packet-Type Breakdown', hr);
    if (result.ipv6Packets) lines.push(`IPv6 packets       : ${result.ipv6Packets}`);
    if (result.arpPackets) lines.push(`ARP packets        : ${result.arpPackets}`);
    if (result.fragmentedPackets) lines.push(`Fragmented packets : ${result.fragmentedPackets}`);
    if (result.blockedFlows) lines.push(`Rule-blocked flows : ${result.blockedFlows}`);
  }

  lines.push('', sep, `Generated by Standor DPI Engine — ${new Date().toISOString()}`, sep);
  return lines.join('\n');
}

function DpiPanel({ sessionId }: { sessionId: string }) {
  const [open, setOpen] = useState(true);
  const [result, setResult] = useState<DpiResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFlows, setShowFlows] = useState(false);
  const session = useStore(s => s.currentSession);

  useEffect(() => {
    sessionsApi.getDpi(sessionId)
      .then(data => {
        if (!('status' in data)) setResult(data as DpiResult);
      })
      .catch(() => { /* DPI unavailable */ })
      .finally(() => setLoading(false));
  }, [sessionId]);

  function downloadReport() {
    if (!result) return;
    const text = generateDpiReport(result, session?.title || sessionId);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `standor-dpi-${sessionId.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] overflow-hidden shadow-card">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-neutral-400 hover:text-white transition-colors"
      >
        <span className="flex items-center gap-2">
          <ScanSearch size={16} className="text-indigo-400" />
          <span className="text-indigo-400">Deep Packet Inspection</span>
        </span>
        <span className="text-xs">{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-neutral-400 py-3">
              <Loader2 size={14} className="animate-spin text-indigo-400" />
              Analysing traffic…
            </div>
          )}

          {!loading && !result && (
            <p className="text-sm text-neutral-500 py-3">DPI analysis not available for this session.</p>
          )}

          {result && (
            <>
              {/* ── Stats grid ── */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Packets', value: result.totalPackets.toLocaleString() },
                  { label: 'Flows', value: result.activeFlows.toLocaleString() },
                  { label: 'Classified', value: `${result.classificationRate}%` },
                  { label: 'Forwarded', value: result.forwarded.toLocaleString() },
                  { label: 'Dropped', value: result.dropped.toLocaleString() },
                  { label: 'Apps', value: result.appStats.length.toString() },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded-lg bg-black/30 text-center">
                    <div className="text-[11px] text-neutral-500 mb-1 uppercase tracking-wider">{label}</div>
                    <div className="text-lg font-mono font-bold text-white leading-none">{value}</div>
                  </div>
                ))}
              </div>

              {/* ── IPv6 / ARP / Fragment / Rule-blocked counters ── */}
              {(result.ipv6Packets || result.arpPackets || result.fragmentedPackets || result.blockedFlows) ? (
                <div className="grid grid-cols-2 gap-2">
                  {result.ipv6Packets ? (
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                      <span className="text-xs text-indigo-400">IPv6 pkts</span>
                      <span className="text-sm font-mono font-semibold text-indigo-300">{result.ipv6Packets}</span>
                    </div>
                  ) : null}
                  {result.arpPackets ? (
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20">
                      <span className="text-xs text-fuchsia-400">ARP pkts</span>
                      <span className="text-sm font-mono font-semibold text-fuchsia-300">{result.arpPackets}</span>
                    </div>
                  ) : null}
                  {result.fragmentedPackets ? (
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <span className="text-xs text-orange-400">Fragmented</span>
                      <span className="text-sm font-mono font-semibold text-orange-300">{result.fragmentedPackets}</span>
                    </div>
                  ) : null}
                  {result.blockedFlows ? (
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                      <span className="text-xs text-red-400">Rule-blocked</span>
                      <span className="text-sm font-mono font-semibold text-red-300">{result.blockedFlows}</span>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* ── Classification rate bar ── */}
              {result.classificationRate > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Classification Rate</span>
                    <span className="text-sm font-mono font-bold text-indigo-400">{result.classificationRate}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${result.classificationRate}%` }} />
                  </div>
                </div>
              )}

              {/* ── Connection Statistics ── */}
              {result.connectionStats && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Connection Statistics</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-lg bg-black/30">
                      <div className="text-[11px] text-neutral-500 mb-1">TCP / UDP / Other</div>
                      <div className="text-sm font-mono text-white">
                        {result.connectionStats.tcpFlows}
                        <span className="text-neutral-600"> / </span>
                        {result.connectionStats.udpFlows}
                        <span className="text-neutral-600"> / </span>
                        {result.connectionStats.otherFlows}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-black/30">
                      <div className="text-[11px] text-neutral-500 mb-1">Classified</div>
                      <div className="text-sm font-mono text-indigo-400 font-semibold">{result.connectionStats.classified}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-black/30">
                      <div className="text-[11px] text-neutral-500 mb-1">Established</div>
                      <div className="text-sm font-mono text-green-400 font-semibold">{result.connectionStats.established}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-black/30">
                      <div className="text-[11px] text-neutral-500 mb-1">SYN-only</div>
                      <div className="text-sm font-mono text-amber-400 font-semibold">{result.connectionStats.synOnly}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-black/30">
                      <div className="text-[11px] text-neutral-500 mb-1">RST / FIN</div>
                      <div className="text-sm font-mono text-white">
                        <span className="text-red-400">{result.connectionStats.closedRst}</span>
                        <span className="text-neutral-600"> / </span>
                        <span className="text-neutral-400">{result.connectionStats.closedFin}</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-black/30">
                      <div className="text-[11px] text-neutral-500 mb-1">Active</div>
                      <div className="text-sm font-mono text-neutral-300">{result.connectionStats.active}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── App breakdown ── */}
              {result.appStats.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">App Breakdown <span className="text-neutral-600 normal-case font-normal">(by flow)</span></div>
                  {result.appStats.slice(0, 10).map(({ app, count, percent }) => (
                    <div key={app} className="flex items-center gap-2">
                      <div className="h-2 rounded-full flex-1 bg-white/[0.04] overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(2, percent)}%`, background: APP_COLORS[app] || '#6366f1' }} />
                      </div>
                      <div className="text-xs font-mono text-neutral-300 w-20 truncate">{app}</div>
                      <div className="text-xs font-mono text-neutral-500 w-16 text-right">
                        {count} <span className="text-neutral-600">{percent.toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                  {result.appStats.length > 10 && (
                    <div className="text-xs text-neutral-600 text-right">+{result.appStats.length - 10} more</div>
                  )}
                </div>
              )}

              {/* ── Top Talkers ── */}
              {result.topTalkers && result.topTalkers.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Top Talkers</div>
                  <div className="space-y-1">
                    {result.topTalkers.slice(0, 5).map(({ ip, flows, bytes, isPrivate, topApp }) => (
                      <div key={ip} className="flex items-center justify-between gap-2 py-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${isPrivate ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>
                            {isPrivate ? 'LAN' : 'WAN'}
                          </span>
                          <span className="text-xs font-mono text-neutral-300 truncate">{ip}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 text-xs font-mono">
                          <span className="text-neutral-400">{fmtBytes(bytes)}</span>
                          <span className="text-neutral-600">{flows}fl</span>
                          <span className="px-1.5 py-0.5 rounded text-xs" style={{ background: `${APP_COLORS[topApp] || '#6366f1'}22`, color: APP_COLORS[topApp] || '#6366f1' }}>{topApp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Port Scan Detection (C++ RuleManager port-scan heuristic) ── */}
              {result.portScans && result.portScans.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-red-400/80 uppercase tracking-wider flex items-center gap-1.5">
                    <span>⚑</span> Port Scans <span className="text-neutral-600 normal-case font-normal">({result.portScans.length} scanner{result.portScans.length > 1 ? 's' : ''})</span>
                  </div>
                  <div className="space-y-1.5">
                    {result.portScans.map((s) => (
                      <div key={s.scannerIp} className="rounded-lg bg-red-500/5 border border-red-500/10 px-3 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${s.isPrivate ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>
                            {s.isPrivate ? 'LAN' : 'WAN'}
                          </span>
                          <span className="text-xs font-mono text-red-300">{s.scannerIp}</span>
                        </div>
                        <div className="text-xs text-neutral-400">
                          {s.targetsCount} host{s.targetsCount !== 1 ? 's' : ''} · ports: {s.portsTargeted.slice(0, 8).join(', ')}{s.portsTargeted.length > 8 ? `…+${s.portsTargeted.length - 8}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Protocol Anomalies ── */}
              {result.protocolAnomalies && result.protocolAnomalies.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-amber-500/80 uppercase tracking-wider flex items-center gap-1.5">
                    <span>⚠</span> Anomalies <span className="text-neutral-600 normal-case font-normal">({result.protocolAnomalies.length})</span>
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                    {result.protocolAnomalies.map((a, i) => {
                      const style = ANOMALY_STYLE[a.type] ?? { label: a.type, color: '#f59e0b' };
                      return (
                        <div key={i} className="rounded-lg px-3 py-2" style={{ background: `${style.color}08`, border: `1px solid ${style.color}25` }}>
                          <div className="text-xs font-mono font-bold mb-0.5" style={{ color: style.color }}>{style.label}</div>
                          <div className="text-xs text-neutral-400 leading-relaxed">{a.detail}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Flow Details (C++ Connection struct — top 20 by bytes) ── */}
              {result.flowDetails && result.flowDetails.length > 0 && (
                <div className="space-y-2">
                  <button
                    onClick={() => setShowFlows(v => !v)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-neutral-500 uppercase tracking-wider hover:text-white transition-colors"
                  >
                    <span>Flow Details <span className="text-neutral-600 normal-case font-normal">({result.flowDetails.length})</span></span>
                    <span className="text-xs">{showFlows ? '▴' : '▾'}</span>
                  </button>
                  {showFlows && (
                    <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar">
                      {result.flowDetails.map((f, i) => {
                        const st = TCP_STATE_STYLE[f.state];
                        const act = ACTION_STYLE[f.action];
                        return (
                          <div key={i} className="rounded-lg bg-black/30 px-3 py-2.5 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-mono text-neutral-300 truncate">
                                {f.src}:{f.srcPort} → {f.dst}:{f.dstPort}
                              </span>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${act.color}22`, color: act.color }}>{act.label}</span>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${st.color}22`, color: st.color }}>{st.label}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap text-xs font-mono text-neutral-500">
                              <span style={{ color: APP_COLORS[f.app] || '#6366f1' }}>{f.app}</span>
                              {f.isIpv6 && <span className="text-indigo-400 font-bold">IPv6</span>}
                              <span>↑{fmtBytes(f.bytesIn)}</span>
                              <span>↓{fmtBytes(f.bytesOut)}</span>
                              {f.durationMs > 0 && <span>{f.durationMs}ms</span>}
                              {f.tlsVersion && <span className="text-neutral-600">{f.tlsVersion}</span>}
                              {f.alpn && f.alpn.length > 0 && <span className="text-indigo-400">{f.alpn.join(',')}</span>}
                              {f.sni && <span className="truncate text-neutral-600">{f.sni}</span>}
                              {f.ja3 && (
                                <span className="text-neutral-600 font-mono" title={`JA3: ${f.ja3}`}>
                                  JA3:{f.ja3.slice(0, 8)}…
                                </span>
                              )}
                              {f.blockedByRule && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400" title={`Blocked by rule: ${f.blockedByRule}`}>
                                  ✕ {f.blockedByRule}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── Detected Domains ── */}
              {result.detectedDomains.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Detected Domains <span className="text-neutral-600 normal-case font-normal">({result.detectedDomains.length})</span>
                  </div>
                  <div className="max-h-44 overflow-y-auto space-y-1 custom-scrollbar">
                    {result.detectedDomains.map(({ domain, app, count }) => (
                      <div key={domain} className="flex items-center justify-between py-1 gap-2">
                        <span className="text-xs font-mono text-neutral-300 truncate min-w-0">{domain}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {count > 1 && <span className="text-xs font-mono text-neutral-500">×{count}</span>}
                          <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: `${APP_COLORS[app] || '#6366f1'}22`, color: APP_COLORS[app] || '#6366f1' }}>
                            {app}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.processingStats && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Processing Stats</div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'SNI extracted', value: result.processingStats.sniExtractions },
                      { label: 'ALPN extracted', value: result.processingStats.alpnExtractions },
                      { label: 'Named apps', value: result.processingStats.classificationHits },
                      { label: 'DNS queries', value: result.processingStats.dnsExtractions },
                      { label: 'HTTP hosts', value: result.processingStats.httpHostExtractions },
                      { label: 'QUIC detected', value: result.processingStats.quicDetections },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between px-3 py-2 rounded-lg bg-black/30">
                        <span className="text-xs text-neutral-500">{label}</span>
                        <span className="text-sm font-mono font-semibold text-white">{value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Footer: timestamp + Download Report ── */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-neutral-600">
                  Analysed {new Date(result.analysedAt).toLocaleString()}
                </span>
                <button
                  onClick={downloadReport}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                >
                  ↓ Report
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const PACKET_ITEM_HEIGHT = 82; // px — protocol + addr line + size line + padding

// Shared data passed to every row via rowProps; each row uses its `index` to
// look up the correct packet.
type PacketListShared = { packets: any[]; selectedPacket: any; onSelect: (p: any) => void };

function PacketRow({ index, style, packets, selectedPacket, onSelect }: RowComponentProps<PacketListShared>) {
  const packet = packets[index];
  if (!packet) return null;
  const isSelected = selectedPacket?.id === packet.id;
  return (
    <div style={{ ...style, padding: '3px 10px', boxSizing: 'border-box' }}>
      <div
        onClick={() => onSelect(packet)}
        className={`h-full p-3.5 rounded-xl cursor-pointer transition-all ${isSelected
          ? 'bg-white/[0.08] border border-white/[0.15] shadow-lg'
          : 'border border-transparent hover:bg-white/[0.03] hover:border-white/[0.06]'
          }`}
        data-testid={`packet-item-${packet.id}`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-mono font-bold text-white">{packet.protocol}</span>
          {packet.entropyFlag && (
            <span className="px-2 py-0.5 text-xs rounded-md bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">High</span>
          )}
        </div>
        <div className="text-xs text-neutral-400 font-mono truncate">
          {packet.src}:{packet.srcPort} → {packet.dst}:{packet.dstPort}
        </div>
        <div className="text-xs text-neutral-600 mt-1">
          {packet.size}B {packet.flags && `· ${packet.flags}`}
        </div>
      </div>
    </div>
  );
}

function AutoSizedList({ packets, selectedPacket, onSelect }: { packets: any[]; selectedPacket: any; onSelect: (p: any) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(400);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      const h = entries[0]?.contentRect.height;
      if (h) setContainerHeight(h);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="h-full overflow-hidden">
      <List<PacketListShared>
        rowCount={packets.length}
        rowHeight={PACKET_ITEM_HEIGHT}
        defaultHeight={containerHeight}
        overscanCount={5}
        rowComponent={PacketRow}
        rowProps={{ packets, selectedPacket, onSelect }}
      />
    </div>
  );
}

export default function SessionView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentSession, setCurrentSession, packets, setPackets, selectedPacket, setSelectedPacket,
    selectedLayer, setSelectedLayer, isPlaying, setIsPlaying, playbackSpeed, setPlaybackSpeed,
    annotations, addAnnotation, setAnnotations,
  } = useStore();

  const [filteredPackets, setFilteredPackets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [showAnnotationModal, setShowAnnotationModal] = useState(false);
  const [showLayerInspector, setShowLayerInspector] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [centerView, setCenterView] = useState<CenterView>('osi');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);

  // Load session data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        if (id) {
          // Fetch session info
          const session = await sessionsApi.getOne(id);
          if (session) setCurrentSession(session);

          // Fetch packets
          const data = await packetsApi.getBySession(id);
          if (data.length > 0) {
            setPackets(data);
            setFilteredPackets(data);
            setSelectedPacket(data[0]);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to load session:', err);
        toast.error('Session not found');
        navigate('/dashboard');
      }
    };
    loadData();
  }, [id, setPackets, setSelectedPacket, setCurrentSession, navigate]);

  // Socket.io connection for real-time collaboration
  useEffect(() => {
    if (!id) return;
    const API = import.meta.env.VITE_BACKEND_URL;
    const socket = io(API, { path: '/sio/socket.io/', transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    const user = { id: 'user-' + Math.random().toString(36).slice(2, 8), name: 'John Doe' };

    socket.on('connect', () => {
      socket.emit('join_session', { sessionId: id, user });
    });

    socket.on('user_joined', (u) => {
      setOnlineUsers(prev => [...prev.filter(p => p.id !== u.id), u]);
      toast.info(`${u.name} joined the session`);
    });

    socket.on('user_left', (u) => {
      if (u) setOnlineUsers(prev => prev.filter(p => p.id !== u.id));
    });

    socket.on('new_annotation', (data) => {
      if (data.annotation) addAnnotation(data.annotation);
    });

    return () => {
      socket.emit('leave_session', { sessionId: id, user });
      socket.disconnect();
    };
  }, [id, addAnnotation]);

  useEffect(() => {
    if (selectedPacket) {
      annotationsApi.getByPacket(selectedPacket.id).then(setAnnotations).catch(() => { });
    }
  }, [selectedPacket, setAnnotations]);

  const handleFilterChange = (filters) => {
    let filtered = [...packets];
    if (filters.protocol) filtered = filtered.filter(p => p.protocol === filters.protocol);
    if (filters.entropyFlag) filtered = filtered.filter(p => p.entropyFlag);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(p => p.protocol.toLowerCase().includes(q) || p.src.includes(q) || p.dst.includes(q));
    }
    setFilteredPackets(filtered);
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchActive(false);
      setFilteredPackets(packets);
      return;
    }
    if (!id) return;
    setSearching(true);
    setSearchActive(true);
    try {
      const results = await packetsApi.search(id, { q: q.trim() });
      setFilteredPackets(results);
    } catch {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchActive(false);
    setFilteredPackets(packets);
  };

  const handleAnnotationSave = (annotation) => {
    addAnnotation(annotation);
    if (socketRef.current) {
      socketRef.current.emit('annotation_created', { sessionId: id, annotation });
    }
  };

  const handleExport = () => {
    const data = { session: currentSession, packets, annotations, exported: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `standor-${currentSession?.id || 'session'}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Session exported');
  };

  const handleShare = async () => {
    if (!id) return;
    try {
      const { url } = await sessionsApi.createShareLink(id);
      await copyToClipboard(url, 'Signed share link copied — expires in 48h');
    } catch {
      // Fall back to current URL
      const fallbackUrl = `${window.location.origin}/session/${id}`;
      await copyToClipboard(fallbackUrl, 'Link copied to clipboard');
    }
  };

  const packetAnnotations = annotations.filter(a => a.packetId === selectedPacket?.id);

  return (
    <div className="min-h-screen bg-ns-bg-900 pt-14 flex flex-col" data-testid="session-view">
      {/* Header */}
      {/* Header */}
      <div className="glass border-b border-white/[0.06] px-3 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between shrink-0 gap-3">
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto overflow-hidden">
          <button onClick={() => navigate('/dashboard')} className="p-1.5 sm:p-2 rounded-lg hover:bg-white/[0.06] text-neutral-400 hover:text-white transition-colors shrink-0" data-testid="back-btn">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-base sm:text-lg font-bold text-white truncate flex-1 min-w-0" data-testid="session-title">
            {currentSession?.title || 'Loading Session...'}
          </h1>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {onlineUsers.length > 0 && (
              <div className="flex items-center gap-1 sm:gap-1.5 mr-1 sm:mr-2 px-2 sm:px-3 py-1 rounded-full bg-white/[0.04]" data-testid="online-users">
                <Users size={12} className="text-emerald-400 sm:w-[13px] sm:h-[13px]" />
                <span className="text-[10px] sm:text-xs text-emerald-400 font-mono">{onlineUsers.length + 1}</span>
              </div>
            )}
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] sm:text-xs text-neutral-400 font-medium hidden xs:block">Live</span>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto -mt-1 sm:mt-0">
          <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/[0.03] rounded-lg border border-white/[0.06]">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-neutral-400 hover:text-white transition-colors"
              data-testid="play-pause-btn"
            >
              {isPlaying ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              )}
            </button>
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="bg-transparent text-[10px] sm:text-xs text-neutral-400 border-none outline-none cursor-pointer"
              data-testid="header-speed-select"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={2}>2x</option>
              <option value={5}>5x</option>
            </select>
          </div>

          {(currentSession?.collaborators || []).length > 0 && (
            <div className="flex -space-x-1.5 hidden sm:flex" data-testid="collaborators">
              {currentSession.collaborators.map(c => (
                <div key={c.id} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-neutral-600 flex items-center justify-center text-[10px] sm:text-xs font-semibold text-white border-2 border-ns-bg-900" title={c.name}>
                  {c.name?.charAt(0) || 'U'}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-1">
            <button onClick={handleShare} className="p-1.5 sm:p-2 rounded-lg hover:bg-white/[0.06] text-neutral-400 hover:text-white transition-colors" data-testid="share-btn" title="Share">
              <Share2 size={16} className="w-4 h-4 sm:w-[16px] sm:h-[16px]" />
            </button>
            <button onClick={handleExport} className="p-1.5 sm:p-2 rounded-lg hover:bg-white/[0.06] text-neutral-400 hover:text-white transition-colors" data-testid="export-session-btn" title="Export">
              <Download size={16} className="w-4 h-4 sm:w-[16px] sm:h-[16px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col sm:flex-row flex-1 overflow-hidden h-auto sm:h-[calc(100vh-10rem)] max-h-none sm:max-h-[calc(100vh-10rem)] pb-20 sm:pb-0">
        {/* Left Panel: Packets */}
        <div className={`border-b sm:border-b-0 sm:border-r border-white/[0.06] bg-ns-bg-800/30 flex flex-col transition-all duration-200 ${leftOpen ? 'h-96 sm:h-auto sm:w-80 shrink-0' : 'h-12 sm:h-auto sm:w-10 overflow-hidden'}`} data-testid="packet-list">
          <div className="flex items-center justify-between p-2 sm:p-3 border-b border-white/[0.06] shrink-0 cursor-pointer sm:cursor-default" onClick={() => window.innerWidth < 640 && setLeftOpen(!leftOpen)}>
            {leftOpen && <span className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Packets</span>}
            {!leftOpen && <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider sm:hidden">Packets</span>}
            <button
              onClick={(e) => { e.stopPropagation(); setLeftOpen(!leftOpen); }}
              className="p-1.5 rounded-lg hover:bg-white/[0.06] text-neutral-500 hover:text-white transition-colors ml-auto sm:ml-auto"
              data-testid="toggle-left-rail-btn"
            >
              <div className="hidden sm:block">
                {leftOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
              </div>
              <div className="sm:hidden text-xs">
                {leftOpen ? '▼' : '▶'}
              </div>
            </button>
          </div>

          {leftOpen && (
            <>
              {/* Server-side packet search */}
              <div className="px-2 sm:px-3 pt-2 sm:pt-3 pb-1">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search packets (IP, protocol…)"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-8 pr-9 py-2 text-xs sm:text-sm text-white placeholder-neutral-500 outline-none focus:border-white/[0.2] transition-colors"
                  />
                  {searching && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 animate-spin" />}
                  {searchActive && !searching && (
                    <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors">
                      <X size={14} />
                    </button>
                  )}
                </div>
                {searchActive && (
                  <p className="text-[10px] sm:text-xs text-neutral-500 font-mono mt-1.5 pl-1">
                    {filteredPackets.length} result{filteredPackets.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <PacketFilters onFilterChange={handleFilterChange} />
              <div className="flex-1 min-h-0" style={{ contain: 'strict' }}>
                <AutoSizedList packets={filteredPackets} selectedPacket={selectedPacket} onSelect={setSelectedPacket} />
              </div>
              <div className="p-2 sm:p-3 border-t border-white/[0.06] text-[10px] sm:text-xs text-neutral-500 text-center shrink-0">
                {filteredPackets.length} of {packets.length} packets
              </div>
            </>
          )}
        </div>

        {/* Center: multi-view panel */}
        <div className="flex-1 flex flex-col min-w-0 h-[50vh] sm:h-auto min-h-[400px] border-b sm:border-b-0 border-white/[0.06]" data-testid="osi-view">
          {/* View tabs */}
          <div className="flex items-center gap-1.5 px-2 sm:px-4 py-2 sm:py-2.5 border-b border-white/[0.05] shrink-0 bg-ns-bg-900/60 overflow-x-auto no-scrollbar">
            {([
              { id: 'osi', label: '3D', icon: Layers },
              { id: 'flow', label: 'Flow', icon: Activity },
              { id: 'topology', label: 'Topology', icon: Network },
              { id: 'replay', label: 'Replay', icon: PlayCircle },
              { id: 'streams', label: 'Streams', icon: GitBranch },
            ] as const).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCenterView(id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${centerView === id
                  ? 'bg-white/[0.08] text-white'
                  : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.03]'
                  }`}
              >
                <Icon size={14} className="sm:w-[15px] sm:h-[15px]" />
                {label}
              </button>
            ))}
          </div>
          {/* View content */}
          <div className="flex-1 relative min-h-0">
            {centerView === 'osi' && <OSISlicer />}
            {centerView === 'flow' && (
              <FlowAnalysisPanel packets={packets as any} />
            )}
            {centerView === 'topology' && (
              <NetworkTopology />
            )}
            {centerView === 'replay' && (
              <ReplayPanel
                packets={filteredPackets as any}
                onPacketSelect={setSelectedPacket}
                selectedPacket={selectedPacket}
              />
            )}
            {centerView === 'streams' && id && (
              <StreamsPanel sessionId={id} />
            )}
          </div>
        </div>

        {/* Right Panel: Details */}
        <div className={`sm:border-l border-white/[0.06] bg-ns-bg-800/30 flex flex-col transition-all duration-200 ${rightOpen ? 'h-auto sm:w-96 shrink-0' : 'h-12 sm:h-auto sm:w-10 overflow-hidden shrink-0'}`} data-testid="payload-panel">
          <div className="flex items-center justify-between p-2 sm:p-3 border-b border-white/[0.06] shrink-0 cursor-pointer sm:cursor-default" onClick={() => window.innerWidth < 640 && setRightOpen(!rightOpen)}>
            <button
              onClick={(e) => { e.stopPropagation(); setRightOpen(!rightOpen); }}
              className="p-1.5 rounded-lg hover:bg-white/[0.06] text-neutral-500 hover:text-white transition-colors"
              data-testid="toggle-right-rail-btn"
            >
              <div className="hidden sm:block">
                {rightOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
              </div>
              <div className="sm:hidden text-xs">
                {rightOpen ? '▼' : '▶'}
              </div>
            </button>
            {rightOpen && <span className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Details</span>}
            {!rightOpen && <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider sm:hidden ml-auto">Details</span>}
          </div>

          {rightOpen && (
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
              {/* Session-level DPI analysis */}
              {id && <DpiPanel sessionId={id} />}
              {/* Heuristic anomaly detection */}
              {id && <AnomalyPanel sessionId={id} />}
              {/* Activity feed */}
              {id && <ActivityFeed sessionId={id} />}

              {selectedPacket ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 sm:p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                      <div className="text-[10px] sm:text-xs text-neutral-500 mb-1 sm:mb-1.5 truncate">Protocol</div>
                      <div className="text-base sm:text-lg font-mono font-bold text-white truncate">{selectedPacket.protocol}</div>
                    </div>
                    <div className="p-3 sm:p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                      <div className="text-[10px] sm:text-xs text-neutral-500 mb-1 sm:mb-1.5 truncate">Size / Flags</div>
                      <div className="text-xs sm:text-sm font-mono text-neutral-200 truncate">{selectedPacket.size} bytes</div>
                      <div className="text-[10px] text-neutral-500 truncate mt-0.5">{selectedPacket.flags || 'None'}</div>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                    <div className="text-[10px] sm:text-xs text-neutral-500 mb-1">Source</div>
                    <div className="text-[11px] sm:text-sm font-mono text-neutral-200 truncate">{selectedPacket.src}:{selectedPacket.srcPort}</div>
                  </div>

                  <div className="p-3 sm:p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                    <div className="text-[10px] sm:text-xs text-neutral-500 mb-1">Destination</div>
                    <div className="text-[11px] sm:text-sm font-mono text-neutral-200 truncate">{selectedPacket.dst}:{selectedPacket.dstPort}</div>
                  </div>

                  {selectedPacket.entropy != null && (
                    <div className="p-3 sm:p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                      <div className="text-[10px] sm:text-xs text-neutral-500 mb-1.5">Entropy Score</div>
                      <div className="text-lg sm:text-2xl font-bold font-mono text-white">
                        {typeof selectedPacket.entropy === 'number' ? selectedPacket.entropy.toFixed(3) : selectedPacket.entropy}
                      </div>
                      <div className="mt-1.5 sm:mt-2 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-red-500"
                          style={{ width: `${Math.min(100, Number(selectedPacket.entropy) * 12.5)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {selectedLayer && (
                    <div className="p-3 sm:p-4 rounded-xl border" style={{
                      background: `linear-gradient(135deg, ${LAYER_COLORS[selectedLayer.id]}15 0%, rgba(10,10,10,0.6) 100%)`,
                      borderColor: `${LAYER_COLORS[selectedLayer.id]}25`,
                    }}>
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: LAYER_COLORS[selectedLayer.id] }} />
                          <div className="text-[10px] sm:text-xs text-neutral-400">Layer {selectedLayer.id}</div>
                        </div>
                        <button
                          onClick={() => setShowLayerInspector(true)}
                          className="flex items-center gap-1.5 text-[10px] sm:text-xs text-neutral-400 hover:text-white transition-colors"
                          data-testid="open-layer-inspector-btn"
                        >
                          Inspect <ExternalLink size={12} />
                        </button>
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-white mb-2">{selectedLayer.name}</div>
                      <pre className="text-[10px] sm:text-xs text-neutral-400 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto bg-black/20 rounded-lg p-2 sm:p-3">
                        {JSON.stringify(selectedPacket.layers[selectedLayer.name.toLowerCase()] || selectedPacket.layers[selectedLayer.name.toLowerCase().replace(' ', '')] || null, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Payload Transforms */}
                  <PayloadTransformPanel packet={selectedPacket} />

                  <button
                    onClick={() => setShowAnnotationModal(true)}
                    className="w-full py-2.5 sm:py-3 bg-white text-black rounded-xl text-xs sm:text-sm font-semibold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
                    data-testid="add-annotation-btn"
                  >
                    <MessageSquarePlus size={15} />
                    Add Annotation
                  </button>

                  {packetAnnotations.length > 0 && (
                    <div className="space-y-2 sm:space-y-3">
                      <div className="text-[10px] sm:text-xs font-semibold text-neutral-400 uppercase tracking-wider">Annotations</div>
                      {packetAnnotations.map((ann, idx) => (
                        <div key={idx} className="p-3 sm:p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                          <div className="text-[10px] sm:text-xs text-neutral-400 mb-1">{ann.userName}</div>
                          <div className="text-xs sm:text-sm text-neutral-200">{ann.comment}</div>
                          {ann.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {ann.tags.map(tag => (
                                <span key={tag} className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs rounded-full bg-white/[0.06] text-neutral-300">{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-neutral-500 py-16 text-xs sm:text-sm">
                  Select a packet to view details
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <Timeline />

      {/* Modals */}
      {showAnnotationModal && selectedPacket && (
        <AnnotationModal
          packet={selectedPacket}
          onClose={() => setShowAnnotationModal(false)}
          onSave={handleAnnotationSave}
        />
      )}
      {showLayerInspector && selectedLayer && selectedPacket && (
        <LayerInspectorModal
          layer={selectedLayer}
          packet={selectedPacket}
          onClose={() => setShowLayerInspector(false)}
        />
      )}
    </div>
  );
}
