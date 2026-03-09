import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Activity, Trash2, Lock, Unlock, Search, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight, Plus, Flag } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';
import useStore from '../store/useStore';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
  createdAt: string;
  isLocked: boolean;
  emailVerified: boolean;
}

interface AuditEntry {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  category: string;
  status: string;
  ip: string;
  createdAt: string;
}

interface AdminStats {
  totalUsers: number;
  verifiedUsers: number;
  adminUsers: number;
  totalInterviewSessions: number;
  totalCodeExecutions: number;
}

interface FlagItem {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercent: number;
  createdAt: string;
}

const TABS = ['Users', 'Audit Log', 'Statistics', 'Feature Flags'] as const;
type Tab = typeof TABS[number];

export default function Admin() {
  const navigate = useNavigate();
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState<Tab>('Users');

  // Users state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Edit roles modal
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [rolesInput, setRolesInput] = useState('');
  const [savingRoles, setSavingRoles] = useState(false);

  // Audit log state
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotal, setAuditTotal] = useState(0);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Stats
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Feature flags
  const [flags, setFlags] = useState<FlagItem[]>([]);
  const [loadingFlags, setLoadingFlags] = useState(false);
  const [newFlagKey, setNewFlagKey] = useState('');
  const [newFlagName, setNewFlagName] = useState('');
  const [newFlagDesc, setNewFlagDesc] = useState('');
  const [creatingFlag, setCreatingFlag] = useState(false);

  // Guard: only admins
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get('/admin/users', {
        params: { page: userPage, limit: 50, search: userSearch || undefined },
      });
      setUsers(res.data.users ?? res.data);
      setUserTotal(res.data.total ?? res.data.length);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  }, [userPage, userSearch]);

  const fetchAudit = useCallback(async () => {
    setLoadingAudit(true);
    try {
      const res = await api.get('/admin/audit-log', {
        params: { page: auditPage, limit: 100 },
      });
      setAuditLog(res.data.entries ?? res.data);
      setAuditTotal(res.data.total ?? res.data.length);
    } catch {
      toast.error('Failed to load audit log');
    } finally {
      setLoadingAudit(false);
    }
  }, [auditPage]);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch {
      toast.error('Failed to load statistics');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchFlags = useCallback(async () => {
    setLoadingFlags(true);
    try {
      const res = await api.get('/admin/flags');
      setFlags(res.data);
    } catch {
      toast.error('Failed to load feature flags');
    } finally {
      setLoadingFlags(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'Users') fetchUsers();
    else if (activeTab === 'Audit Log') fetchAudit();
    else if (activeTab === 'Statistics') fetchStats();
    else if (activeTab === 'Feature Flags') fetchFlags();
  }, [activeTab, fetchUsers, fetchAudit, fetchStats, fetchFlags]);

  const handleLockToggle = async (u: AdminUser) => {
    try {
      await api.patch(`/admin/users/${u.id}`, { isLocked: !u.isLocked });
      toast.success(u.isLocked ? 'User unlocked' : 'User locked for 24h');
      fetchUsers();
    } catch {
      toast.error('Failed to update user');
    }
  };

  const handleDelete = async (u: AdminUser) => {
    if (!confirm(`Delete ${u.email}? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${u.id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const handleSaveRoles = async () => {
    if (!editTarget) return;
    setSavingRoles(true);
    try {
      const roles = rolesInput.split(',').map(r => r.trim()).filter(Boolean);
      await api.patch(`/admin/users/${editTarget.id}`, { roles });
      toast.success('Roles updated');
      setEditTarget(null);
      fetchUsers();
    } catch {
      toast.error('Failed to update roles');
    } finally {
      setSavingRoles(false);
    }
  };

  const handleToggleFlag = async (flag: FlagItem) => {
    try {
      await api.patch(`/admin/flags/${flag.key}`, { enabled: !flag.enabled });
      setFlags(prev => prev.map(f => f.key === flag.key ? { ...f, enabled: !f.enabled } : f));
    } catch {
      toast.error('Failed to update flag');
    }
  };

  const handleDeleteFlag = async (key: string) => {
    if (!confirm(`Delete flag "${key}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/flags/${key}`);
      setFlags(prev => prev.filter(f => f.key !== key));
      toast.success('Flag deleted');
    } catch {
      toast.error('Failed to delete flag');
    }
  };

  const handleCreateFlag = async () => {
    if (!newFlagKey.trim() || !newFlagName.trim()) {
      toast.error('Key and name are required');
      return;
    }
    setCreatingFlag(true);
    try {
      const res = await api.post('/admin/flags', {
        key: newFlagKey.trim().toLowerCase().replace(/\s+/g, '_'),
        name: newFlagName.trim(),
        description: newFlagDesc.trim(),
        enabled: false,
        rolloutPercent: 100,
      });
      setFlags(prev => [...prev, res.data]);
      setNewFlagKey(''); setNewFlagName(''); setNewFlagDesc('');
      toast.success('Flag created');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to create flag');
    } finally {
      setCreatingFlag(false);
    }
  };

  const totalUserPages = Math.max(1, Math.ceil(userTotal / 50));
  const totalAuditPages = Math.max(1, Math.ceil(auditTotal / 100));

  return (
    <div className="min-h-screen bg-ns-bg-900 pt-16 sm:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="w-10 h-10 rounded-xl bg-ns-accent/10 border border-ns-accent/20 flex items-center justify-center shrink-0">
            <Shield size={18} className="text-ns-accent" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">Standor Administration</h1>
            <p className="text-xs sm:text-sm text-ns-grey-500 truncate">Manage users, interview sessions, platform analytics, and feature rollouts</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl mb-6 sm:mb-8 w-full sm:w-fit">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${activeTab === tab ? 'bg-white/[0.08] text-white' : 'text-neutral-500 hover:text-white'
                }`}
            >
              {tab === 'Users' && <Users size={14} className="shrink-0" />}
              {tab === 'Audit Log' && <Activity size={14} className="shrink-0" />}
              {tab === 'Statistics' && <Shield size={14} className="shrink-0" />}
              {tab === 'Feature Flags' && <Flag size={14} className="shrink-0" />}
              {tab}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {activeTab === 'Users' && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
              <div className="relative w-full sm:flex-1 sm:max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ns-grey-500" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={e => { setUserSearch(e.target.value); setUserPage(1); }}
                  placeholder="Search by email or name..."
                  className="w-full pl-9 pr-4 py-2 sm:py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-ns-grey-600 focus:border-ns-accent outline-none transition-colors"
                />
              </div>
              <span className="text-xs sm:text-sm text-ns-grey-500 font-mono self-end sm:self-auto">{userTotal} registered developers</span>
            </div>

            <div className="ns-glass rounded-2xl border border-white/[0.06] overflow-x-auto">
              {loadingUsers ? (
                <div className="flex items-center justify-center h-40 text-ns-grey-500 text-sm">Loading...</div>
              ) : users.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-ns-grey-500 text-sm">No users found</div>
              ) : (
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-white/[0.05]">
                      <th className="text-left text-[10px] font-bold text-ns-grey-600 uppercase tracking-widest px-4 sm:px-6 py-3 sm:py-4">User</th>
                      <th className="text-left text-[10px] font-bold text-ns-grey-600 uppercase tracking-widest px-4 sm:px-6 py-3 sm:py-4">Roles</th>
                      <th className="text-left text-[10px] font-bold text-ns-grey-600 uppercase tracking-widest px-4 sm:px-6 py-3 sm:py-4">Joined</th>
                      <th className="text-left text-[10px] font-bold text-ns-grey-600 uppercase tracking-widest px-4 sm:px-6 py-3 sm:py-4">Status</th>
                      <th className="text-right text-[10px] font-bold text-ns-grey-600 uppercase tracking-widest px-4 sm:px-6 py-3 sm:py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="font-medium text-white text-xs sm:text-sm truncate max-w-[150px] sm:max-w-none">{u.name || '—'}</div>
                          <div className="text-[10px] sm:text-xs text-ns-grey-500 font-mono truncate max-w-[150px] sm:max-w-none">{u.email}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="flex flex-wrap gap-1">
                            {(u.roles || ['user']).map(r => (
                              <span key={r} className={`text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-mono border ${r === 'admin' ? 'bg-ns-accent/10 text-ns-accent border-ns-accent/20' : 'bg-white/[0.04] text-ns-grey-400 border-white/[0.08]'
                                }`}>{r}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-xs text-ns-grey-500 font-mono">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${u.isLocked ? 'bg-ns-danger' : u.emailVerified ? 'bg-ns-success' : 'bg-yellow-400'}`} />
                            <span className="text-[11px] sm:text-xs text-ns-grey-500">
                              {u.isLocked ? 'Locked' : u.emailVerified ? 'Active' : 'Unverified'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center justify-end gap-1 sm:gap-2">
                            <button
                              onClick={() => { setEditTarget(u); setRolesInput((u.roles || ['user']).join(', ')); }}
                              className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 bg-white/[0.05] hover:bg-white/[0.08] text-ns-grey-300 rounded-lg transition-colors"
                            >
                              Edit Roles
                            </button>
                            <button
                              onClick={() => handleLockToggle(u)}
                              className="p-1 sm:p-1.5 text-ns-grey-500 hover:text-white transition-colors"
                              title={u.isLocked ? 'Unlock user' : 'Lock user 24h'}
                            >
                              {u.isLocked ? <Unlock size={13} className="sm:w-[14px] sm:h-[14px]" /> : <Lock size={13} className="sm:w-[14px] sm:h-[14px]" />}
                            </button>
                            <button
                              onClick={() => handleDelete(u)}
                              className="p-1 sm:p-1.5 text-ns-grey-500 hover:text-ns-danger transition-colors"
                              title="Delete user"
                            >
                              <Trash2 size={13} className="sm:w-[14px] sm:h-[14px]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {totalUserPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-4 sm:mt-6">
                <button
                  onClick={() => setUserPage(p => Math.max(1, p - 1))}
                  disabled={userPage === 1}
                  className="p-1 sm:p-2 text-ns-grey-500 hover:text-white disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs sm:text-sm text-ns-grey-500 font-mono">{userPage} / {totalUserPages}</span>
                <button
                  onClick={() => setUserPage(p => Math.min(totalUserPages, p + 1))}
                  disabled={userPage === totalUserPages}
                  className="p-1 sm:p-2 text-ns-grey-500 hover:text-white disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Audit Log Tab */}
        {activeTab === 'Audit Log' && (
          <div>
            <div className="ns-glass rounded-2xl border border-white/[0.06] overflow-x-auto">
              {loadingAudit ? (
                <div className="flex items-center justify-center h-40 text-ns-grey-500 text-sm">Loading...</div>
              ) : auditLog.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-ns-grey-500 text-sm">No audit entries found</div>
              ) : (
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-white/[0.05]">
                      <th className="text-left text-[10px] font-bold text-ns-grey-600 uppercase tracking-widest px-4 sm:px-6 py-3 sm:py-4">Time</th>
                      <th className="text-left text-[10px] font-bold text-ns-grey-600 uppercase tracking-widest px-4 sm:px-6 py-3 sm:py-4">User</th>
                      <th className="text-left text-[10px] font-bold text-ns-grey-600 uppercase tracking-widest px-4 sm:px-6 py-3 sm:py-4">Action</th>
                      <th className="text-left text-[10px] font-bold text-ns-grey-600 uppercase tracking-widest px-4 sm:px-6 py-3 sm:py-4">Category</th>
                      <th className="text-left text-[10px] font-bold text-ns-grey-600 uppercase tracking-widest px-4 sm:px-6 py-3 sm:py-4">Status</th>
                      <th className="text-left text-[10px] font-bold text-ns-grey-600 uppercase tracking-widest px-4 sm:px-6 py-3 sm:py-4">IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLog.map(entry => (
                      <tr key={entry.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 sm:px-6 py-3 text-[10px] sm:text-[11px] text-ns-grey-500 font-mono whitespace-nowrap">
                          {new Date(entry.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-[11px] sm:text-xs text-ns-grey-400 font-mono truncate max-w-[150px]">{entry.userEmail || '—'}</td>
                        <td className="px-4 sm:px-6 py-3 text-[11px] sm:text-xs text-white max-w-[200px] truncate">{entry.action}</td>
                        <td className="px-4 sm:px-6 py-3">
                          <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-ns-grey-400 border border-white/[0.08] font-mono">
                            {entry.category}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <span className={`text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-mono border whitespace-nowrap ${entry.status === 'success'
                              ? 'bg-ns-success/10 text-ns-success border-ns-success/20'
                              : entry.status === 'failure'
                                ? 'bg-ns-danger/10 text-ns-danger border-ns-danger/20'
                                : 'bg-white/[0.04] text-ns-grey-400 border-white/[0.08]'
                            }`}>{entry.status}</span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-[10px] sm:text-[11px] text-ns-grey-600 font-mono">{entry.ip || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {totalAuditPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-4 sm:mt-6">
                <button
                  onClick={() => setAuditPage(p => Math.max(1, p - 1))}
                  disabled={auditPage === 1}
                  className="p-1 sm:p-2 text-ns-grey-500 hover:text-white disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs sm:text-sm text-ns-grey-500 font-mono">{auditPage} / {totalAuditPages}</span>
                <button
                  onClick={() => setAuditPage(p => Math.min(totalAuditPages, p + 1))}
                  disabled={auditPage === totalAuditPages}
                  className="p-1 sm:p-2 text-ns-grey-500 hover:text-white disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'Statistics' && (
          <div>
            {loadingStats ? (
              <div className="flex items-center justify-center h-40 text-ns-grey-500 text-sm">Loading...</div>
            ) : !stats ? (
              <div className="flex items-center justify-center h-40 text-ns-grey-500 text-sm">No statistics available</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {[
                  { label: 'Total Users', value: stats.totalUsers, color: 'text-white' },
                  { label: 'Verified Developers', value: stats.verifiedUsers, color: 'text-ns-success' },
                  { label: 'Admin Accounts', value: stats.adminUsers, color: 'text-ns-accent' },
                  { label: 'Interview Sessions', value: stats.totalInterviewSessions, color: 'text-white' },
                  { label: 'Code Executions', value: stats.totalCodeExecutions?.toLocaleString(), color: 'text-white' },
                ].map(stat => (
                  <div key={stat.label} className="ns-glass rounded-2xl border border-white/[0.06] p-4 sm:p-6">
                    <div className={`text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 truncate ${stat.color}`}>{stat.value ?? '—'}</div>
                    <div className="text-[10px] sm:text-xs text-ns-grey-500 uppercase tracking-widest font-bold truncate">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Feature Flags Tab */}
        {activeTab === 'Feature Flags' && (
          <div>
            {/* Create new flag */}
            <div className="ns-glass rounded-2xl border border-white/[0.06] p-4 sm:p-6 mb-4 sm:mb-6">
              <h3 className="text-xs sm:text-sm font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                <Plus size={14} /> New Feature Flag
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-3">
                <input
                  type="text"
                  value={newFlagKey}
                  onChange={e => setNewFlagKey(e.target.value)}
                  placeholder="key (e.g. ai_code_evaluation)"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs sm:text-sm text-white placeholder:text-ns-grey-600 focus:border-ns-accent outline-none transition-colors font-mono"
                />
                <input
                  type="text"
                  value={newFlagName}
                  onChange={e => setNewFlagName(e.target.value)}
                  placeholder="Display name"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs sm:text-sm text-white placeholder:text-ns-grey-600 focus:border-ns-accent outline-none transition-colors"
                />
                <input
                  type="text"
                  value={newFlagDesc}
                  onChange={e => setNewFlagDesc(e.target.value)}
                  placeholder="Description (optional)"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs sm:text-sm text-white placeholder:text-ns-grey-600 focus:border-ns-accent outline-none transition-colors"
                />
              </div>
              <button
                onClick={handleCreateFlag}
                disabled={creatingFlag}
                className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 bg-white text-black rounded-xl text-xs sm:text-sm font-bold hover:bg-ns-grey-100 transition-colors disabled:opacity-50"
              >
                {creatingFlag ? 'Creating...' : 'Create Flag'}
              </button>
            </div>

            {/* Flag list */}
            <div className="ns-glass rounded-2xl border border-white/[0.06] overflow-x-auto">
              {loadingFlags ? (
                <div className="flex items-center justify-center h-40 text-ns-grey-500 text-sm">Loading...</div>
              ) : flags.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-ns-grey-500 text-sm">No feature flags yet</div>
              ) : (
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/[0.05]">
                      <th className="text-left text-[10px] font-bold text-ns-grey-600 uppercase tracking-widest px-4 sm:px-6 py-3 sm:py-4">Key</th>
                      <th className="text-left text-[10px] font-bold text-ns-grey-600 uppercase tracking-widest px-4 sm:px-6 py-3 sm:py-4">Name</th>
                      <th className="text-left text-[10px] font-bold text-ns-grey-600 uppercase tracking-widest px-4 sm:px-6 py-3 sm:py-4">Description</th>
                      <th className="text-left text-[10px] font-bold text-ns-grey-600 uppercase tracking-widest px-4 sm:px-6 py-3 sm:py-4">Rollout</th>
                      <th className="text-left text-[10px] font-bold text-ns-grey-600 uppercase tracking-widest px-4 sm:px-6 py-3 sm:py-4">Enabled</th>
                      <th className="text-right text-[10px] font-bold text-ns-grey-600 uppercase tracking-widest px-4 sm:px-6 py-3 sm:py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flags.map(flag => (
                      <tr key={flag.key} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-xs text-ns-grey-400 font-mono">{flag.key}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-white max-w-[150px] truncate">{flag.name}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-xs text-ns-grey-500 max-w-[200px] sm:max-w-xs truncate">{flag.description || '—'}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-xs text-ns-grey-400 font-mono">{flag.rolloutPercent}%</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <button
                            onClick={() => handleToggleFlag(flag)}
                            className={`transition-colors ${flag.enabled ? 'text-ns-success' : 'text-ns-grey-600 hover:text-ns-grey-400'}`}
                            title={flag.enabled ? 'Disable flag' : 'Enable flag'}
                          >
                            {flag.enabled ? <ToggleRight size={20} className="sm:w-[22px] sm:h-[22px]" /> : <ToggleLeft size={20} className="sm:w-[22px] sm:h-[22px]" />}
                          </button>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center justify-end">
                            <button
                              onClick={() => handleDeleteFlag(flag.key)}
                              className="p-1 sm:p-1.5 text-ns-grey-500 hover:text-ns-danger transition-colors"
                              title="Delete flag"
                            >
                              <Trash2 size={13} className="sm:w-[14px] sm:h-[14px]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Edit Roles Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm ns-glass-dark rounded-2xl border border-white/[0.08] p-5 sm:p-6">
            <h3 className="font-bold text-sm sm:text-base text-white mb-1">Edit Roles</h3>
            <p className="text-[11px] sm:text-xs text-ns-grey-500 mb-4 sm:mb-5 font-mono truncate">{editTarget.email}</p>
            <input
              type="text"
              value={rolesInput}
              onChange={e => setRolesInput(e.target.value)}
              placeholder="user, admin"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs sm:text-sm text-white focus:border-ns-accent outline-none transition-colors mb-3 sm:mb-4"
            />
            <p className="text-[10px] sm:text-[11px] text-ns-grey-600 mb-4 sm:mb-5 leading-relaxed">Comma-separated list of roles (e.g. user, admin)</p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setEditTarget(null)}
                className="w-full sm:flex-1 px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-ns-grey-400 hover:text-white transition-colors border border-white/[0.08] rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRoles}
                disabled={savingRoles}
                className="w-full sm:flex-1 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold bg-white text-black rounded-xl hover:bg-ns-grey-100 transition-colors disabled:opacity-50"
              >
                {savingRoles ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
