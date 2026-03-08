import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

interface Packet {
  id: string;
  src: string;
  dst: string;
  protocol: string;
  size: number;
  timestamp: string;
  entropy?: number;
  entropyFlag?: boolean;
}

const PROTO_COLORS: Record<string, string> = {
  TCP: '#6366f1', UDP: '#f59e0b', ICMP: '#10b981', HTTPS: '#8b5cf6',
  HTTP: '#f43f5e', DNS: '#14b8a6', TLS: '#3b82f6', ARP: '#ec4899',
  UNKNOWN: '#6b7280',
};
function protoColor(p: string) { return PROTO_COLORS[p] ?? `hsl(${p.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360},55%,52%)`; }

const FMT_BYTES = (b: number) => b >= 1_048_576 ? `${(b / 1_048_576).toFixed(1)} MB` : b >= 1024 ? `${(b / 1024).toFixed(1)} KB` : `${b} B`;

export default function FlowAnalysisPanel({ packets }: { packets: Packet[] }) {
  const { bandwidthData, protocolData, topTalkers, totalBytes, flaggedCount } = useMemo(() => {
    if (!packets.length) return { bandwidthData: [], protocolData: [], topTalkers: [], totalBytes: 0, flaggedCount: 0 };

    const timestamps = packets
      .map(p => new Date(p.timestamp).getTime())
      .filter(t => !isNaN(t) && t > 0);

    let bandwidthData: { time: string; packets: number; bytes: number }[] = [];
    if (timestamps.length > 1) {
      const minTs = Math.min(...timestamps);
      const maxTs = Math.max(...timestamps);
      const span = maxTs - minTs;
      const bucketMs = Math.max(1000, Math.round(span / 40)); // ~40 buckets

      const buckets = new Map<number, { count: number; bytes: number }>();
      packets.forEach((p, i) => {
        const ts = timestamps[i];
        if (isNaN(ts) || ts <= 0) return;
        const key = Math.floor((ts - minTs) / bucketMs);
        const cur = buckets.get(key) ?? { count: 0, bytes: 0 };
        cur.count++;
        cur.bytes += (p.size || 0);
        buckets.set(key, cur);
      });

      const totalBuckets = Math.ceil(span / bucketMs);
      bandwidthData = Array.from({ length: totalBuckets }, (_, k) => {
        const d = buckets.get(k) ?? { count: 0, bytes: 0 };
        const ts = minTs + k * bucketMs;
        return {
          time: new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          packets: d.count,
          bytes: Math.round(d.bytes / 1024 * 10) / 10,
        };
      });
    }

    // Protocol distribution
    const protoCounts: Record<string, number> = {};
    packets.forEach(p => {
      const key = p.protocol || 'UNKNOWN';
      protoCounts[key] = (protoCounts[key] || 0) + 1;
    });
    const protocolData = Object.entries(protoCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, value]) => ({ name, value, pct: Math.round(value / packets.length * 100) }));

    // Top talkers by src IP
    const srcMap: Record<string, { count: number; bytes: number }> = {};
    packets.forEach(p => {
      if (!p.src) return;
      if (!srcMap[p.src]) srcMap[p.src] = { count: 0, bytes: 0 };
      srcMap[p.src].count++;
      srcMap[p.src].bytes += (p.size || 0);
    });
    const topTalkers = Object.entries(srcMap)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 8)
      .map(([ip, { count, bytes }]) => ({
        ip,
        count,
        bytes,
        pct: Math.round(count / packets.length * 100),
      }));

    const totalBytes = packets.reduce((s, p) => s + (p.size || 0), 0);
    const flaggedCount = packets.filter(p => p.entropyFlag).length;

    return { bandwidthData, protocolData, topTalkers, totalBytes, flaggedCount };
  }, [packets]);

  const uniqueSrcs = useMemo(() => new Set(packets.map(p => p.src)).size, [packets]);
  const uniqueProtos = useMemo(() => new Set(packets.map(p => p.protocol)).size, [packets]);

  if (!packets.length) {
    return (
      <div className="h-full flex items-center justify-center text-neutral-600 text-xs">
        No packets loaded — upload a PCAP to see flow analysis.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Flow Analysis</div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { label: 'Packets', value: packets.length.toLocaleString() },
          { label: 'Total Size', value: FMT_BYTES(totalBytes) },
          { label: 'Unique IPs', value: uniqueSrcs },
          { label: 'Flagged', value: flaggedCount, warn: flaggedCount > 0 },
        ].map(({ label, value, warn }) => (
          <div key={label} className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] text-center">
            <div className={`text-xs font-mono font-bold ${warn ? 'text-amber-400' : 'text-white'}`}>{value}</div>
            <div className="text-[8px] text-neutral-600 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Packet rate chart */}
      {bandwidthData.length > 1 && (
        <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-3">
          <div className="text-[10px] text-neutral-600 mb-3">Packet Rate Over Time</div>
          <ResponsiveContainer width="100%" height={110}>
            <AreaChart data={bandwidthData} margin={{ top: 2, right: 4, bottom: 0, left: -22 }}>
              <defs>
                <linearGradient id="pktGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                tick={{ fontSize: 8, fill: '#525252' }}
                tickLine={false} axisLine={false}
                interval={Math.max(0, Math.floor(bandwidthData.length / 6) - 1)}
              />
              <YAxis tick={{ fontSize: 8, fill: '#525252' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#0a0a0a', border: '1px solid #1f1f1f', borderRadius: 6, fontSize: 10 }}
                labelStyle={{ color: '#fff' }} itemStyle={{ color: '#a3a3a3' }}
              />
              <Area
                type="monotone" dataKey="packets" stroke="#6366f1"
                fill="url(#pktGrad)" strokeWidth={1.5} dot={false} name="Packets"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {/* Protocol distribution */}
        <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-3">
          <div className="text-[10px] text-neutral-600 mb-2">Protocol Mix</div>
          {protocolData.length > 0 && (
            <ResponsiveContainer width="100%" height={80}>
              <PieChart>
                <Pie data={protocolData} cx="50%" cy="50%" outerRadius={36} dataKey="value" strokeWidth={0}>
                  {protocolData.map((entry, i) => (
                    <Cell key={i} fill={protoColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0a0a0a', border: '1px solid #1f1f1f', borderRadius: 6, fontSize: 10 }}
                  itemStyle={{ color: '#a3a3a3' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="space-y-0.5 mt-1">
            {protocolData.slice(0, 5).map(({ name, value, pct }) => (
              <div key={name} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: protoColor(name) }} />
                <span className="text-[9px] text-neutral-500 flex-1 truncate">{name}</span>
                <span className="text-[9px] font-mono text-neutral-600">{value} <span className="text-neutral-700">{pct}%</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* Top talkers */}
        <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-3">
          <div className="text-[10px] text-neutral-600 mb-2">Top Sources</div>
          <div className="space-y-2">
            {topTalkers.slice(0, 6).map(({ ip, count, pct }) => (
              <div key={ip}>
                <div className="flex justify-between mb-0.5">
                  <span className="text-[9px] font-mono text-neutral-400 truncate max-w-[90px]">{ip}</span>
                  <span className="text-[9px] font-mono text-neutral-600 flex-shrink-0 ml-1">{count} <span className="text-neutral-700">{pct}%</span></span>
                </div>
                <div className="h-0.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500/50 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Unique protocols badge list */}
      <div className="flex flex-wrap gap-1.5">
        {Array.from(new Set(packets.map(p => p.protocol))).slice(0, 12).map(proto => (
          <span
            key={proto}
            className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold"
            style={{ background: `${protoColor(proto)}22`, color: protoColor(proto) }}
          >
            {proto}
          </span>
        ))}
        {uniqueProtos > 12 && (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-neutral-600 bg-white/[0.03]">
            +{uniqueProtos - 12} more
          </span>
        )}
      </div>
    </div>
  );
}
