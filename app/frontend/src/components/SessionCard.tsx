import { Clock, Package, Users } from 'lucide-react';

export default function SessionCard({ session }) {
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <div
      className="group p-5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04] transition-all duration-200"
      data-testid={`session-card-${session.id}`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-semibold text-white group-hover:text-neutral-100 leading-tight">
          {session.title}
        </h3>
        <div className="flex gap-1 shrink-0 ml-2">
          {session.tags?.includes('high-priority') && (
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-white/[0.08] text-neutral-300 font-medium">Priority</span>
          )}
          {session.tags?.includes('flagged') && (
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-white/[0.08] text-neutral-300 font-medium">Flagged</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-neutral-500 mb-4">
        <div className="flex items-center gap-1">
          <Package size={12} />
          <span>{(session.packets || 0).toLocaleString()} pkts</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>{formatTime(session.lastActivity || session.created)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex -space-x-1.5">
          {(session.collaborators || []).slice(0, 4).map(collab => (
            <div
              key={collab.id}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-semibold text-white border-2 border-ns-bg-900 bg-neutral-600"
              title={collab.name}
            >
              {collab.avatar}
            </div>
          ))}
        </div>
        {(session.collaborators || []).length > 0 && (
          <span className="text-[10px] text-neutral-600">
            {session.collaborators.length} {session.collaborators.length === 1 ? 'user' : 'users'}
          </span>
        )}
      </div>
    </div>
  );
}
