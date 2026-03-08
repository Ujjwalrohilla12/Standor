import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { toast } from 'sonner';
import { authApi, webauthnApi, WebAuthnCredential, orgsApi, Organization, OrgMember } from '../utils/api';
import { startRegistration } from '@simplewebauthn/browser';
import { Download, Trash2, Loader2, Shield, Lock, ExternalLink, Mail, CheckCircle2, Key, Copy, Plus, Eye, EyeOff, Database, Users, UserPlus, LogOut, Crown } from 'lucide-react';

function SecurityModal({ isOpen, onClose, onVerified, title, description }: { isOpen: boolean; onClose: () => void; onVerified: () => void; title: string; description: string }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.verifyPassword(password);
      onVerified();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-ns-bg-900 border border-white/10 rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white">
            <Lock size={20} />
          </div>
        </div>
        <h3 className="text-xl font-bold text-white text-center mb-2">{title}</h3>
        <p className="text-sm text-neutral-500 text-center mb-8">{description}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            autoFocus
            placeholder="Confirm your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-white/20 transition-all"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-white/[0.04] border border-white/[0.1] text-white rounded-lg text-sm font-medium hover:bg-white/[0.08] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !password}
              className="flex-1 py-3 bg-white text-black rounded-lg text-sm font-bold hover:bg-neutral-200 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { settings, updateSettings, theme, toggleTheme, user, logout } = useStore();
  const [form, setForm] = useState({ ...settings });
  const [saved, setSaved] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaSetup, setMfaSetup] = useState<{ secret: string; qrCodeUrl: string } | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaDisableOpen, setMfaDisableOpen] = useState(false);
  const [mfaDisableCode, setMfaDisableCode] = useState('');
  const [securityModal, setSecurityModal] = useState<{ open: boolean; action: 'mfa' | 'delete' | null }>({ open: false, action: null });
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<{ name: string; key: string } | null>(null);
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [activeSessions, setActiveSessions] = useState<Array<{ userAgent: string; ip: string; lastUsed: string; createdAt: string; isCurrent: boolean }>>([]);
  const [revokingSession, setRevokingSession] = useState<string | null>(null);
  const [passkeys, setPasskeys] = useState<WebAuthnCredential[]>([]);
  const [enrollingPasskey, setEnrollingPasskey] = useState(false);
  const [passkeyName, setPasskeyName] = useState('');
  const [removingPasskey, setRemovingPasskey] = useState<string | null>(null);

  // Change password state
  const [cpCurrent, setCpCurrent] = useState('');
  const [cpNew, setCpNew] = useState('');
  const [cpConfirm, setCpConfirm] = useState('');
  const [cpShowCurrent, setCpShowCurrent] = useState(false);
  const [cpShowNew, setCpShowNew] = useState(false);
  const [cpLoading, setCpLoading] = useState(false);

  // Data governance — seed from user.dataGovernance if present, fall back to localStorage
  const [storeFullPayload, setStoreFullPayload] = useState(
    () => (user as any)?.dataGovernance?.storeFullPayload ?? localStorage.getItem('ns_full_payload') === 'true'
  );
  const [analyticsConsent, setAnalyticsConsent] = useState(
    () => (user as any)?.dataGovernance?.analyticsConsent ?? localStorage.getItem('ns_analytics') !== 'false'
  );
  const [unlinkingGoogle, setUnlinkingGoogle] = useState(false);

  // Organisation state
  const [org, setOrg] = useState<Organization | null>(null);
  const [orgLoading, setOrgLoading] = useState(true);
  const [orgName, setOrgName] = useState('');
  const [orgInviteEmail, setOrgInviteEmail] = useState('');
  const [orgInviteRole, setOrgInviteRole] = useState<'admin' | 'member'>('member');
  const [orgInviteLoading, setOrgInviteLoading] = useState(false);
  const [orgActionLoading, setOrgActionLoading] = useState(false);
  const [orgRetentionDays, setOrgRetentionDays] = useState<string>('');
  const [savingRetention, setSavingRetention] = useState(false);

  useEffect(() => {
    authApi.getAuditLogs().then(setAuditLogs).catch(() => { });
    authApi.listApiKeys().then(setApiKeys).catch(() => { });
    authApi.getSessions().then(setActiveSessions).catch(() => { });
    webauthnApi.getCredentials().then(setPasskeys).catch(() => { });
    orgsApi.getMyOrg().then(o => {
      setOrg(o);
      setOrgName(o.name);
      setOrgRetentionDays(o.retentionDays != null ? String(o.retentionDays) : '');
    }).catch(() => { }).finally(() => setOrgLoading(false));
  }, []);

  const handleCreateOrg = async () => {
    if (orgName.trim().length < 2) { toast.error('Name must be at least 2 characters'); return; }
    setOrgActionLoading(true);
    try {
      const created = await orgsApi.create(orgName.trim());
      setOrg(created);
      toast.success('Organisation created');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to create organisation');
    } finally { setOrgActionLoading(false); }
  };

  const handleInviteMember = async () => {
    if (!orgInviteEmail.includes('@')) { toast.error('Valid email required'); return; }
    setOrgInviteLoading(true);
    try {
      await orgsApi.invite(orgInviteEmail.trim(), orgInviteRole);
      setOrgInviteEmail('');
      toast.success('Invitation sent');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to send invite');
    } finally { setOrgInviteLoading(false); }
  };

  const handleRemoveOrgMember = async (member: OrgMember) => {
    setOrgActionLoading(true);
    try {
      const updated = await orgsApi.removeMember(member.userId);
      setOrg(updated);
      toast.success(`${member.email} removed`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to remove member');
    } finally { setOrgActionLoading(false); }
  };

  const handleLeaveOrg = async () => {
    setOrgActionLoading(true);
    try {
      await orgsApi.leave();
      setOrg(null);
      setOrgName('');
      toast.success('You have left the organisation');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to leave organisation');
    } finally { setOrgActionLoading(false); }
  };

  const handleSaveRetention = async () => {
    const days = orgRetentionDays.trim() === '' ? null : parseInt(orgRetentionDays, 10);
    if (days !== null && (isNaN(days) || days < 1 || days > 3650)) {
      toast.error('Enter a number between 1 and 3650, or leave blank to keep forever');
      return;
    }
    setSavingRetention(true);
    try {
      await orgsApi.setRetention(days);
      if (org) setOrg({ ...org, retentionDays: days });
      toast.success(days ? `Retention set to ${days} days` : 'Sessions will be kept forever');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to update retention');
    } finally { setSavingRetention(false); }
  };

  const handleDeleteOrg = async () => {
    setOrgActionLoading(true);
    try {
      await orgsApi.deleteOrg();
      setOrg(null);
      setOrgName('');
      toast.success('Organisation deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to delete organisation');
    } finally { setOrgActionLoading(false); }
  };

  const handleEnrollPasskey = async () => {
    if (!passkeyName.trim()) { toast.error('Enter a name for this passkey'); return; }
    setEnrollingPasskey(true);
    try {
      const options = await webauthnApi.getRegistrationOptions();
      const response = await startRegistration({ optionsJSON: options });
      await webauthnApi.verifyRegistration(response, passkeyName.trim());
      const updated = await webauthnApi.getCredentials();
      setPasskeys(updated);
      setPasskeyName('');
      toast.success('Passkey enrolled successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || err.message || 'Passkey enrollment failed');
    } finally {
      setEnrollingPasskey(false);
    }
  };

  const handleRemovePasskey = async (credentialId: string) => {
    setRemovingPasskey(credentialId);
    try {
      await webauthnApi.deleteCredential(credentialId);
      setPasskeys(p => p.filter(k => k.credentialId !== credentialId));
      toast.success('Passkey removed');
    } catch {
      toast.error('Failed to remove passkey');
    } finally {
      setRemovingPasskey(null);
    }
  };

  const handleRevokeSession = async (createdAt: string) => {
    setRevokingSession(createdAt);
    try {
      await authApi.revokeSession(createdAt);
      setActiveSessions(s => s.filter(x => x.createdAt !== createdAt));
      toast.success('Session revoked');
    } catch {
      toast.error('Failed to revoke session');
    } finally {
      setRevokingSession(null);
    }
  };

  const handleLogoutEverywhere = async () => {
    try {
      await authApi.logoutEverywhere();
      logout();
      navigate('/login');
      toast.success('All sessions revoked');
    } catch {
      toast.error('Failed to revoke sessions');
    }
  };

  const formatUA = (ua: string) => {
    if (!ua) return 'Unknown device';
    if (/mobile/i.test(ua)) return 'Mobile Browser';
    if (/chrome/i.test(ua)) return 'Chrome';
    if (/firefox/i.test(ua)) return 'Firefox';
    if (/safari/i.test(ua)) return 'Safari';
    if (/edge/i.test(ua)) return 'Edge';
    return 'Browser';
  };

  const handleMfaSetupRequest = () => {
    // If user signed up via Google only, they might not have a password
    // In a real app we'd check if they have a local provider
    setSecurityModal({ open: true, action: 'mfa' });
  };

  const handleMfaSetup = async () => {
    setMfaLoading(true);
    try {
      const res = await authApi.mfaSetup();
      setMfaSetup(res);
    } catch {
      toast.error('Failed to initiate MFA setup');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleMfaEnable = async () => {
    if (!mfaSetup || !mfaCode) return;
    setMfaLoading(true);
    try {
      const res = await authApi.mfaEnable({ secret: mfaSetup.secret, code: mfaCode });
      setMfaSetup(null);
      setMfaCode('');
      if (res.backupCodes?.length) setBackupCodes(res.backupCodes);
      else toast.success('MFA enabled successfully');
      const updatedUser = await authApi.me();
      useStore.setState({ user: updatedUser });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to enable MFA');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    setMfaLoading(true);
    try {
      const res = await authApi.mfaRegenerateBackupCodes();
      setBackupCodes(res.backupCodes);
    } catch {
      toast.error('Failed to regenerate backup codes');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleMfaDisable = async () => {
    if (!mfaDisableCode.trim()) return;
    setMfaLoading(true);
    try {
      await authApi.mfaDisable({ code: mfaDisableCode.trim() });
      toast.success('MFA disabled');
      setMfaDisableOpen(false);
      setMfaDisableCode('');
      const updatedUser = await authApi.me();
      useStore.setState({ user: updatedUser });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Invalid code');
    } finally {
      setMfaLoading(false);
    }
  };

  const downloadBackupCodes = (codes: string[]) => {
    const blob = new Blob([
      'Standor MFA Backup Codes\n',
      'Generated: ' + new Date().toLocaleString() + '\n',
      'Each code can only be used once.\n\n',
      codes.join('\n'),
    ], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'standor-backup-codes.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cpNew !== cpConfirm) { toast.error('New passwords do not match'); return; }
    if (cpNew.length < 12) { toast.error('Password must be at least 12 characters'); return; }
    setCpLoading(true);
    try {
      await authApi.changePassword({ currentPassword: cpCurrent, newPassword: cpNew });
      toast.success('Password updated. Other sessions have been revoked.');
      setCpCurrent(''); setCpNew(''); setCpConfirm('');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to change password');
    } finally {
      setCpLoading(false);
    }
  };

  const handleSave = () => {
    updateSettings(form);
    setSaved(true);
    toast.success('Settings saved');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleGovernanceToggle = async (key: 'storeFullPayload' | 'analyticsConsent', value: boolean) => {
    if (key === 'storeFullPayload') {
      setStoreFullPayload(value);
      localStorage.setItem('ns_full_payload', String(value));
    } else {
      setAnalyticsConsent(value);
      localStorage.setItem('ns_analytics', String(value));
    }
    try {
      await authApi.updateGovernance({ [key]: value });
    } catch {
      // non-fatal — localStorage already updated
    }
  };

  const handleUnlinkGoogle = async () => {
    if (!window.confirm('Disconnect your Google account? You will need your password to sign in.')) return;
    setUnlinkingGoogle(true);
    try {
      await authApi.unlinkProvider('google');
      toast.success('Google account disconnected.');
      const updated = await authApi.me();
      const { setAuth, token: currentToken } = useStore.getState();
      setAuth(updated as any, currentToken || '');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to disconnect Google account');
    } finally {
      setUnlinkingGoogle(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await authApi.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `standor-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch {
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await authApi.deleteAccount();
      logout();
      navigate('/');
      toast.success('Account deleted');
    } catch {
      toast.error('Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newKeyName.length < 3) return toast.error('Name must be at least 3 characters');
    setIsCreatingKey(true);
    try {
      const res = await authApi.createApiKey(newKeyName);
      setGeneratedKey(res);
      setNewKeyName('');
      const updatedKeys = await authApi.listApiKeys();
      setApiKeys(updatedKeys);
      toast.success('API Key created');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to create API key');
    } finally {
      setIsCreatingKey(false);
    }
  };

  const handleRevokeKey = async (name: string) => {
    try {
      await authApi.revokeApiKey(name);
      setApiKeys(apiKeys.filter(k => k.name !== name));
      toast.success('API Key revoked');
    } catch {
      toast.error('Failed to revoke API key');
    }
  };

  return (
    <div className="min-h-screen pt-16 sm:pt-20 px-4 sm:px-6 pb-10 bg-ns-bg-900" data-testid="settings-page">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-2" data-testid="settings-heading">Settings</h1>
        <p className="text-xs sm:text-sm text-neutral-500 mb-6 sm:mb-8">Manage your preferences and privacy.</p>

        {/* Profile */}
        <section className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 sm:p-5 mb-5 sm:mb-6" data-testid="settings-profile">
          <h2 className="text-sm font-semibold text-white mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-neutral-400 mb-1.5">Display Name</label>
              <input
                type="text"
                value={user?.name || ''}
                readOnly
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-neutral-400 outline-none cursor-not-allowed"
                data-testid="settings-name-input"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1.5">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-neutral-400 outline-none cursor-not-allowed"
                data-testid="settings-email-input"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1.5">Email Status</label>
              <div className="flex items-center gap-2">
                {user?.emailVerified ? (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-ns-success uppercase tracking-wider">
                    <CheckCircle2 size={12} /> Verified
                  </span>
                ) : (
                  <button
                    onClick={() => authApi.resendVerification(user?.email || '').then(() => toast.success('Verification link sent'))}
                    className="text-[10px] font-bold text-ns-accent uppercase tracking-wider hover:underline"
                  >
                    Unverified — Resend Link
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Account Linking */}
        <section className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 sm:p-5 mb-5 sm:mb-6">
          <h2 className="text-sm font-semibold text-white mb-4">Linked Accounts</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Mail size={16} className="text-neutral-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-neutral-300 truncate">Email Address</p>
                  <p className="text-xs text-neutral-600 truncate">{user?.email}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-neutral-500 uppercase shrink-0">Primary</span>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-white/[0.04] pt-4">
              <div className="flex items-center gap-3 min-w-0">
                <svg width="16" height="16" viewBox="0 0 48 48" className="shrink-0"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" /><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" /><path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 019.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.97 23.97 0 000 24c0 3.77.9 7.35 2.56 10.53l7.97-5.94z" /><path fill="#34A853" d="M24 48c6.47 0 11.9-2.13 15.87-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.14 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.94C6.51 42.62 14.62 48 24 48z" /></svg>
                <div className="min-w-0">
                  <p className="text-sm text-neutral-300 truncate">Google</p>
                  <p className="text-xs text-neutral-600 truncate">
                    {user?.providers?.some(p => p.provider === 'google') ? 'Account linked' : 'Not connected'}
                  </p>
                </div>
              </div>
              {user?.providers?.some(p => p.provider === 'google') ? (
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-3 shrink-0">
                  <span className="text-[10px] font-bold text-ns-success uppercase">Connected</span>
                  {user?.providers?.some(p => p.provider === 'local') && (
                    <button
                      onClick={handleUnlinkGoogle}
                      disabled={unlinkingGoogle}
                      className="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase tracking-wider transition-colors disabled:opacity-50"
                    >
                      {unlinkingGoogle ? 'Disconnecting…' : 'Disconnect'}
                    </button>
                  )}
                </div>
              ) : (
                <a href={authApi.googleUrl()} className="flex items-center gap-1.5 text-[10px] font-bold text-white uppercase tracking-wider hover:text-ns-accent transition-colors shrink-0">
                  <span className="hidden xs:inline">Link Account</span>
                  <span className="xs:hidden">Link</span>
                  <ExternalLink size={10} />
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Change Password */}
        {user?.providers?.some(p => p.provider === 'local') && (
          <section className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 sm:p-5 mb-5 sm:mb-6">
            <h2 className="text-sm font-semibold text-white mb-4">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div className="relative">
                <input
                  type={cpShowCurrent ? 'text' : 'password'}
                  value={cpCurrent}
                  onChange={e => setCpCurrent(e.target.value)}
                  placeholder="Current password"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white/20 transition-colors pr-10"
                />
                <button type="button" onClick={() => setCpShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition-colors">
                  {cpShowCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <div className="relative">
                <input
                  type={cpShowNew ? 'text' : 'password'}
                  value={cpNew}
                  onChange={e => setCpNew(e.target.value)}
                  placeholder="New password (min. 12 characters)"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white/20 transition-colors pr-10"
                />
                <button type="button" onClick={() => setCpShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition-colors">
                  {cpShowNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <input
                type="password"
                value={cpConfirm}
                onChange={e => setCpConfirm(e.target.value)}
                placeholder="Confirm new password"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white/20 transition-colors"
              />
              <button
                type="submit"
                disabled={cpLoading || !cpCurrent || !cpNew || !cpConfirm}
                className="px-4 py-2 bg-white text-black rounded-lg text-xs font-bold hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {cpLoading ? <Loader2 size={12} className="animate-spin" /> : <Lock size={12} />}
                Update Password
              </button>
            </form>
          </section>
        )}

        {/* Appearance */}
        <section className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 sm:p-5 mb-5 sm:mb-6" data-testid="settings-appearance">
          <h2 className="text-sm font-semibold text-white mb-4">Appearance</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-neutral-300 truncate">Dark Mode</p>
                <p className="text-xs text-neutral-600 truncate">Always dark for now</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${theme === 'dark' ? 'bg-white' : 'bg-neutral-700'}`}
                data-testid="theme-toggle"
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${theme === 'dark' ? 'bg-black left-5' : 'bg-neutral-400 left-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-neutral-300 truncate">Reduced Motion</p>
                <p className="text-xs text-neutral-600 truncate">Minimize animations</p>
              </div>
              <button
                onClick={() => setForm({ ...form, reducedMotion: !form.reducedMotion })}
                className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${form.reducedMotion ? 'bg-white' : 'bg-neutral-700'}`}
                data-testid="reduced-motion-toggle"
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${form.reducedMotion ? 'bg-black left-5' : 'bg-neutral-400 left-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-neutral-300 truncate">High Contrast</p>
                <p className="text-xs text-neutral-600 truncate">Increase text contrast</p>
              </div>
              <button
                onClick={() => setForm({ ...form, highContrast: !form.highContrast })}
                className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${form.highContrast ? 'bg-white' : 'bg-neutral-700'}`}
                data-testid="high-contrast-toggle"
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${form.highContrast ? 'bg-black left-5' : 'bg-neutral-400 left-0.5'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Privacy & Security */}
        <section className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 sm:p-5 mb-5 sm:mb-6" data-testid="settings-privacy">
          <h2 className="text-sm font-semibold text-white mb-4">Privacy & Security</h2>

          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-neutral-300 truncate">Obfuscate Data on Export</p>
                <p className="text-xs text-neutral-600 truncate">Redact IPs and payloads in exported files</p>
              </div>
              <button
                onClick={() => setForm({ ...form, obfuscateData: !form.obfuscateData })}
                className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${form.obfuscateData ? 'bg-white' : 'bg-neutral-700'}`}
                data-testid="obfuscate-toggle"
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${form.obfuscateData ? 'bg-black left-5' : 'bg-neutral-400 left-0.5'}`} />
              </button>
            </div>

            <div className="border-t border-white/[0.04] pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-neutral-300">Two-Factor Authentication (MFA)</p>
                  <p className="text-xs text-neutral-600 mb-4 sm:mb-0">Secure your account with a TOTP authenticator app (like Google Authenticator).</p>
                </div>

                <div className="w-full sm:w-auto shrink-0">
                  {user?.mfaEnabled ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-bold text-green-400 uppercase tracking-wider">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                          Active
                        </div>
                        <button
                          onClick={handleRegenerateBackupCodes}
                          disabled={mfaLoading}
                          className="text-[10px] sm:text-[11px] font-medium text-neutral-500 hover:text-white transition-colors disabled:opacity-50"
                        >
                          {mfaLoading ? <Loader2 size={11} className="animate-spin inline" /> : 'Regenerate backups'}
                        </button>
                        <button
                          onClick={() => { setMfaDisableOpen(v => !v); setMfaDisableCode(''); }}
                          className="text-[10px] sm:text-[11px] font-medium text-red-500 hover:text-red-400 transition-colors"
                        >
                          Disable MFA
                        </button>
                      </div>
                      {mfaDisableOpen && (
                        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 sm:p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                          <p className="text-[11px] sm:text-xs text-neutral-400">Enter your current TOTP code or a backup code to confirm.</p>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={mfaDisableCode}
                              onChange={e => setMfaDisableCode(e.target.value.replace(/[^0-9A-Za-z-]/g, ''))}
                              placeholder="TOTP code"
                              maxLength={9}
                              className="flex-1 w-24 sm:w-auto px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-white outline-none focus:border-red-500/40 font-mono"
                            />
                            <button
                              onClick={handleMfaDisable}
                              disabled={mfaLoading || !mfaDisableCode.trim()}
                              className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-500 disabled:opacity-50 transition-colors shrink-0"
                            >
                              {mfaLoading ? <Loader2 size={12} className="animate-spin" /> : 'Confirm'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : !mfaSetup ? (
                    <button
                      onClick={handleMfaSetupRequest}
                      disabled={mfaLoading}
                      className="w-full sm:w-auto px-4 py-2 bg-white/[0.04] border border-white/[0.1] text-white rounded-lg text-xs font-medium hover:bg-white/[0.08] transition-colors disabled:opacity-50"
                    >
                      {mfaLoading ? <Loader2 size={12} className="animate-spin" /> : 'Set up MFA'}
                    </button>
                  ) : (
                    <div className="space-y-4 bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 sm:p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="bg-white p-2 rounded-lg shrink-0">
                          <img src={mfaSetup.qrCodeUrl} alt="QR Code" className="w-24 h-24 sm:w-32 sm:h-32" />
                        </div>
                        <div className="space-y-2 text-center sm:text-left">
                          <p className="text-[11px] sm:text-xs text-neutral-400">Scan this QR code with your app, or enter the secret manually:</p>
                          <code className="block bg-black px-2 py-1 rounded border border-white/[0.1] text-[10px] text-ns-accent select-all break-all sm:break-normal">{mfaSetup.secret}</code>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="6-digit code"
                          value={mfaCode}
                          onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                          className="flex-1 bg-black border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-ns-accent text-center sm:text-left w-full"
                        />
                        <button
                          onClick={handleMfaEnable}
                          disabled={mfaLoading || mfaCode.length !== 6}
                          className="w-full sm:w-auto px-4 py-2 bg-ns-accent text-white rounded-lg text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
                        >
                          Verify<span className="hidden sm:inline"> & Enable</span>
                        </button>
                        <button
                          onClick={() => setMfaSetup(null)}
                          className="w-full sm:w-auto px-3 py-2 text-xs text-neutral-500 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data Governance */}
        <section className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 sm:p-5 mb-5 sm:mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Database size={14} className="text-neutral-500" />
            <h2 className="text-sm font-semibold text-white">Data Governance</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-neutral-300 truncate">Full Payload Storage</p>
                <p className="text-xs text-neutral-600 truncate">Store complete packet payloads (increases storage usage). Off by default.</p>
              </div>
              <button
                onClick={() => handleGovernanceToggle('storeFullPayload', !storeFullPayload)}
                className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${storeFullPayload ? 'bg-white' : 'bg-neutral-700'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${storeFullPayload ? 'bg-black left-5' : 'bg-neutral-400 left-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between border-t border-white/[0.04] pt-4 gap-4">
              <div className="min-w-0">
                <p className="text-sm text-neutral-300 truncate">Analytics & Telemetry</p>
                <p className="text-xs text-neutral-600 truncate">Privacy-first, anonymous usage analytics. No personal data sent.</p>
              </div>
              <button
                onClick={() => handleGovernanceToggle('analyticsConsent', !analyticsConsent)}
                className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${analyticsConsent ? 'bg-white' : 'bg-neutral-700'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${analyticsConsent ? 'bg-black left-5' : 'bg-neutral-400 left-0.5'}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Save */}
        <button
          onClick={handleSave}
          className="w-full py-3 bg-white text-black rounded-lg font-semibold text-sm hover:bg-neutral-200 transition-colors"
          data-testid="settings-save-btn"
        >
          {saved ? 'Saved!' : 'Save Settings'}
        </button>

        {/* Data & Account */}
        <section className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 sm:p-5 mt-6 sm:mt-8" data-testid="settings-data">
          <h2 className="text-sm font-semibold text-white mb-4">Data & Account</h2>
          <div className="space-y-4">
            <div className="flex flex-row items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-neutral-300 truncate">Export Your Data</p>
                <p className="text-xs text-neutral-600 hidden sm:block truncate">Download all your profile, sessions, and annotations as JSON</p>
              </div>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-white/[0.1] text-neutral-300 rounded-lg text-xs hover:border-white/[0.2] hover:text-white transition-colors disabled:opacity-50 shrink-0"
                data-testid="settings-export-btn"
              >
                {exporting ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                Export
              </button>
            </div>

            <div className="border-t border-white/[0.04] pt-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-red-400 truncate">Delete Account</p>
                  <p className="text-xs text-neutral-600 hidden sm:block truncate">Permanently delete your account and all associated data</p>
                </div>
                {!deleteConfirm ? (
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 border border-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/10 transition-colors shrink-0"
                    data-testid="settings-delete-btn"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                ) : (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setDeleteConfirm(false)}
                      className="flex-1 sm:flex-none px-3 py-1.5 border border-white/[0.1] text-neutral-400 rounded-lg text-xs hover:text-white transition-colors"
                      data-testid="settings-delete-cancel"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setSecurityModal({ open: true, action: 'delete' })}
                      disabled={deleting}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600 transition-colors disabled:opacity-50"
                      data-testid="settings-delete-confirm"
                    >
                      {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      Confirm <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* API Keys */}
        <section className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 sm:p-5 mb-5 sm:mb-6 mt-5 sm:mt-6">
          <h2 className="text-sm font-semibold text-white mb-1">API Keys</h2>
          <p className="text-[11px] sm:text-xs text-neutral-500 mb-4">Manage keys for programmatic access to the Standor API.</p>

          <div className="space-y-4">
            {generatedKey && (
              <div className="bg-ns-accent/10 border border-ns-accent/20 rounded-xl p-3 sm:p-4 mb-4 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-ns-accent uppercase tracking-wider">New Key Created</span>
                  <button onClick={() => setGeneratedKey(null)} className="text-ns-accent hover:text-white transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
                <p className="text-[10px] text-neutral-400 mb-2 sm:mb-3">Copy this key now. For security, we won't show it again.</p>
                <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg p-2 sm:p-3">
                  <code className="flex-1 text-[10px] sm:text-xs text-white break-all font-mono min-w-0">{generatedKey.key}</code>
                  <button
                    onClick={() => { navigator.clipboard.writeText(generatedKey.key); toast.success('Copied to clipboard'); }}
                    className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-neutral-400 hover:text-white shrink-0"
                  >
                    <Copy size={13} className="sm:w-[14px] sm:h-[14px]" />
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleCreateKey} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Key name (e.g. CI/CD)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="flex-1 bg-white/[0.04] border border-white/[0.1] rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-white/20 transition-colors w-full"
              />
              <button
                type="submit"
                disabled={isCreatingKey || newKeyName.length < 3}
                className="px-4 py-2 bg-white text-black rounded-lg text-xs font-bold hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto"
              >
                {isCreatingKey ? <Loader2 size={12} className="animate-spin" /> : <Plus size={14} />}
                Generate
              </button>
            </form>

            <div className="space-y-2 pt-2">
              {apiKeys.length === 0 ? (
                <p className="text-xs text-neutral-600 italic">No active API keys.</p>
              ) : (
                apiKeys.map((key, i) => (
                  <div key={i} className="flex flex-row items-center justify-between py-2 sm:py-2.5 border-b border-white/[0.04] last:border-none gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="p-1.5 bg-white/5 rounded-md text-neutral-400 shrink-0">
                        <Key size={12} className="sm:w-[14px] sm:h-[14px]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-neutral-200 font-medium truncate">{key.name}</p>
                        <p className="text-[9px] sm:text-[10px] text-neutral-600 uppercase truncate">
                          Created {new Date(key.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRevokeKey(key.name)}
                      className="p-1.5 text-neutral-600 hover:text-red-400 transition-colors shrink-0"
                      title="Revoke Key"
                    >
                      <Trash2 size={13} className="sm:w-[14px] sm:h-[14px]" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Passkeys */}
        <section className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 sm:p-5 mb-5 sm:mb-6">
          <h2 className="text-sm font-semibold text-white mb-1">Passkeys</h2>
          <p className="text-[11px] sm:text-xs text-neutral-500 mb-4">Sign in with Face ID, Touch ID, or a hardware security key.</p>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Passkey name (e.g. MacBook Touch ID)"
                value={passkeyName}
                onChange={(e) => setPasskeyName(e.target.value)}
                className="flex-1 bg-white/[0.04] border border-white/[0.1] rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-white/20 transition-colors w-full"
              />
              <button
                onClick={handleEnrollPasskey}
                disabled={enrollingPasskey || passkeyName.trim().length < 2}
                className="px-4 py-2 bg-white text-black rounded-lg text-xs font-bold hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto"
              >
                {enrollingPasskey ? <Loader2 size={12} className="animate-spin" /> : <Plus size={14} />}
                Add Passkey
              </button>
            </div>

            <div className="space-y-2 pt-1">
              {passkeys.length === 0 ? (
                <p className="text-xs text-neutral-600 italic">No passkeys enrolled.</p>
              ) : passkeys.map((pk) => (
                <div key={pk.credentialId} className="flex items-center justify-between py-2 sm:py-2.5 border-b border-white/[0.04] last:border-none gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="p-1.5 bg-white/5 rounded-md text-neutral-400 shrink-0">
                      <Key size={12} className="sm:w-[14px] sm:h-[14px]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-neutral-200 font-medium truncate">{pk.name}</p>
                      <p className="text-[9px] sm:text-[10px] text-neutral-600 uppercase truncate">
                        {pk.deviceType === 'multiDevice' ? 'Synced passkey' : 'Device-bound'} · Added {new Date(pk.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemovePasskey(pk.credentialId)}
                    disabled={removingPasskey === pk.credentialId}
                    className="p-1.5 text-neutral-600 hover:text-red-400 transition-colors disabled:opacity-50 shrink-0"
                    title="Remove passkey"
                  >
                    {removingPasskey === pk.credentialId ? <Loader2 size={13} className="animate-spin sm:w-[14px] sm:h-[14px]" /> : <Trash2 size={13} className="sm:w-[14px] sm:h-[14px]" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enterprise SSO */}
        <section className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 sm:p-5 mb-5 sm:mb-6">
          <div className="flex items-center justify-between mb-4 gap-4">
            <h2 className="text-sm font-semibold text-white truncate">Enterprise SSO</h2>
            <span className="px-2 py-0.5 rounded-full bg-ns-accent/10 border border-ns-accent/20 text-[8px] font-bold text-ns-accent uppercase tracking-widest shrink-0">
              Planned
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl">
            <Shield size={20} className="text-neutral-600 mt-1 shrink-0 hidden sm:block" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 sm:mb-0">
                <Shield size={16} className="text-neutral-600 shrink-0 sm:hidden" />
                <p className="text-sm text-neutral-300 font-medium truncate">SAML & OIDC Support</p>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed mt-1">
                Centralized authentication for teams. Integrate with Okta, Azure AD, or Google Workspace using industry-standard protocols.
              </p>
              <button disabled className="mt-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest cursor-not-allowed">
                Request Early Access
              </button>
            </div>
          </div>
        </section>

        {/* Organisation */}
        <section className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 sm:p-5 mb-5 sm:mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users size={15} className="text-neutral-500 shrink-0" />
            <h2 className="text-sm font-semibold text-white truncate">Organisation</h2>
          </div>

          {orgLoading ? (
            <Loader2 size={16} className="animate-spin text-neutral-600" />
          ) : !org ? (
            /* ── Create org ── */
            <div className="space-y-3">
              <p className="text-xs text-neutral-500">You're not part of an organisation yet. Create one to invite teammates.</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  placeholder="Organisation name"
                  className="flex-1 bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-neutral-700 w-full"
                />
                <button
                  onClick={handleCreateOrg}
                  disabled={orgActionLoading || orgName.trim().length < 2}
                  className="px-4 py-2 bg-white text-black rounded-lg text-xs font-bold hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0 w-full sm:w-auto"
                >
                  {orgActionLoading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={13} />}
                  Create
                </button>
              </div>
            </div>
          ) : (
            /* ── Org management ── */
            <div className="space-y-5">
              /* Name + slug */
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{org.name}</p>
                  <p className="text-[10px] text-neutral-600 font-mono mt-0.5 truncate">/{org.slug}</p>
                </div>
                <span className="text-[9px] font-bold text-ns-accent uppercase tracking-widest px-2 py-0.5 rounded-full bg-ns-accent/10 border border-ns-accent/20 shrink-0">
                  {org.members.find(m => m.userId === user?.id)?.role ?? 'member'}
                </span>
              </div>

              /* Members list */
              <div>
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Members ({org.members.length})</p>
                <div className="space-y-1">
                  {org.members.map(m => (
                    <div key={m.userId} className="flex flex-row items-center justify-between py-2 border-b border-white/[0.04] last:border-none gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {m.role === 'owner' && <Crown size={12} className="text-yellow-500 shrink-0" />}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-neutral-200 truncate">{m.name || m.email}</p>
                          <p className="text-[10px] text-neutral-600 truncate">{m.email} · {m.role}</p>
                        </div>
                      </div>
                      {m.userId !== user?.id && ['owner', 'admin'].includes(org.members.find(x => x.userId === user?.id)?.role ?? '') && m.role !== 'owner' && (
                        <button
                          onClick={() => handleRemoveOrgMember(m)}
                          disabled={orgActionLoading}
                          className="p-1.5 text-neutral-600 hover:text-red-400 transition-colors disabled:opacity-50 shrink-0"
                          title="Remove member"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              /* Pending invites */
              {org.invites.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Pending Invites ({org.invites.length})</p>
                  {org.invites.map(inv => (
                    <div key={inv.id} className="flex items-center gap-2 py-1.5 text-xs text-neutral-500 min-w-0">
                      <Mail size={12} className="shrink-0" />
                      <span className="truncate">{inv.email}</span>
                      <span className="text-[10px] text-neutral-700 shrink-0">({inv.role})</span>
                    </div>
                  ))}
                </div>
              )}

              /* Invite form (owner/admin only) */
              {['owner', 'admin'].includes(org.members.find(m => m.userId === user?.id)?.role ?? '') && (
                <div className="pt-3 border-t border-white/[0.04]">
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">Invite Member</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      value={orgInviteEmail}
                      onChange={e => setOrgInviteEmail(e.target.value)}
                      placeholder="colleague@example.com"
                      className="flex-1 bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-neutral-700 w-full"
                    />
                    <div className="flex gap-2 w-full sm:w-auto">
                      <select
                        value={orgInviteRole}
                        onChange={e => setOrgInviteRole(e.target.value as 'admin' | 'member')}
                        className="flex-1 sm:flex-none bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/20 transition-all"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        onClick={handleInviteMember}
                        disabled={orgInviteLoading || !orgInviteEmail.includes('@')}
                        className="px-4 py-2 bg-white text-black rounded-lg text-xs font-bold hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0"
                      >
                        {orgInviteLoading ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={13} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              /* Data Retention */
              {(org.ownerId === user?.id || org.members.find(m => m.userId === user?.id)?.role === 'admin') && (
                <div className="pt-3 border-t border-white/[0.04]">
                  <p className="text-xs font-semibold text-white mb-1">Data Retention</p>
                  <p className="text-[11px] text-neutral-500 mb-3">
                    Sessions older than this will be automatically purged. Leave blank to keep sessions indefinitely.
                  </p>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="flex gap-2 flex-1 sm:flex-none">
                      <input
                        type="number"
                        min={1}
                        max={3650}
                        value={orgRetentionDays}
                        onChange={e => setOrgRetentionDays(e.target.value)}
                        placeholder="Days (blank = forever)"
                        className="w-full sm:w-44 px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-neutral-600 focus:border-white/20 outline-none transition-colors max-w-none"
                      />
                      <button
                        onClick={handleSaveRetention}
                        disabled={savingRetention}
                        className="px-4 py-2 bg-white text-black rounded-lg text-xs font-bold hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0"
                      >
                        {savingRetention ? <Loader2 size={12} className="animate-spin" /> : <Database size={12} />}
                        Save
                      </button>
                    </div>
                    {org.retentionDays != null && (
                      <span className="text-[11px] text-neutral-500 text-center sm:text-left">Currently: {org.retentionDays} days</span>
                    )}
                  </div>
                </div>
              )}

              /* Leave / delete */
              <div className="pt-3 border-t border-white/[0.04] flex flex-col sm:flex-row gap-3">
                {org.ownerId !== user?.id ? (
                  <button
                    onClick={handleLeaveOrg}
                    disabled={orgActionLoading}
                    className="flex justify-center sm:justify-start items-center gap-1.5 text-xs text-neutral-500 hover:text-red-400 transition-colors disabled:opacity-50 w-full sm:w-auto"
                  >
                    <LogOut size={13} /> Leave organisation
                  </button>
                ) : (
                  <button
                    onClick={handleDeleteOrg}
                    disabled={orgActionLoading}
                    className="flex justify-center sm:justify-start items-center gap-1.5 text-xs text-neutral-500 hover:text-red-400 transition-colors disabled:opacity-50 w-full sm:w-auto"
                  >
                    <Trash2 size={13} /> Delete organisation
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Active Sessions */}
        <section className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 sm:p-5 mb-5 sm:mb-6">
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-white truncate">Active Sessions</h2>
              <p className="text-[11px] sm:text-xs text-neutral-500 mt-0.5 truncate">Devices currently signed in to your account.</p>
            </div>
            {activeSessions.length > 1 && (
              <button
                onClick={handleLogoutEverywhere}
                className="text-[10px] font-bold text-red-400 uppercase tracking-wider hover:text-red-300 transition-colors shrink-0"
              >
                Revoke All
              </button>
            )}
          </div>
          <div className="space-y-2">
            {activeSessions.length === 0 ? (
              <p className="text-xs text-neutral-600 italic">No active sessions found.</p>
            ) : activeSessions.map((s, i) => (
              <div key={i} className="flex flex-row items-center justify-between py-2 sm:py-2.5 border-b border-white/[0.04] last:border-none gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${s.isCurrent ? 'bg-green-400' : 'bg-neutral-600'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-neutral-200 font-medium flex items-center gap-2 truncate">
                      <span className="truncate">{formatUA(s.userAgent)}</span>
                      {s.isCurrent && <span className="text-[9px] font-bold text-green-400 uppercase tracking-wider shrink-0">Current</span>}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-neutral-600 font-mono truncate">
                      {s.ip || 'Unknown IP'} · Last active {new Date(s.lastUsed).toLocaleString()}
                    </p>
                  </div>
                </div>
                {!s.isCurrent && (
                  <button
                    onClick={() => handleRevokeSession(s.createdAt)}
                    disabled={revokingSession === s.createdAt}
                    className="p-1.5 text-neutral-600 hover:text-red-400 transition-colors disabled:opacity-50 shrink-0"
                    title="Revoke this session"
                  >
                    {revokingSession === s.createdAt ? <Loader2 size={13} className="animate-spin sm:w-[14px] sm:h-[14px]" /> : <Trash2 size={13} className="sm:w-[14px] sm:h-[14px]" />}
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Audit Log */}
        <section className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 sm:p-5 mb-5 sm:mb-6">
          <h2 className="text-sm font-semibold text-white mb-4">Security Audit Log</h2>
          <div className="space-y-3">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-neutral-600 italic">No recent activity detected.</p>
            ) : (
              auditLogs.slice(0, 5).map((log, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-none gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${log.status === 'success' ? 'bg-ns-success' : 'bg-ns-error'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-neutral-300 font-medium truncate">{log.action}</p>
                      <p className="text-[9px] sm:text-[10px] text-neutral-600 font-mono uppercase truncate">
                        {new Date(log.createdAt).toLocaleString()} • {log.ip || 'Local'}
                      </p>
                    </div>
                  </div>
                  <Shield size={14} className="text-neutral-700 shrink-0 hidden sm:block" />
                </div>
              ))
            )}
            {auditLogs.length > 5 && (
              <p className="text-[10px] text-neutral-600 text-center pt-2">Showing last 5 events</p>
            )}
          </div>
        </section>

        {/* Backup codes modal */}
        {backupCodes && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-ns-bg-900 border border-white/10 rounded-2xl p-5 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-2 gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white truncate">Save your backup codes</h3>
                <Shield size={16} className="text-ns-accent shrink-0 sm:w-[18px] sm:h-[18px]" />
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-500 mb-6">
                Each code can only be used once. Store these somewhere safe — you won't see them again.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6 font-mono text-xs sm:text-sm">
                {backupCodes.map(code => (
                  <div key={code} className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-center tracking-wider">
                    {code}
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => { navigator.clipboard.writeText(backupCodes.join('\n')); toast.success('Codes copied'); }}
                  className="w-full sm:flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-2.5 border border-white/10 text-white rounded-lg text-xs sm:text-sm hover:bg-white/5 transition-colors"
                >
                  <Copy size={14} /> Copy all
                </button>
                <button
                  onClick={() => downloadBackupCodes(backupCodes)}
                  className="w-full sm:flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-2.5 border border-white/10 text-white rounded-lg text-xs sm:text-sm hover:bg-white/5 transition-colors"
                >
                  <Download size={14} /> Download
                </button>
                <button
                  onClick={() => { setBackupCodes(null); toast.success('MFA enabled — backup codes saved'); }}
                  className="w-full sm:flex-1 py-2 sm:py-2.5 bg-white text-black rounded-lg text-xs sm:text-sm font-bold hover:bg-neutral-200 transition-colors mt-2 sm:mt-0"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        <SecurityModal
          isOpen={securityModal.open}
          onClose={() => setSecurityModal({ open: false, action: null })}
          onVerified={() => {
            if (securityModal.action === 'mfa') handleMfaSetup();
            if (securityModal.action === 'delete') handleDelete();
          }}
          title={securityModal.action === 'mfa' ? 'Verify identity' : 'Dangerous Operation'}
          description={securityModal.action === 'mfa'
            ? 'Confirm your password to set up MFA.'
            : 'Confirm your password to permanently delete your account.'
          }
        />
      </div>
    </div >
  );
}
