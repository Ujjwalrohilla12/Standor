import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, AlertTriangle, Zap, Webhook } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';

interface PolicyRule {
  id: string;
  name: string;
  field: string;
  operator: string;
  value: string;
  action: 'flag' | 'webhook' | 'both';
  webhookId: string | null;
  enabled: boolean;
  createdAt: string;
  triggerCount: number;
}

interface WebhookItem {
  id: string;
  name: string;
}

const FIELDS = ['entropy', 'size', 'protocol', 'src', 'dst', 'srcPort', 'dstPort', 'flags'];
const OPERATORS = ['gt', 'lt', 'gte', 'lte', 'eq', 'neq', 'contains', 'not_contains'];
const ACTIONS = ['flag', 'webhook', 'both'] as const;

const OPERATOR_LABELS: Record<string, string> = {
  gt: '> greater than', lt: '< less than', gte: '>= greater or equal', lte: '<= less or equal',
  eq: '= equals', neq: '!= not equals', contains: 'contains', not_contains: 'not contains',
};

const FIELD_PLACEHOLDERS: Record<string, string> = {
  entropy: '0.7 (0-1 scale)', size: '1500 (bytes)', protocol: 'TCP',
  src: '192.168.1.1', dst: '10.0.0.1', srcPort: '443', dstPort: '53', flags: 'SYN',
};

