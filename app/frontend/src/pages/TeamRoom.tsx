import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionsApi, analyticsApi, orgsApi } from '../utils/api';
import { copyToClipboard } from '../utils/clipboard';
import { Users, ArrowRight, Clock, Package, Share2, Plus, Shield, Globe, Terminal, Zap, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface TeamAnalytics {
  period: { days: number; since: string };
  summary: {
    totalSessions: number;
    totalPackets: number;
    totalAnnotations: number;
    avgAnnotationsPerSession: number;
    avgAnomalyScore: number;
  };
  scoreDistribution: Record<string, number>;
  topAnnotators: Array<{ name: string; count: number }>;
  sessionsPerDay: Array<{ date: string; count: number }>;
}

export default function TeamRoom() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [analytics, setAnalytics] = useState<TeamAnalytics | null>(null);
  const [org, setOrg] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [data, analyticsData, orgData] = await Promise.allSettled([
          sessionsApi.getAll(),
          analyticsApi.getTeam(30),
          orgsApi.getMyOrg(),
        ]);
        if (data.status === 'fulfilled') setSessions(data.value);
        if (analyticsData.status === 'fulfilled') setAnalytics(analyticsData.value);
        if (orgData.status === 'fulfilled') setOrg(orgData.value);
      } catch { }
      setLoading(false);
    };
    load();
  }, []);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    try {
      await orgsApi.invite(inviteEmail);
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to send invite');
    }
  };

  const handleShareSession = async (sessionId: string) => {
    try {
      const { url } = await sessionsApi.createShareLink(sessionId);
      await copyToClipboard(url, 'Signed share link copied — expires in 48h');
    } catch {
      const url = `${window.location.origin}/session/${sessionId}`;
      await copyToClipboard(url, 'Session link copied to clipboard');
    }
  };

  const formatDate = (d: string) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen pt-32 px-6 pb-24 bg-ns-bg-900" data-testid="team-room-page">
      <div className="ns-container max-w-6xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ns-accent/10 border border-ns-accent/20 text-[10px] font-bold text-ns-accent uppercase tracking-[0.2em] mb-6">
              Forensic Workspace
            </div>
            <h1 className="text-5xl font-bold text-white mb-4 tracking-tighter" data-testid="team-heading">Command Center</h1>
            <p className="text-lg text-ns-grey-400 leading-relaxed font-medium">
              Real-time collaborative technical interviews for engineering teams.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {(org?.members || []).slice(0, 5).map((member: any, i: number) => {
                const initials = member.name ? member.name.substring(0, 2).toUpperCase() : member.email.substring(0, 2).toUpperCase();
                return (
                  <div key={i} className="relative group" title={member.name || member.email}>
                    <div className={`w-10 h-10 rounded-full bg-ns-bg-800 border-2 border-ns-bg-900 flex items-center justify-center text-white text-[10px] font-bold transition-transform group-hover:-translate-y-1 shadow-2xl`}>
                      {initials}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-ns-bg-900 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]`} />
                  </div>
                );
              })}
            </div>
            <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-ns-grey-400 hover:text-white hover:bg-white/5 transition-all">
              <Plus size={18} />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar: Invite & Members */}
          <div className="lg:col-span-1 space-y-8">
            <div className="ns-glass-dark rounded-[2.5rem] border border-white/[0.05] p-8 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Users size={80} />
              </div>
              <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-6 opacity-60">Invite Analyst</h2>
              <div className="space-y-4 relative z-10">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="interviewer@standor.dev"
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl px-5 py-4 text-sm text-white placeholder-ns-grey-700 outline-none focus:border-ns-accent transition-all shadow-inner"
                  data-testid="invite-email-input"
                />
                <button
                  onClick={handleInvite}
                  className="w-full py-4 bg-white text-black rounded-2xl text-sm font-bold hover:bg-ns-grey-100 transition-all shadow-2xl active:scale-[0.98]"
                  data-testid="invite-btn"
                >
                  Send Invitation
                </button>
              </div>
            </div>

            <div className="ns-glass-dark rounded-[2.5rem] border border-white/[0.05] p-8">
              <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-6 opacity-60">System Status</h2>
              <div className="space-y-4">
                {[
                  { label: 'Ingest Engine', status: 'Optimal', icon: Zap, color: 'text-ns-accent' },
                  { label: 'CRDT Sync', status: 'Stable', icon: Globe, color: 'text-emerald-500' },
                  { label: 'Audit Vault', status: 'Locked', icon: Shield, color: 'text-ns-teal' }
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center gap-3">
                      <s.icon size={14} className={s.color} />
                      <span className="text-xs font-medium text-ns-grey-300">{s.label}</span>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${s.color}`}>{s.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content: Shared Sessions */}
          <div className="lg:col-span-2">
            <div className="ns-glass-dark rounded-[2.5rem] border border-white/[0.05] p-10 h-full min-h-[500px]" data-testid="shared-sessions">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-sm font-bold text-white uppercase tracking-widest opacity-60">Active Investigations</h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-ns-grey-500 tracking-widest uppercase">{sessions.length} Live Sessions</span>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-ns-grey-600">
                  <Terminal size={32} className="animate-pulse mb-4" />
                  <p className="text-sm font-mono uppercase tracking-[0.2em]">Synchronizing Vault...</p>
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-20 bg-white/[0.01] rounded-[2rem] border border-dashed border-white/5">
                  <Package size={48} className="mx-auto text-ns-grey-800 mb-6" />
                  <h3 className="text-xl font-bold text-white mb-2">Vault Empty</h3>
                  <p className="text-sm text-ns-grey-500 mb-8 max-w-xs mx-auto">No shared investigations found. Upload a PCAP to initialize a new collective hunt.</p>
                  <button onClick={() => navigate('/upload')} className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/10 transition-all flex items-center gap-2 mx-auto">
                    Go to Upload
                    <ArrowRight size={14} />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map(session => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group flex items-center gap-6 p-6 rounded-3xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] hover:border-white/[0.1] transition-all duration-300"
                      data-testid={`shared-session-${session.id}`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:bg-ns-accent/10 group-hover:border-ns-accent/20 transition-all">
                        <Terminal size={20} className="text-ns-grey-400 group-hover:text-ns-accent transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg text-white font-bold tracking-tight truncate mb-1">{session.title || 'Inbound PCAP Stream'}</h3>
                        <div className="flex items-center gap-4 text-[10px] font-bold text-ns-grey-600 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><Package size={12} />{session.packets || 0} Frames</span>
                          <span className="flex items-center gap-1.5"><Clock size={12} />{formatDate(session.created)}</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Analyzed</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleShareSession(session.id)}
                          className="w-10 h-10 rounded-xl bg-white/5 text-ns-grey-500 hover:text-ns-accent hover:bg-ns-accent/10 transition-all flex items-center justify-center"
                          data-testid={`share-btn-${session.id}`}
                          title="Share Link"
                        >
                          <Share2 size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/session/${session.id}`)}
                          className="px-6 py-2.5 bg-white text-black rounded-xl text-[11px] font-bold hover:bg-ns-grey-100 transition-all flex items-center gap-2 shadow-2xl"
                          data-testid={`join-btn-${session.id}`}
                        >
                          Join Investigation
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        {analytics && (
          <div className="mt-8 space-y-8">
            {/* Summary Stats */}
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-widest opacity-60 mb-6">30-Day Analytics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Sessions', value: analytics.summary.totalSessions, icon: Terminal },
                  { label: 'Packets', value: analytics.summary.totalPackets.toLocaleString(), icon: Package },
                  { label: 'Annotations', value: analytics.summary.totalAnnotations, icon: Users },
                  { label: 'Avg Risk Score', value: (analytics.summary.avgAnomalyScore * 100).toFixed(0) + '%', icon: BarChart3 },
                ].map((stat, i) => (
                  <div key={i} className="ns-glass-dark rounded-3xl border border-white/[0.05] p-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                      <stat.icon size={18} className="text-ns-accent" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white tracking-tight">{stat.value}</p>
                      <p className="text-[10px] font-bold text-ns-grey-600 uppercase tracking-widest">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Score Distribution */}
              <div className="ns-glass-dark rounded-[2.5rem] border border-white/[0.05] p-8">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest opacity-60 mb-6">Risk Distribution</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.scoreDistribution).map(([label, count]) => {
                    const total = Object.values(analytics.scoreDistribution).reduce((a, b) => a + b, 0);
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    const colorMap: Record<string, string> = {
                      clean: 'bg-emerald-500', low: 'bg-ns-teal', medium: 'bg-amber-500', high: 'bg-orange-500', critical: 'bg-red-500',
                    };
                    return (
                      <div key={label} className="flex items-center gap-3">
                        <span className="w-14 text-[10px] font-bold text-ns-grey-500 uppercase tracking-widest capitalize">{label}</span>
                        <div className="flex-1 h-2 rounded-full bg-white/[0.04]">
                          <div className={`h-2 rounded-full ${colorMap[label] ?? 'bg-ns-accent'} transition-all duration-700`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-6 text-right text-[10px] font-bold text-ns-grey-400">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Annotators */}
              <div className="ns-glass-dark rounded-[2.5rem] border border-white/[0.05] p-8">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest opacity-60 mb-6">Top Annotators</h3>
                {analytics.topAnnotators.length === 0 ? (
                  <p className="text-xs text-ns-grey-600 text-center py-8">No annotations in this period</p>
                ) : (
                  <div className="space-y-3">
                    {analytics.topAnnotators.map((a, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                        <div className="w-7 h-7 rounded-full bg-ns-accent/10 border border-ns-accent/20 flex items-center justify-center text-[10px] font-bold text-ns-accent">
                          {i + 1}
                        </div>
                        <span className="flex-1 text-sm font-medium text-ns-grey-200 truncate">{a.name}</span>
                        <span className="text-[11px] font-bold text-ns-grey-500">{a.count} notes</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
