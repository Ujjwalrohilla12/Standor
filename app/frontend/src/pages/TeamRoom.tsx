import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Users,
  Copy,
  Check,
  ArrowRight,
  Play,
  BarChart2,
  Clock,
  Loader2,
  Video,
  Zap,
} from 'lucide-react';
import { roomsApi, InterviewRoom } from '../utils/api';
import { toast } from 'sonner';

// ── Helpers ───────────────────────────────────────────────────────────────────

function elapsedMinutes(startedAt: string): string {
  const ms = Date.now() - new Date(startedAt).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDuration(startedAt: string, endedAt?: string): string {
  const end = endedAt ? new Date(endedAt).getTime() : Date.now();
  return elapsedMinutes(startedAt).replace(
    /\d+/,
    String(Math.floor((end - new Date(startedAt).getTime()) / 60000))
  );
}

function difficultyColor(d: InterviewRoom['difficulty']): string {
  if (d === 'EASY') return 'text-green-400 bg-green-400/10 border-green-400/20';
  if (d === 'MEDIUM') return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
  return 'text-red-400 bg-red-400/10 border-red-400/20';
}

function scoreColor(score: number): string {
  if (score >= 9) return 'text-green-400';
  if (score >= 7) return 'text-yellow-400';
  return 'text-red-400';
}

function avgScore(room: InterviewRoom): number | null {
  if (!room.analyses || room.analyses.length === 0) return null;
  const sum = room.analyses.reduce((acc, a) => acc + (a.overallScore ?? 0), 0);
  return Math.round((sum / room.analyses.length) * 10) / 10;
}

function inviteLink(roomId: string): string {
  return `${window.location.origin}/lobby/${roomId}`;
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: string;
}

function StatCard({ label, value, icon, accent = 'text-[#137fec]' }: StatCardProps) {
  return (
    <div className="bg-[#0D1117] border border-white/[0.08] rounded-xl p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-white/[0.04] ${accent}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-white leading-none">{value}</p>
        <p className="text-xs text-[#6B7178] mt-1">{label}</p>
      </div>
    </div>
  );
}

// ── Active Room Card ──────────────────────────────────────────────────────────

interface ActiveCardProps {
  room: InterviewRoom;
  onCopy: (roomId: string) => void;
  copied: string | null;
}

function ActiveCard({ room, onCopy, copied }: ActiveCardProps) {
  const navigate = useNavigate();
  const participants = (room.participantId ? 2 : 1);

  return (
    <div className="min-w-[320px] max-w-[360px] bg-[#0D1117] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-4 flex-shrink-0 hover:border-white/[0.16] transition-colors duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm leading-snug truncate">{room.problem}</p>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${difficultyColor(room.difficulty)}`}
            >
              {room.difficulty}
            </span>
            <span className="text-[11px] text-[#6B7178] font-mono">{room.language}</span>
          </div>
        </div>
        {/* Live dot */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          <span className="text-[11px] text-green-400 font-medium">Live</span>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-[#6B7178] text-xs">
        <span className="flex items-center gap-1">
          <Users size={12} />
          {participants} / 2
        </span>
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {elapsedMinutes(room.startedAt)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-auto">
        <button
          onClick={() => navigate(`/session/${room.roomId}`)}
          className="flex-1 flex items-center justify-center gap-2 bg-[#137fec] hover:bg-[#1a8fff] text-white text-sm font-semibold py-2 rounded-lg transition-colors duration-150"
        >
          <Play size={14} />
          Join
        </button>
        <button
          onClick={() => onCopy(room.roomId)}
          title="Copy invite link"
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] hover:border-white/[0.2] hover:bg-white/[0.04] text-[#6B7178] hover:text-white transition-colors duration-150"
        >
          {copied === room.roomId ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
}

// ── Completed Row ─────────────────────────────────────────────────────────────

interface CompletedRowProps {
  room: InterviewRoom;
}

function CompletedRow({ room }: CompletedRowProps) {
  const navigate = useNavigate();
  const score = avgScore(room);
  const duration = formatDuration(room.startedAt, room.endedAt);

  return (
    <tr className="border-t border-white/[0.06] hover:bg-white/[0.02] transition-colors duration-100 group">
      <td className="py-3 pl-4 pr-2">
        <span className="text-white text-sm font-medium group-hover:text-[#137fec] transition-colors duration-150">
          {room.problem}
        </span>
      </td>
      <td className="py-3 px-2">
        <span
          className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${difficultyColor(room.difficulty)}`}
        >
          {room.difficulty}
        </span>
      </td>
      <td className="py-3 px-2">
        <span className="text-[#6B7178] text-xs font-mono">{room.language}</span>
      </td>
      <td className="py-3 px-2">
        <span className="text-[#6B7178] text-xs">{formatDate(room.startedAt)}</span>
      </td>
      <td className="py-3 px-2">
        <span className="text-[#6B7178] text-xs flex items-center gap-1">
          <Clock size={11} />
          {duration}
        </span>
      </td>
      <td className="py-3 px-2">
        {score !== null ? (
          <span className={`text-sm font-bold ${scoreColor(score)}`}>{score}</span>
        ) : (
          <span className="text-[#6B7178] text-xs">—</span>
        )}
      </td>
      <td className="py-3 pl-2 pr-4 text-right">
        <button
          onClick={() => navigate(`/replay/${room.roomId}`)}
          className="inline-flex items-center gap-1.5 text-xs text-[#137fec] hover:text-white border border-[#137fec]/30 hover:border-[#137fec] hover:bg-[#137fec]/10 px-3 py-1.5 rounded-lg transition-all duration-150"
        >
          <Video size={12} />
          Replay
        </button>
      </td>
    </tr>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
      {/* Illustration */}
      <div className="relative">
        <div className="w-24 h-24 rounded-2xl bg-[#137fec]/10 border border-[#137fec]/20 flex items-center justify-center">
          <Zap size={36} className="text-[#137fec]" />
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#af25f4]/20 border border-[#af25f4]/40 flex items-center justify-center">
          <span className="text-[#af25f4] text-xs font-bold">+</span>
        </div>
      </div>
      <div>
        <h3 className="text-white text-xl font-semibold mb-2">No interview rooms yet</h3>
        <p className="text-[#6B7178] text-sm max-w-xs">
          Create your first interview session and start practicing with real coding problems.
        </p>
      </div>
      <button
        onClick={onNew}
        className="flex items-center gap-2 bg-[#137fec] hover:bg-[#1a8fff] text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-150"
      >
        <Plus size={16} />
        Create your first interview session
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TeamRoom() {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState<InterviewRoom[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    active: number;
    completed: number;
    withParticipant: number;
    avgScore: number;
    passRate: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  // Tick for elapsed time display
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);
  // Prevent "now" unused lint error
  void now;

  const fetchRooms = useCallback(async () => {
    try {
      const data = await roomsApi.getAll({ limit: 50 });
      setRooms(data.rooms ?? []);
    } catch {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await roomsApi.stats();
      setStats(data);
    } catch {
      // Stats are non-critical — fail silently
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchRooms();
    fetchStats();
  }, [fetchRooms, fetchStats]);

  // Auto-refresh active rooms every 30 s
  useEffect(() => {
    const id = setInterval(fetchRooms, 30000);
    return () => clearInterval(id);
  }, [fetchRooms]);

  const handleCopy = useCallback((roomId: string) => {
    navigator.clipboard.writeText(inviteLink(roomId)).then(() => {
      setCopied(roomId);
      toast.success('Invite link copied!');
      setTimeout(() => setCopied(null), 2000);
    });
  }, []);

  const activeRooms = rooms.filter((r) => r.status === 'ACTIVE');
  const completedRooms = rooms.filter((r) => r.status === 'COMPLETED');
  const isEmpty = !loading && rooms.length === 0;

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white">
      {/* ── Page wrapper ── */}
      <div className="max-w-[1320px] mx-auto px-6 py-10 space-y-10">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Interview Rooms</h1>
            <p className="text-[#6B7178] text-sm mt-1">
              Manage your live and completed coding interview sessions
            </p>
          </div>
          <button
            onClick={() => navigate('/create-session')}
            className="flex items-center gap-2 bg-[#137fec] hover:bg-[#1a8fff] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors duration-150 whitespace-nowrap"
          >
            <Plus size={16} />
            New Room
          </button>
        </div>

        {/* ── Stats bar ── */}
        {!isEmpty && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {statsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-[#0D1117] border border-white/[0.08] rounded-xl p-5 h-[76px] animate-pulse" />
              ))
            ) : (
              <>
                <StatCard
                  label="Total Rooms"
                  value={stats?.total ?? rooms.length}
                  icon={<BarChart2 size={18} />}
                  accent="text-[#137fec]"
                />
                <StatCard
                  label="Active Now"
                  value={stats?.active ?? activeRooms.length}
                  icon={<Zap size={18} />}
                  accent="text-green-400"
                />
                <StatCard
                  label="Completed"
                  value={stats?.completed ?? completedRooms.length}
                  icon={<Check size={18} />}
                  accent="text-[#af25f4]"
                />
                <StatCard
                  label="Avg AI Score"
                  value={stats?.avgScore != null ? stats.avgScore.toFixed(1) : '—'}
                  icon={<BarChart2 size={18} />}
                  accent="text-[#ccff00]"
                />
              </>
            )}
          </div>
        )}

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="flex items-center justify-center py-32">
            <Loader2 size={28} className="animate-spin text-[#137fec]" />
          </div>
        )}

        {/* ── Empty state ── */}
        {isEmpty && <EmptyState onNew={() => navigate('/create-session')} />}

        {/* ── Active rooms ── */}
        {!loading && activeRooms.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              <h2 className="text-lg font-semibold text-white">Active Rooms</h2>
              <span className="text-xs text-[#6B7178] bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded-full">
                {activeRooms.length}
              </span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              {activeRooms.map((room) => (
                <ActiveCard key={room._id} room={room} onCopy={handleCopy} copied={copied} />
              ))}
              {/* "New room" ghost card */}
              <button
                onClick={() => navigate('/create-session')}
                className="min-w-[200px] max-w-[200px] bg-[#0D1117] border border-dashed border-white/[0.12] rounded-2xl p-5 flex flex-col items-center justify-center gap-3 flex-shrink-0 text-[#6B7178] hover:border-[#137fec]/50 hover:text-[#137fec] hover:bg-[#137fec]/[0.04] transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-lg border border-dashed border-current flex items-center justify-center">
                  <Plus size={18} />
                </div>
                <span className="text-xs font-medium text-center">Start a new session</span>
              </button>
            </div>
          </section>
        )}

        {/* ── Completed rooms ── */}
        {!loading && completedRooms.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold text-white">Recent Sessions</h2>
              <span className="text-xs text-[#6B7178] bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded-full">
                {completedRooms.length}
              </span>
            </div>

            <div className="bg-[#0D1117] border border-white/[0.08] rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[#6B7178] text-xs uppercase tracking-wider">
                    <th className="py-3 pl-4 pr-2 font-medium">Problem</th>
                    <th className="py-3 px-2 font-medium">Difficulty</th>
                    <th className="py-3 px-2 font-medium">Language</th>
                    <th className="py-3 px-2 font-medium">Date</th>
                    <th className="py-3 px-2 font-medium">Duration</th>
                    <th className="py-3 px-2 font-medium">AI Score</th>
                    <th className="py-3 pl-2 pr-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {completedRooms.map((room) => (
                    <CompletedRow key={room._id} room={room} />
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── No active rooms but has completed — show new room CTA ── */}
        {!loading && !isEmpty && activeRooms.length === 0 && (
          <div className="bg-[#0D1117] border border-white/[0.08] rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-14 h-14 rounded-xl bg-[#137fec]/10 border border-[#137fec]/20 flex items-center justify-center flex-shrink-0">
              <Zap size={24} className="text-[#137fec]" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-white font-semibold text-base">Ready to practice?</h3>
              <p className="text-[#6B7178] text-sm mt-0.5">
                Start a new room and sharpen your interview skills with real problems.
              </p>
            </div>
            <button
              onClick={() => navigate('/create-session')}
              className="flex items-center gap-2 bg-[#137fec] hover:bg-[#1a8fff] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors duration-150 whitespace-nowrap"
            >
              New Room
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