const ACTION_COLORS: Record<string, string> = {
  flag: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  webhook: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  both: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

export default function Rules() {
  const [rules, setRules] = useState<PolicyRule[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '', field: 'entropy', operator: 'gt', value: '', action: 'flag' as 'flag' | 'webhook' | 'both', webhookId: '',
  });

  const fetchRules = useCallback(async () => {
    try {
      const res = await api.get('/rules');
      setRules(res.data);
    } catch {
      toast.error('Failed to load rules');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWebhooks = useCallback(async () => {
    try {
      const res = await api.get('/webhooks');
      setWebhooks(res.data);
    } catch {
      // webhooks optional
    }
  }, []);

  useEffect(() => {
    fetchRules();
    fetchWebhooks();
  }, [fetchRules, fetchWebhooks]);

  const handleToggle = async (rule: PolicyRule) => {
    try {
      await api.patch(`/rules/${rule.id}`, { enabled: !rule.enabled });
      setRules(prev => prev.map(r => r.id === rule.id ? { ...r, enabled: !r.enabled } : r));
    } catch {
      toast.error('Failed to update rule');
    }
  };

  const handleDelete = async (rule: PolicyRule) => {
    if (!confirm(`Delete rule "${rule.name}"?`)) return;
    try {
      await api.delete(`/rules/${rule.id}`);
      setRules(prev => prev.filter(r => r.id !== rule.id));
      toast.success('Rule deleted');
    } catch {
      toast.error('Failed to delete rule');
    }
  };

  const handleCreate = async () => {
    if (!form.name.trim() || !form.value.trim()) {
      toast.error('Name and value are required');
      return;
    }
    if ((form.action === 'webhook' || form.action === 'both') && !form.webhookId) {
      toast.error('Select a webhook for this action');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/rules', {
        name: form.name, field: form.field, operator: form.operator,
        value: form.value, action: form.action,
        webhookId: form.webhookId || undefined,
      });
      setRules(prev => [...prev, res.data]);
      toast.success('Rule created');
      setShowModal(false);
      setForm({ name: '', field: 'entropy', operator: 'gt', value: '', action: 'flag', webhookId: '' });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      toast.error(e.response?.data?.detail || 'Failed to create rule');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ns-bg-900 pt-16">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <AlertTriangle size={18} className="text-yellow-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Policy Rules</h1>
              <p className="text-sm text-ns-grey-500">Flag or alert on packets matching custom conditions</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-black rounded-xl text-sm font-bold hover:bg-ns-grey-100 transition-colors"
          >
            <Plus size={14} />
            New Rule
          </button>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/15 rounded-xl mb-8">
          <Zap size={14} className="text-blue-400 mt-0.5 shrink-0" />
          <p className="text-xs text-ns-grey-400 leading-relaxed">
            Rules are evaluated against every packet in a session after upload. Matching packets are flagged in the session view and optionally trigger a webhook. Changes apply to new uploads only.
          </p>
        </div>

        {/* Rules list */}
        {loading ? (
          <div className="flex items-center justify-center h-40 text-ns-grey-500 text-sm">Loading...</div>
        ) : rules.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-ns-grey-500">
            <AlertTriangle size={32} className="mb-4 opacity-30" />
            <p className="text-sm">No rules yet. Create one to start flagging anomalous packets.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map(rule => (
              <div key={rule.id} className={`ns-glass rounded-2xl border p-5 transition-colors ${
                rule.enabled ? 'border-white/[0.06]' : 'border-white/[0.03] opacity-60'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="font-semibold text-white">{rule.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${ACTION_COLORS[rule.action]}`}>
                        {rule.action}
                      </span>
                      {!rule.enabled && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono border bg-white/[0.04] text-ns-grey-500 border-white/[0.08]">
                          disabled
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-ns-grey-400 font-mono bg-white/[0.03] rounded-lg px-3 py-2 inline-block">
                      {rule.field} {rule.operator} {rule.value}
                    </div>
                    {rule.triggerCount > 0 && (
                      <p className="text-[11px] text-ns-grey-600 mt-2 font-mono">
                        Triggered {rule.triggerCount} time{rule.triggerCount !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggle(rule)}
                      className="text-ns-grey-500 hover:text-white transition-colors"
                      title={rule.enabled ? 'Disable rule' : 'Enable rule'}
                    >
                      {rule.enabled ? <ToggleRight size={20} className="text-ns-success" /> : <ToggleLeft size={20} />}
                    </button>
                    <button
                      onClick={() => handleDelete(rule)}
                      className="p-1.5 text-ns-grey-500 hover:text-ns-danger transition-colors"
                      title="Delete rule"
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

      {/* Create Rule Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md ns-glass-dark rounded-2xl border border-white/[0.08] p-6">
            <h3 className="font-bold text-white mb-6">Create Policy Rule</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] text-ns-grey-500 uppercase tracking-widest font-bold mb-2">Rule Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="High entropy payload"
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white focus:border-ns-accent outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-ns-grey-500 uppercase tracking-widest font-bold mb-2">Field</label>
                  <select
                    value={form.field}
                    onChange={e => setForm(f => ({ ...f, field: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white focus:border-ns-accent outline-none transition-colors"
                  >
                    {FIELDS.map(f => <option key={f} value={f} className="bg-ns-bg-800">{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-ns-grey-500 uppercase tracking-widest font-bold mb-2">Operator</label>
                  <select
                    value={form.operator}
                    onChange={e => setForm(f => ({ ...f, operator: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white focus:border-ns-accent outline-none transition-colors"
                  >
                    {OPERATORS.map(op => <option key={op} value={op} className="bg-ns-bg-800">{OPERATOR_LABELS[op]}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-ns-grey-500 uppercase tracking-widest font-bold mb-2">Value</label>
                <input
                  type="text"
                  value={form.value}
                  onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                  placeholder={FIELD_PLACEHOLDERS[form.field] || 'Enter value'}
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white focus:border-ns-accent outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] text-ns-grey-500 uppercase tracking-widest font-bold mb-2">Action</label>
                <div className="flex gap-2">
                  {ACTIONS.map(a => (
                    <button
                      key={a}
                      onClick={() => setForm(f => ({ ...f, action: a }))}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        form.action === a ? ACTION_COLORS[a] : 'bg-white/[0.03] text-ns-grey-500 border-white/[0.06] hover:text-white'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {(form.action === 'webhook' || form.action === 'both') && (
                <div>
                  <label className="block text-[11px] text-ns-grey-500 uppercase tracking-widest font-bold mb-2">
                    <Webhook size={10} className="inline mr-1" />Webhook
                  </label>
                  {webhooks.length === 0 ? (
                    <p className="text-xs text-ns-grey-600 py-2">No webhooks configured. Go to Webhooks to add one.</p>
                  ) : (
                    <select
                      value={form.webhookId}
                      onChange={e => setForm(f => ({ ...f, webhookId: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white focus:border-ns-accent outline-none transition-colors"
                    >
                      <option value="" className="bg-ns-bg-800">Select webhook...</option>
                      {webhooks.map(w => <option key={w.id} value={w.id} className="bg-ns-bg-800">{w.name}</option>)}
                    </select>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 text-sm text-ns-grey-400 hover:text-white transition-colors border border-white/[0.08] rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 text-sm font-bold bg-white text-black rounded-xl hover:bg-ns-grey-100 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Rule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
