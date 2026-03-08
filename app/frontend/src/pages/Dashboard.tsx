import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { sessionsApi } from '../utils/api';
import {
  Trash2,
  Plus,
  Search,
  Users,
  ArrowRight,
  Loader2,
  Download,
  Clock
} from 'lucide-react';

import OnboardingTour from '../components/OnboardingTour';

export default function Dashboard() {
  const navigate = useNavigate();
  const { sessions, setSessions } = useStore();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [exportingId, setExportingId] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await sessionsApi.getAll();
      setSessions(data);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (id: string, title: string) => {
    setExportingId(id);
    try {
      await sessionsApi.exportSnapshot(id, title);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExportingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await sessionsApi.delete(id);
      setSessions(sessions.filter((s: any) => s.id !== id));
      setDeleteId(null);
    } catch (err) {
      console.error('Failed to delete session:', err);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = sessions.filter((s: any) =>
    (s.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.tags || []).some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const totalSessions = sessions.length;
  const totalParticipants = sessions.reduce((sum: number, s: any) => sum + (s.participants || 0), 0);

  const formatDate = (d: string) => {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen pt-20 sm:pt-24 px-4 sm:px-6 pb-6 sm:pb-10 bg-ns-bg-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Dashboard
            </h1>
            <p className="text-sm text-neutral-500">
              Manage your interview sessions
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate('/create-session')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black rounded-lg font-semibold text-sm hover:bg-neutral-200 transition-colors w-full sm:w-auto"
            >
              <Plus size={16} />
              New Interview
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Interviews', value: totalSessions },
            { label: 'Participants', value: totalParticipants },
            {
              label: 'Active',
              value: sessions.filter(
                (s: any) => (Date.now() - new Date(s.lastActivity).getTime()) < 86400000
              ).length
            },
            {
              label: 'Completed',
              value: sessions.filter(
                (s: any) => s.status === 'completed'
              ).length
            }
          ].map((stat, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3 sm:p-4"
            >
              <p className="text-[10px] sm:text-xs text-neutral-500 mb-1 truncate">
                {stat.label}
              </p>
              <p className="text-lg sm:text-xl font-bold text-white">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search interviews..."
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-white/[0.15] transition-colors"
          />
        </div>

        {/* Sessions */}
        {loading ? (
          <div className="flex items-center justify-center h-40 text-neutral-500">
            <Loader2 size={20} className="animate-spin mr-2" />
            Loading interviews...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-neutral-500">
            <Users size={32} className="mb-3 text-neutral-700" />
            <p className="text-sm mb-3">
              {search
                ? 'No interviews match your search'
                : 'No interview sessions yet'}
            </p>
            {!search && (
              <button
                onClick={() => navigate('/create-session')}
                className="flex items-center gap-2 px-4 py-2 bg-white/[0.06] text-white rounded-lg text-sm hover:bg-white/[0.1] transition-colors"
              >
                <Plus size={14} />
                Create your first interview
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((session: any) => (
              <div
                key={session.id}
                className="group flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-white/[0.05] bg-white/[0.015] hover:border-white/[0.12] hover:bg-white/[0.025] transition-all duration-200 cursor-pointer"
              >
                <div
                  className="flex-1 min-w-0"
                  onClick={() => navigate(`/session/${session.id}`)}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-white truncate max-w-full">
                      {session.title || 'Untitled Interview'}
                    </h3>
                    {(session.tags || []).map((tag: string) => (
                      <span
                        key={tag}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-neutral-400 font-mono"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-neutral-600">
                    <span>
                      {session.participants || 0} participants
                    </span>
                    <span>
                      {formatDate(session.created)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity mt-2 sm:mt-0 pt-2 sm:pt-0 border-t border-white/[0.05] sm:border-t-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/session/${session.id}`);
                    }}
                    className="flex justify-center p-2 rounded-lg hover:bg-white/[0.06] text-neutral-500 hover:text-white transition-colors"
                  >
                    <ArrowRight size={14} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExport(session.id, session.title || 'session');
                    }}
                    disabled={exportingId === session.id}
                    className="flex justify-center p-2 rounded-lg hover:bg-white/[0.06] text-neutral-500 hover:text-white transition-colors"
                  >
                    {exportingId === session.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Download size={14} />
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(session.id);
                    }}
                    className="flex justify-center p-2 rounded-lg hover:bg-red-500/10 text-neutral-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <OnboardingTour />

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-ns-bg-800 border border-white/[0.08] rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-base font-semibold text-white mb-2">
              Delete Interview
            </h3>
            <p className="text-sm text-neutral-400 mb-6">
              This will permanently delete the interview session and all associated data.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleting && <Loader2 size={14} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
