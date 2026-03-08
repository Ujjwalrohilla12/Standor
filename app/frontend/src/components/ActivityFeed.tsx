import { useState, useEffect } from 'react';
import { sessionsApi, ActivityEvent } from '../utils/api';
import { Activity, MessageSquare, Reply, Zap, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  sessionId: string;
}

const TYPE_CONFIG: Record<string, { icon: typeof Activity; color: string; label: string }> = {
  session_created: { icon: Zap, color: 'text-ns-accent', label: 'Created' },
  annotation_added: { icon: MessageSquare, color: 'text-blue-400', label: 'Annotated' },
  reply_added: { icon: Reply, color: 'text-emerald-400', label: 'Replied' },
};

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ActivityFeed({ sessionId }: Props) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    sessionsApi.getActivity(sessionId)
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <div className="ns-glass-dark rounded-[2rem] border border-white/[0.05] overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Activity size={13} className="text-ns-accent" />
          <span className="text-[10px] font-bold text-white uppercase tracking-widest opacity-70">Activity Feed</span>
          {!collapsed && (
            <span className="text-[9px] font-bold text-ns-grey-700 px-1.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.05]">
              {events.length}
            </span>
          )}
        </div>
        {collapsed ? <ChevronDown size={12} className="text-ns-grey-600" /> : <ChevronUp size={12} className="text-ns-grey-600" />}
      </button>

      {!collapsed && (
        <div className="border-t border-white/[0.04] max-h-64 overflow-y-auto">
          {loading ? (
            <div className="px-5 py-4 text-[10px] font-mono text-ns-grey-700 uppercase tracking-widest animate-pulse">
              Loading…
            </div>
          ) : events.length === 0 ? (
            <div className="px-5 py-4 text-[10px] font-mono text-ns-grey-700 uppercase tracking-widest">
              No activity yet
            </div>
          ) : (
            <div className="divide-y divide-white/[0.03]">
              {events.map((ev, i) => {
                const cfg = TYPE_CONFIG[ev.type] ?? TYPE_CONFIG.annotation_added;
                const Icon = cfg.icon;
                return (
                  <div key={i} className="flex items-start gap-3 px-5 py-3">
                    <div className="w-5 h-5 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mt-0.5 shrink-0">
                      <Icon size={10} className={cfg.color} />
                    </div>
                    <div className="min-w-0 flex-1">
                      {ev.actor && (
                        <span className="text-[10px] font-bold text-white mr-1">{ev.actor}</span>
                      )}
                      <span className="text-[10px] text-ns-grey-500 leading-snug">{ev.detail}</span>
                    </div>
                    <span className="text-[9px] font-mono text-ns-grey-700 shrink-0">{timeAgo(ev.ts)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
