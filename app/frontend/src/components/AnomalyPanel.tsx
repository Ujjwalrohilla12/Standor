import { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, Zap, Loader2 } from 'lucide-react';
import { sessionsApi } from '../utils/api';

type AnomalySeverity = 'low' | 'medium' | 'high' | 'critical';
type AnomalyType = 'syn_flood' | 'dns_blitz' | 'port_scan' | 'volume_spike' | 'high_entropy_flow';
type RiskLabel = 'clean' | 'low' | 'medium' | 'high' | 'critical';

interface AnomalyFinding {
  type: AnomalyType;
  severity: AnomalySeverity;
  source?: string;
  detail: string;
  count: number;
  score: number;
}

interface AnomalyResult {
  overallScore: number;
  riskLabel: RiskLabel;
  findings: AnomalyFinding[];
  analysedAt: string;
  packetCount: number;
}

const SEVERITY_STYLES: Record<AnomalySeverity, string> = {
  low: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  high: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  critical: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

const TYPE_LABELS: Record<AnomalyType, string> = {
  syn_flood: 'SYN Flood',
  dns_blitz: 'DNS Blitz',
  port_scan: 'Port Scan',
  volume_spike: 'Volume Spike',
  high_entropy_flow: 'High Entropy',
};

const RISK_CONFIG: Record<RiskLabel, { color: string; bg: string; label: string; Icon: React.FC<any> }> = {
  clean: { color: '#10b981', bg: '#10b98115', label: 'Clean', Icon: ShieldCheck },
  low: { color: '#3b82f6', bg: '#3b82f615', label: 'Low Risk', Icon: ShieldAlert },
  medium: { color: '#f59e0b', bg: '#f59e0b15', label: 'Medium', Icon: AlertTriangle },
  high: { color: '#f97316', bg: '#f9731615', label: 'High Risk', Icon: AlertTriangle },
  critical: { color: '#ef4444', bg: '#ef444415', label: 'Critical', Icon: Zap },
};

export default function AnomalyPanel({ sessionId }: { sessionId: string }) {
  const [open, setOpen] = useState(true);
  const [result, setResult] = useState<AnomalyResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await sessionsApi.getAnomaly(sessionId);
        if ('status' in data) {
          // Still pending — shouldn't happen since we run sync
          setLoading(false);
        } else {
          setResult(data as AnomalyResult);
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    };
    load();
  }, [sessionId]);

  const riskCfg = result ? RISK_CONFIG[result.riskLabel] : null;

  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] overflow-hidden shadow-card">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-neutral-400 hover:text-white transition-colors"
      >
        <span className="flex items-center gap-2">
          <ShieldAlert size={16} className="text-amber-400" />
          <span className="text-amber-400">Anomaly Detection</span>
          {result && !loading && (
            <span
              className="px-1.5 py-0.5 rounded text-xs font-bold ml-1"
              style={{ background: riskCfg?.bg, color: riskCfg?.color }}
            >
              {riskCfg?.label}
            </span>
          )}
        </span>
        <span className="text-xs">{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-neutral-400 py-3">
              <Loader2 size={14} className="animate-spin text-amber-400" />
              Analysing traffic patterns…
            </div>
          )}

          {!loading && !result && (
            <p className="text-sm text-neutral-500 py-3">
              No anomaly data available for this session.
            </p>
          )}

          {result && riskCfg && (
            <>
              {/* Score gauge */}
              <div className="flex items-center gap-4 py-2">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: riskCfg.bg }}
                >
                  <riskCfg.Icon size={22} style={{ color: riskCfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-white">{riskCfg.label}</span>
                    <span className="text-base font-mono font-bold" style={{ color: riskCfg.color }}>
                      {result.overallScore}/100
                    </span>
                  </div>
                  <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${result.overallScore}%`, background: riskCfg.color }}
                    />
                  </div>
                  <div className="text-xs text-neutral-500 mt-1.5 font-mono">
                    {result.packetCount.toLocaleString()} packets analysed · {result.findings.length} finding{result.findings.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              {/* Findings */}
              {result.findings.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Findings
                  </div>
                  {result.findings.map((f, i) => (
                    <div key={i} className="rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpanded(expanded === i ? null : i)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white/[0.03] transition-colors text-left"
                      >
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold flex-shrink-0 ${SEVERITY_STYLES[f.severity]}`}>
                          {f.severity.toUpperCase()}
                        </span>
                        <span className="text-sm text-neutral-300 font-mono flex-1 truncate">
                          {TYPE_LABELS[f.type]}
                          {f.source && <span className="text-neutral-500 ml-1.5">— {f.source}</span>}
                        </span>
                        <span className="text-xs font-mono text-neutral-500 flex-shrink-0">
                          {f.score}
                        </span>
                      </button>
                      {expanded === i && (
                        <div className="px-3 pb-3 text-sm text-neutral-400 leading-relaxed bg-black/10">
                          {f.detail}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-500 text-center py-2">
                  No anomalous patterns detected.
                </p>
              )}

              <div className="text-xs text-neutral-500 pt-1 font-mono">
                Analysed {new Date(result.analysedAt).toLocaleString()}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
