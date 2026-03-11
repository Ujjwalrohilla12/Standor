import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";
import { roomsApi, meetingsApi, InterviewRoom } from "../utils/api";
import {
  Trash2,
  Plus,
  Search,
  Users,
  ArrowRight,
  Loader2,
  Download,
  Clock,
  CheckCircle,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Activity,
  X,
  RotateCcw,
} from "lucide-react";
import { CardSkeleton, TableSkeleton } from "../components/Skeletons";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import OnboardingTour from "../components/OnboardingTour";

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: "text-accent bg-accent/10 border-accent/20",
  MEDIUM:
    "text-accent-secondary bg-accent-secondary/10 border-accent-secondary/20",
  HARD: "text-accent-tertiary bg-accent-tertiary/10 border-accent-tertiary/20",
};

const DIFF_BAR_COLORS: Record<string, string> = {
  EASY: "#137fec",
  MEDIUM: "#af25f4",
  HARD: "#ccff00",
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel border-white/[0.08] rounded-lg px-3 py-2 text-xs shadow-xl backdrop-blur-md">
      <p className="text-neutral-400 mb-1">{label}</p>
      <p className="text-white font-bold">{payload[0].value} interviews</p>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useStore();
  const [rooms, setRooms] = useState<InterviewRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [showCharts, setShowCharts] = useState(false);

  // Pagination & Stats
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRoomsCount, setTotalRoomsCount] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    withParticipant: 0,
    avgScore: 0,
    passRate: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Analytics (Charts)
  const [analyticsData, setAnalyticsData] = useState<{
    activity: Array<{ week: string; count: number }>;
    difficulty: Array<{ diff: string; count: number }>;
  }>({ activity: [], difficulty: [] });
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Quick Create Session
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSessionData, setNewSessionData] = useState<{
    problem: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    language: string;
  }>({
    problem: "",
    difficulty: "MEDIUM",
    language: "javascript",
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadRooms();
  }, [page]);
  useEffect(() => {
    loadStats();
  }, []);
  useEffect(() => {
    if (showCharts) loadAnalytics();
  }, [showCharts]);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const { rooms, totalPages, total } = await roomsApi.getAll({
        page,
        limit: 10,
      });
      setRooms(rooms);
      setTotalPages(totalPages);
      setTotalRoomsCount(total);
    } catch (err) {
      console.error("Failed to load sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const data = await roomsApi.stats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const data = await roomsApi.analytics();
      setAnalyticsData(data);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newSessionData.problem.length < 2) return;
    setIsCreating(true);
    try {
      const room = await roomsApi.create(newSessionData);
      navigate(`/meeting/${room.callId || room.roomId}`);
    } catch (err) {
      console.error("Failed to create session:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateMeeting = async () => {
    setIsCreating(true);
    try {
      const meeting = await meetingsApi.create();
      navigate(`/meeting/${meeting.callId}`);
    } catch (err) {
      console.error("Failed to create meeting:", err);
    } finally {
      setIsCreating(false);
    }
  };

  // Charts now use analyticsData from server
  const activityData = analyticsData.activity;
  const difficultyData = analyticsData.difficulty;

  const handleExport = async (room: InterviewRoom) => {
    setExportingId(room.roomId);
    try {
      const blob = new Blob([JSON.stringify(room, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `standor-interview-${room.problem.replace(/\s+/g, "-").toLowerCase()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExportingId(null);
    }
  };

  const handleDelete = async (roomId: string) => {
    setDeleting(true);
    try {
      await roomsApi.delete(roomId);
      setRooms((prev) => prev.filter((r) => r.roomId !== roomId));
      setDeleteId(null);
    } catch (err) {
      console.error("Failed to delete session:", err);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = (rooms || []).filter(
    (r) =>
      r.problem.toLowerCase().includes(search.toLowerCase()) ||
      r.language.toLowerCase().includes(search.toLowerCase()) ||
      r.difficulty.toLowerCase().includes(search.toLowerCase()),
  );

  const totalSessions = stats.total;
  const totalParticipants = stats.withParticipant;
  const activeSessionsCount = stats.active;
  const completedSessionsCount = stats.completed;

  const isHost = (room: InterviewRoom) =>
    room.hostId === (user as any)?._id || room.hostId === (user as any)?.id;

  const formatDate = (d: string) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      className="min-h-screen pt-20 sm:pt-24 px-4 sm:px-6 pb-6 sm:pb-10 bg-[#0B0B0D]"
      data-testid="dashboard-page"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1
              className="text-2xl font-bold text-white mb-1"
              data-testid="dashboard-heading"
            >
              Dashboard
            </h1>
            <p className="text-sm text-neutral-500">
              Manage your interview sessions
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowCharts((v) => !v)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm border transition-colors ${
                showCharts
                  ? "bg-accent/10 border-accent/30 text-accent"
                  : "border-white/[0.06] text-neutral-500 hover:text-white hover:border-white/[0.12]"
              }`}
              title="Toggle analytics"
            >
              <TrendingUp size={15} />
            </button>
            <button
              onClick={() => {
                const randomId =
                  Math.random().toString(36).substring(7) +
                  "-" +
                  Math.random().toString(36).substring(7);
                navigate(`/codepair/${randomId}`);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-800 text-white rounded-lg font-semibold text-sm hover:bg-neutral-700 transition-colors w-full sm:w-auto"
              title="Start a quick collaborative coding session"
            >
              <Users size={16} />
              CodePair Session
            </button>
            <button
              onClick={handleCreateMeeting}
              disabled={isCreating}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-800 text-white rounded-lg font-semibold text-sm hover:bg-neutral-700 transition-colors w-full sm:w-auto"
              title="Start a quick meeting room"
            >
              <Users size={16} />
              New Meeting
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          {statsLoading
            ? [...Array(6)].map((_, i) => <CardSkeleton key={i} />)
            : [
                {
                  label: "Total Interviews",
                  value: stats.total,
                  icon: BarChart3,
                },
                {
                  label: "Active Now",
                  value: stats.active,
                  icon: Activity,
                  color: "text-accent",
                },
                {
                  label: "Completed",
                  value: stats.completed,
                  icon: CheckCircle,
                },
                {
                  label: "Avg Score",
                  value: `${(stats.avgScore || 0).toFixed(1)}/10`,
                  icon: TrendingUp,
                },
                {
                  label: "Pass Rate",
                  value: `${(stats.passRate || 0).toFixed(0)}%`,
                  icon: TrendingUp,
                  color: "text-accent-tertiary",
                },
                {
                  label: "Total Candidates",
                  value: stats.withParticipant,
                  icon: Users,
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="glass-panel p-3 sm:p-4 rounded-xl"
                  data-testid={`stat-${i}`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    {stat.icon && (
                      <stat.icon size={12} className="text-neutral-500" />
                    )}
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider truncate">
                      {stat.label}
                    </p>
                  </div>
                  <p
                    className={`text-lg sm:text-xl font-bold ${stat.color || "text-white"}`}
                  >
                    {stat.value}
                  </p>
                </div>
              ))}
        </div>

        {/* Analytics Charts */}
        {showCharts && rooms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Activity over time */}
            <div className="md:col-span-2 glass-panel p-4 rounded-xl">
              <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-4">
                Interviews over time
              </p>
              {activityData.length < 2 ? (
                <p className="text-xs text-neutral-700 text-center py-8">
                  Not enough data yet
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart
                    data={activityData}
                    margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="areaGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#137fec"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#137fec"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="week"
                      tick={{ fill: "#525252", fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#525252", fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ stroke: "rgba(255,255,255,0.08)" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#137fec"
                      strokeWidth={1.5}
                      fill="url(#areaGradient)"
                      dot={{ r: 3, fill: "#137fec", strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: "#af25f4", strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Difficulty breakdown */}
            <div className="glass-panel p-4 rounded-xl">
              <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-4">
                By difficulty
              </p>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart
                  data={difficultyData}
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="diff"
                    tick={{ fill: "#525252", fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#525252", fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="glass-panel border-white/[0.08] rounded-lg px-3 py-2 text-xs shadow-xl backdrop-blur-md">
                          <p className="text-white font-bold">
                            {payload[0].value} interviews
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                    {difficultyData.map((entry) => (
                      <Cell
                        key={entry.diff}
                        fill={DIFF_BAR_COLORS[entry.diff] || "#525252"}
                        fillOpacity={0.8}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

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
            placeholder="Search interviews by problem, language, or difficulty..."
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-white/[0.15] transition-colors"
            data-testid="dashboard-search"
          />
        </div>

        {/* Rooms list */}
        {loading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-40 text-neutral-500"
            data-testid="empty-state"
          >
            <Users size={32} className="mb-3 text-neutral-700" />
            <p className="text-sm mb-3">
              {search
                ? "No interviews match your search"
                : "No interview sessions yet"}
            </p>
            {!search && (
              <button
                onClick={() => navigate("/create-session")}
                className="flex items-center gap-2 px-4 py-2 bg-white/[0.06] text-white rounded-lg text-sm hover:bg-white/[0.1] transition-colors"
              >
                <Plus size={14} /> Create your first interview
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2" data-testid="sessions-list">
            {filtered.map((room) => (
              <div
                key={room.roomId}
                className="group flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl glass-panel hover:border-accent/30 hover:shadow-[0_4px_24px_rgba(19,127,236,0.05)] transition-all duration-300 cursor-pointer border border-transparent"
                data-testid={`session-card-${room.roomId}`}
              >
                <div
                  className="flex-1 min-w-0"
                  onClick={() => navigate(`/session/${room.roomId}`)}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3
                      className="text-sm font-semibold text-white truncate max-w-full"
                      data-testid={`session-title-${room.roomId}`}
                    >
                      {room.problem || "Untitled Interview"}
                    </h3>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded border font-mono font-bold uppercase ${DIFFICULTY_COLORS[room.difficulty] || ""}`}
                    >
                      {room.difficulty}
                    </span>
                    {room.status === "COMPLETED" && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.06] text-neutral-400 font-mono">
                        completed
                      </span>
                    )}
                    {room.status === "ACTIVE" && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-neutral-600">
                    <span className="font-mono">{room.language}</span>
                    <span>
                      {room.participantId ? "2 participants" : "1 participant"}
                    </span>
                    <span>{formatDate(room.startedAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity mt-2 sm:mt-0 pt-2 sm:pt-0 border-t border-white/[0.05] sm:border-t-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/session/${room.roomId}`);
                    }}
                    className="flex justify-center p-2 rounded-lg hover:bg-white/[0.06] text-neutral-500 hover:text-white transition-colors"
                    title="Open session"
                  >
                    <ArrowRight size={14} />
                  </button>
                  {room.status === "COMPLETED" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/replay/${room.roomId}`);
                      }}
                      className="flex justify-center p-2 rounded-lg hover:bg-white/[0.06] text-neutral-500 hover:text-accent transition-colors"
                      title="Replay session"
                    >
                      <RotateCcw size={14} />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExport(room);
                    }}
                    disabled={exportingId === room.roomId}
                    className="flex justify-center p-2 rounded-lg hover:bg-white/[0.06] text-neutral-500 hover:text-white transition-colors disabled:opacity-50"
                    title="Export interview report"
                  >
                    {exportingId === room.roomId ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Download size={14} />
                    )}
                  </button>
                  {isHost(room) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(room.roomId);
                      }}
                      className="flex justify-center p-2 rounded-lg hover:bg-red-500/10 text-neutral-500 hover:text-red-400 transition-colors"
                      title="Delete session"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.04]">
                <p className="text-xs text-neutral-500">
                  Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-white/[0.06] text-neutral-500 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-500 transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-white/[0.06] text-neutral-500 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-500 transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <OnboardingTour />

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="glass-panel border-white/[0.1] rounded-2xl p-6 sm:p-8 max-w-md w-full mx-4 shadow-2xl relative shadow-[0_0_80px_rgba(0,0,0,0.8)]">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-white mb-1">
              Create Interview
            </h2>
            <p className="text-sm text-neutral-500 mb-6">
              Set up a new collaborative session
            </p>

            <form onSubmit={handleCreateSession} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5 ml-1">
                  Problem Title
                </label>
                <input
                  autoFocus
                  type="text"
                  value={newSessionData.problem}
                  onChange={(e) =>
                    setNewSessionData((v) => ({
                      ...v,
                      problem: e.target.value,
                    }))
                  }
                  placeholder="e.g. Implement a LRU Cache"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-700 outline-none focus:border-white/[0.15] transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5 ml-1">
                    Difficulty
                  </label>
                  <select
                    value={newSessionData.difficulty}
                    onChange={(e) =>
                      setNewSessionData((v) => ({
                        ...v,
                        difficulty: e.target.value as any,
                      }))
                    }
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/[0.15] transition-all appearance-none"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5 ml-1">
                    Language
                  </label>
                  <select
                    value={newSessionData.language}
                    onChange={(e) =>
                      setNewSessionData((v) => ({
                        ...v,
                        language: e.target.value,
                      }))
                    }
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/[0.15] transition-all appearance-none"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="go">Go</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full py-4 bg-accent text-white rounded-xl font-bold text-sm hover:bg-accent-secondary transition-all flex items-center justify-center gap-2 mt-4 shadow-[0_0_20px_rgba(19,127,236,0.3)] hover:shadow-[0_0_30px_rgba(175,37,244,0.4)]"
              >
                {isCreating ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Plus size={18} /> Start Session
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
          data-testid="delete-modal"
        >
          <div className="glass-panel border-white/[0.1] rounded-xl p-6 max-w-sm w-full mx-4 shadow-[0_0_80px_rgba(0,0,0,0.8)]">
            <h3 className="text-base font-semibold text-white mb-2">
              Delete Interview
            </h3>
            <p className="text-sm text-neutral-400 mb-6">
              This will permanently delete the interview session and all
              associated data. This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
                data-testid="delete-cancel-btn"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50 flex items-center gap-2"
                data-testid="delete-confirm-btn"
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
