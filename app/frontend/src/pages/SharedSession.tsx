import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { sessionsApi } from '../utils/api';
import { Session } from '../store/useStore';
import { Package, Clock, Tag, Shield, ExternalLink, AlertTriangle } from 'lucide-react';

export default function SharedSession() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<{ session: Session; expiresAt: string; viewCount: number } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    sessionsApi.getShared(token)
      .then(setData)
      .catch(() => setError('This share link is invalid or has expired.'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ns-bg-900 flex items-center justify-center">
        <div className="text-ns-grey-600 text-sm font-mono uppercase tracking-[0.2em] animate-pulse">
          Validating share link…
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-ns-bg-900 flex flex-col items-center justify-center gap-6 px-6">
        <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertTriangle size={28} className="text-red-400" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Link Expired or Invalid</h1>
          <p className="text-ns-grey-500 text-sm max-w-xs">{error || 'This share link could not be found.'}</p>
        </div>
        <Link
          to="/"
          className="px-6 py-2.5 bg-white text-black rounded-xl text-sm font-bold hover:bg-ns-grey-100 transition-all"
        >
          Go to Standor
        </Link>
      </div>
    );
  }

  const { session, expiresAt, viewCount } = data;

  return (
    <div className="min-h-screen bg-ns-bg-900 pt-24 px-6 pb-16">
      <div className="max-w-3xl mx-auto">
        {/* Header banner */}
        <div className="flex items-center gap-3 mb-8 px-4 py-3 rounded-2xl bg-ns-accent/10 border border-ns-accent/20">
          <Shield size={16} className="text-ns-accent" />
          <span className="text-xs font-bold text-ns-accent uppercase tracking-widest">Read-Only Shared Investigation</span>
          <span className="ml-auto text-[10px] text-ns-grey-600 font-mono">
            Expires {new Date(expiresAt).toLocaleDateString()} · {viewCount} view{viewCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Session card */}
        <div className="ns-glass-dark rounded-[2.5rem] border border-white/[0.05] p-10">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">{session.title}</h1>
          <div className="flex items-center gap-4 text-[10px] font-bold text-ns-grey-600 uppercase tracking-widest mb-8">
            <span className="flex items-center gap-1.5">
              <Package size={11} />
              {session.packets ?? 0} packets
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={11} />
              {new Date(session.created).toLocaleString()}
            </span>
          </div>

          {/* Tags */}
          {session.tags && session.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {session.tags.map((t: string) => (
                <span key={t} className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-white/[0.04] border border-white/[0.06] text-ns-grey-400 uppercase tracking-wider">
                  <Tag size={9} />
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="pt-6 border-t border-white/[0.05]">
            <p className="text-xs text-ns-grey-600 mb-4">
              This is a read-only summary. Sign in to Standor to access full interview replays, AI analysis, and collaborative review tools.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl text-sm font-bold hover:bg-ns-grey-100 transition-all shadow-xl"
            >
              Open in Standor
              <ExternalLink size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
