import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, Copy, Eye, EyeOff, Send, AlertTriangle, Webhook } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';

interface WebhookItem {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
  lastTriggered: string | null;
  lastStatus: number | null;
}

interface CreateWebhookResponse {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
  lastTriggered: null;
  lastStatus: null;
  secret: string;
}

const ALL_EVENTS = [
  { value: 'session.created', label: 'Session Created' },
  { value: 'session.deleted', label: 'Session Deleted' },
  { value: 'packet.flagged', label: 'Packet Flagged' },
  { value: 'rule.triggered', label: 'Rule Triggered' },
  { value: 'annotation.created', label: 'Annotation Created' },
];

export default function Webhooks() {
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);

  // New secret reveal state
  const [newSecret, setNewSecret] = useState<{ id: string; secret: string } | null>(null);
  const [secretVisible, setSecretVisible] = useState(false);

  const [form, setForm] = useState({ name: '', url: '', events: [] as string[] });

  const fetchWebhooks = useCallback(async () => {
    try {
      const res = await api.get('/webhooks');
      setWebhooks(res.data);
    } catch {
      toast.error('Failed to load webhooks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWebhooks(); }, [fetchWebhooks]);

  const toggleEvent = (ev: string) => {
    setForm(f => ({
      ...f,
      events: f.events.includes(ev) ? f.events.filter(e => e !== ev) : [...f.events, ev],
    }));
  };

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    if (!form.url.trim()) { toast.error('URL is required'); return; }
    if (form.events.length === 0) { toast.error('Select at least one event'); return; }
    setSubmitting(true);
    try {
      const res = await api.post<CreateWebhookResponse>('/webhooks', form);
      const data = res.data;
      if (data.secret) {
        setNewSecret({ id: data.id, secret: data.secret });
        setSecretVisible(false);
      }
      setWebhooks(prev => [...prev, {
        id: data.id, name: data.name, url: data.url, events: data.events,
        active: data.active, createdAt: data.createdAt, lastTriggered: null, lastStatus: null,
      }]);
      toast.success('Webhook created');
      setShowModal(false);
      setForm({ name: '', url: '', events: [] });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      toast.error(e.response?.data?.detail || 'Failed to create webhook');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (wh: WebhookItem) => {
    try {
      await api.patch(`/webhooks/${wh.id}`, { active: !wh.active });
      setWebhooks(prev => prev.map(w => w.id === wh.id ? { ...w, active: !w.active } : w));
    } catch {
      toast.error('Failed to update webhook');
    }
  };

  const handleDelete = async (wh: WebhookItem) => {
    if (!confirm(`Delete webhook "${wh.name}"?`)) return;
    try {
      await api.delete(`/webhooks/${wh.id}`);
      setWebhooks(prev => prev.filter(w => w.id !== wh.id));
      toast.success('Webhook deleted');
    } catch {
      toast.error('Failed to delete webhook');
    }
  };

  const handleTest = async (wh: WebhookItem) => {
    setTesting(wh.id);
    try {
      await api.post(`/webhooks/${wh.id}/test`);
      toast.success('Test payload sent');
      fetchWebhooks();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      toast.error(e.response?.data?.detail || 'Test failed');
    } finally {
      setTesting(null);
    }
  };

  const copySecret = () => {
    if (!newSecret) return;
    navigator.clipboard.writeText(newSecret.secret).then(() => toast.success('Secret copied to clipboard'));
  };

  return (
    <div className="min-h-screen bg-ns-bg-900 pt-16">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Webhook size={18} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Webhooks</h1>
              <p className="text-sm text-ns-grey-500">Receive real-time event notifications via HTTP POST</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-black rounded-xl text-sm font-bold hover:bg-ns-grey-100 transition-colors"
          >
            <Plus size={14} />
            Add Webhook
          </button>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/15 rounded-xl mb-8">
          <Send size={14} className="text-blue-400 mt-0.5 shrink-0" />
          <p className="text-xs text-ns-grey-400 leading-relaxed">
            All requests are signed with HMAC-SHA256 using your webhook secret. Verify the{' '}
            <code className="text-ns-grey-300 bg-white/[0.06] px-1 rounded">X-Standor-Signature</code>{' '}
            header to authenticate payloads. Secrets are shown only once at creation time.
          </p>
        </div>

        {/* One-time secret reveal */}
        {newSecret && (
          <div className="mb-8 p-5 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle size={16} className="text-yellow-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-yellow-400 mb-1">Save your webhook secret</p>
                <p className="text-xs text-ns-grey-400">This secret will not be shown again. Copy it now and store it securely.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3">
              <code className="flex-1 text-xs font-mono text-white break-all">
                {secretVisible ? newSecret.secret : '•'.repeat(Math.min(newSecret.secret.length, 64))}
              </code>
              <button onClick={() => setSecretVisible(v => !v)} className="p-1.5 text-ns-grey-500 hover:text-white transition-colors shrink-0">
                {secretVisible ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button onClick={copySecret} className="p-1.5 text-ns-grey-500 hover:text-white transition-colors shrink-0">
                <Copy size={14} />
              </button>
            </div>
            <button
              onClick={() => setNewSecret(null)}
              className="mt-3 text-xs text-ns-grey-600 hover:text-ns-grey-400 transition-colors"
            >
              I have saved my secret, dismiss
            </button>
          </div>
        )}

        {/* Webhooks list */}
        {loading ? (
          <div className="flex items-center justify-center h-40 text-ns-grey-500 text-sm">Loading...</div>
        ) : webhooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-ns-grey-500">
            <Webhook size={32} className="mb-4 opacity-30" />
            <p className="text-sm">No webhooks yet. Add one to start receiving event notifications.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {webhooks.map(wh => (
              <div key={wh.id} className={`ns-glass rounded-2xl border p-5 transition-colors ${
                wh.active ? 'border-white/[0.06]' : 'border-white/[0.03] opacity-60'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="font-semibold text-white">{wh.name}</span>
                      {!wh.active && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono border bg-white/[0.04] text-ns-grey-500 border-white/[0.08]">
                          inactive
                        </span>
                      )}
                      {wh.lastStatus && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${
                          wh.lastStatus >= 200 && wh.lastStatus < 300
                            ? 'bg-ns-success/10 text-ns-success border-ns-success/20'
                            : 'bg-ns-danger/10 text-ns-danger border-ns-danger/20'
                        }`}>
                          Last: {wh.lastStatus}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ns-grey-500 font-mono mb-3 truncate max-w-md">{wh.url}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {wh.events.map(ev => (
                        <span key={ev} className="text-[10px] px-2 py-0.5 rounded-full font-mono border bg-white/[0.04] text-ns-grey-400 border-white/[0.08]">
                          {ev}
                        </span>
                      ))}
                    </div>
                    {wh.lastTriggered && (
                      <p className="text-[11px] text-ns-grey-600 mt-2 font-mono">
                        Last triggered: {new Date(wh.lastTriggered).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleTest(wh)}
                      disabled={testing === wh.id}
                      className="text-xs px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.08] text-ns-grey-300 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                      title="Send test payload"
                    >
                      <Send size={11} />
                      {testing === wh.id ? 'Sending...' : 'Test'}
                    </button>
                    <button
                      onClick={() => handleToggle(wh)}
                      className="text-ns-grey-500 hover:text-white transition-colors"
                      title={wh.active ? 'Deactivate' : 'Activate'}
                    >
                      {wh.active ? <ToggleRight size={20} className="text-ns-success" /> : <ToggleLeft size={20} />}
                    </button>
                    <button
                      onClick={() => handleDelete(wh)}
                      className="p-1.5 text-ns-grey-500 hover:text-ns-danger transition-colors"
                      title="Delete webhook"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Webhook Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md ns-glass-dark rounded-2xl border border-white/[0.08] p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-white mb-6">Add Webhook</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] text-ns-grey-500 uppercase tracking-widest font-bold mb-2">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="My webhook"
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white focus:border-ns-accent outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] text-ns-grey-500 uppercase tracking-widest font-bold mb-2">Endpoint URL</label>
                <input
                  type="url"
                  value={form.url}
                  onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                  placeholder="https://your-server.com/webhook"
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white focus:border-ns-accent outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] text-ns-grey-500 uppercase tracking-widest font-bold mb-3">Events</label>
                <div className="space-y-2">
                  {ALL_EVENTS.map(ev => (
                    <button
                      key={ev.value}
                      type="button"
                      onClick={() => toggleEvent(ev.value)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm border transition-all ${
                        form.events.includes(ev.value)
                          ? 'bg-ns-accent/10 border-ns-accent/30 text-white'
                          : 'bg-white/[0.03] border-white/[0.06] text-ns-grey-400 hover:border-white/[0.12] hover:text-white'
                      }`}
                    >
                      <span>{ev.label}</span>
                      <code className="text-[10px] font-mono opacity-60">{ev.value}</code>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowModal(false); setForm({ name: '', url: '', events: [] }); }}
                className="flex-1 px-4 py-2.5 text-sm text-ns-grey-400 hover:text-white transition-colors border border-white/[0.08] rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 text-sm font-bold bg-white text-black rounded-xl hover:bg-ns-grey-100 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Webhook'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
