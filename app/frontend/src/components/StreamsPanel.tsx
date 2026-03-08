import { useState, useEffect } from 'react';
import { sessionsApi, StreamFlow } from '../utils/api';
import { Network, Lock, Globe, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  sessionId: string;
}

const PROTO_COLOR: Record<string, string> = {
  HTTPS: 'text-violet-400',
  HTTP: 'text-blue-400',
  DNS: 'text-emerald-400',
  TCP: 'text-amber-400',
  UDP: 'text-orange-400',
  ICMP: 'text-rose-400',
};

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

export default function StreamsPanel({ sessionId }: Props) {
  const [streams, setStreams] = useState<StreamFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    sessionsApi.getStreams(sessionId)
      .then(setStreams)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sessionId]);

  const filtered = filter
    ? streams.filter(s =>
        s.src.includes(filter) || s.dst.includes(filter) ||
        s.protocol.toLowerCase().includes(filter.toLowerCase()) ||
        s.httpSummary?.includes(filter) || s.dnsSummary?.includes(filter)
      )
    : streams;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-ns-grey-600">
        <Network size={28} className="animate-pulse mr-3" />
        <span className="text-sm font-mono uppercase tracking-[0.15em]">Reconstructing Streams…</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          <Network size={16} className="text-ns-accent" />
          <span className="text-sm font-bold text-white uppercase tracking-widest opacity-70">TCP/UDP Streams</span>
          <span className="text-[10px] font-bold text-ns-grey-600 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
            {filtered.length} flows
          </span>
        </div>
        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter by IP, protocol…"
          className="text-xs bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-1.5 text-white placeholder-ns-grey-700 outline-none focus:border-ns-accent w-48 transition-all"
        />
      </div>

      {/* Stream list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-ns-grey-700 text-xs font-mono uppercase tracking-widest">
            No streams found
          </div>
        ) : (
          filtered.map(s => {
            const isOpen = expanded === s.streamId;
            return (
              <div key={s.streamId} className="rounded-2xl border border-white/[0.05] bg-white/[0.02] overflow-hidden">
                {/* Row */}
                <button
                  onClick={() => setExpanded(isOpen ? null : s.streamId)}
                  className="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/[0.03] transition-colors text-left"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {s.isEncrypted
                      ? <Lock size={13} className="text-violet-400 shrink-0" />
                      : <Globe size={13} className="text-ns-grey-500 shrink-0" />
                    }
                    <span className={`text-[10px] font-bold uppercase tracking-widest shrink-0 ${PROTO_COLOR[s.protocol] ?? 'text-ns-grey-400'}`}>
                      {s.protocol}
                    </span>
                    <span className="text-xs text-ns-grey-300 truncate">
                      {s.src}:{s.srcPort}
                    </span>
                    <ArrowRight size={10} className="text-ns-grey-700 shrink-0" />
                    <span className="text-xs text-ns-grey-300 truncate">
                      {s.dst}:{s.dstPort}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 text-[10px] text-ns-grey-600 font-bold">
                    <span>{s.packetCount} pkts</span>
                    <span>{formatBytes(s.bytes)}</span>
                    <span>{formatDuration(s.durationMs)}</span>
                    {s.entropyFlagged > 0 && (
                      <span className="text-amber-400">{s.entropyFlagged} ⚠</span>
                    )}
                  </div>
                  {isOpen ? <ChevronUp size={12} className="text-ns-grey-600" /> : <ChevronDown size={12} className="text-ns-grey-600" />}
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="px-4 pb-4 space-y-2 text-[11px] text-ns-grey-400 border-t border-white/[0.04] pt-3">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                      <span><span className="text-ns-grey-600 uppercase tracking-wider text-[9px]">Avg Entropy</span><br />{(s.avgEntropy * 100).toFixed(1)}%</span>
                      <span><span className="text-ns-grey-600 uppercase tracking-wider text-[9px]">Flags Seen</span><br />{s.flagsSeen.length > 0 ? s.flagsSeen.join(' ') : '—'}</span>
                      {s.httpSummary && (
                        <span className="col-span-2"><span className="text-ns-grey-600 uppercase tracking-wider text-[9px]">HTTP</span><br />{s.httpSummary}</span>
                      )}
                      {s.dnsSummary && (
                        <span className="col-span-2"><span className="text-ns-grey-600 uppercase tracking-wider text-[9px]">DNS Query</span><br />{s.dnsSummary}</span>
                      )}
                      {s.ja3 && (
                        <span className="col-span-2">
                          <span className="text-ns-grey-600 uppercase tracking-wider text-[9px]">JA3 Fingerprint</span><br />
                          <span className="font-mono text-violet-400 break-all">{s.ja3}</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
