import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, Loader2, Code2, Filter, Edit2, Trash2, X, Tag, ChevronDown,
} from 'lucide-react';
import api from '../utils/api';
import useStore from '../store/useStore';
import { toast } from 'sonner';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Problem {
  id: string;
  _id?: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  category: string;
  tags: string[];
  description: string;
}

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
type Mode = 'browse' | 'manage';

interface FormState {
  title: string;
  difficulty: Difficulty;
  category: string;
  tags: string;
  description: string;
}

const EMPTY_FORM: FormState = {
  title: '',
  difficulty: 'EASY',
  category: '',
  tags: '',
  description: '',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const DIFF_BADGE: Record<Difficulty, string> = {
  EASY:   'text-green-400  bg-green-400/10  border-green-400/20',
  MEDIUM: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  HARD:   'text-red-400    bg-red-400/10    border-red-400/20',
};

const DIFF_ACTIVE: Record<Difficulty, string> = {
  EASY:   'bg-green-400/15  border-green-400/40  text-green-400',
  MEDIUM: 'bg-yellow-400/15 border-yellow-400/40 text-yellow-400',
  HARD:   'bg-red-400/15   border-red-400/40   text-red-400',
};

const problemId = (p: Problem) => p.id || p._id || '';

// ── Sub-components ────────────────────────────────────────────────────────────

function DiffBadge({ diff }: { diff: Difficulty }) {
  return (
    <span
      className={`text-[9px] px-2 py-0.5 rounded-full border font-mono font-bold uppercase tracking-wider ${DIFF_BADGE[diff]}`}
    >
      {diff}
    </span>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

interface ModalProps {
  open: boolean;
  editing: Problem | null;
  onClose: () => void;
  onSaved: (p: Problem) => void;
}

function ProblemModal({ open, editing, onClose, onSaved }: ModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  // Populate form when opening for edit / reset when opening for create
  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        title: editing.title,
        difficulty: editing.difficulty,
        category: editing.category,
        tags: editing.tags.join(', '),
        description: editing.description,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    // Focus title after paint
    setTimeout(() => titleRef.current?.focus(), 60);
  }, [open, editing]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.category.trim()) { toast.error('Category is required'); return; }

    const payload = {
      title: form.title.trim(),
      difficulty: form.difficulty,
      category: form.category.trim(),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      description: form.description.trim(),
    };

    setSaving(true);
    try {
      let saved: Problem;
      if (editing) {
        const res = await api.patch(`/problems/${problemId(editing)}`, payload);
        saved = res.data;
        toast.success('Problem updated');
      } else {
        const res = await api.post('/problems', payload);
        saved = res.data;
        toast.success('Problem created');
      }
      onSaved(saved);
    } catch {
      toast.error(editing ? 'Failed to update problem' : 'Failed to create problem');
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-white/[0.22] focus:bg-white/[0.05] transition-all';

  return (
    /* Overlay */
    <div
      aria-modal="true"
      role="dialog"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(0,0,0,0.80)',
        backdropFilter: 'blur(6px)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity 200ms ease',
      }}
    >
      <div
        className="w-full max-w-2xl bg-[#0D0F14] border border-white/[0.10] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{
          transform: open ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)',
          transition: 'transform 200ms ease',
        }}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <h2 className="text-base font-semibold text-white">
            {editing ? 'Edit Problem' : 'New Problem'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Title</label>
            <input
              ref={titleRef}
              type="text"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="e.g. Two Sum"
              className={inputCls}
            />
          </div>

          {/* Difficulty toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Difficulty</label>
            <div className="flex gap-2">
              {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => set('difficulty', d)}
                  className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold uppercase border transition-all duration-150 ${
                    form.difficulty === d
                      ? DIFF_ACTIVE[d]
                      : 'border-white/[0.07] text-neutral-500 hover:border-white/[0.14] hover:text-neutral-300 bg-white/[0.02]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Category + Tags row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Category</label>
              <input
                type="text"
                value={form.category}
                onChange={e => set('category', e.target.value)}
                placeholder="e.g. Arrays"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                <Tag size={11} /> Tags
                <span className="text-neutral-700 normal-case tracking-normal font-normal">(comma separated)</span>
              </label>
              <input
                type="text"
                value={form.tags}
                onChange={e => set('tags', e.target.value)}
                placeholder="hash-map, sliding-window"
                className={inputCls}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Description</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={7}
              placeholder="Problem statement, constraints, examples… (Markdown supported)"
              className={`${inputCls} resize-y min-h-[120px] font-mono text-[13px] leading-relaxed`}
            />
          </div>
        </form>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.07]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-neutral-400 hover:text-white border border-white/[0.07] hover:border-white/[0.15] bg-transparent transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-white text-black hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            {editing ? 'Save Changes' : 'Create Problem'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete confirmation ───────────────────────────────────────────────────────

interface DeleteConfirmProps {
  problem: Problem | null;
  onCancel: () => void;
  onConfirm: () => void;
  deleting: boolean;
}

function DeleteConfirm({ problem, onCancel, onConfirm, deleting }: DeleteConfirmProps) {
  const open = problem !== null;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(0,0,0,0.80)',
        backdropFilter: 'blur(6px)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity 180ms ease',
      }}
    >
      <div
        className="w-full max-w-sm bg-[#0D0F14] border border-white/[0.10] rounded-2xl shadow-2xl p-6"
        style={{
          transform: open ? 'scale(1)' : 'scale(0.95)',
          transition: 'transform 180ms ease',
        }}
      >
        <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <Trash2 size={18} className="text-red-400" />
        </div>
        <h3 className="text-base font-semibold text-white mb-1">Delete Problem</h3>
        <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
          Are you sure you want to delete{' '}
          <span className="text-neutral-300 font-medium">"{problem?.title}"</span>?{' '}
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg text-sm text-neutral-400 border border-white/[0.07] hover:border-white/[0.15] hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2 rounded-lg text-sm font-semibold bg-red-500/90 hover:bg-red-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Category dropdown ─────────────────────────────────────────────────────────

function CategoryDropdown({
  categories,
  value,
  onChange,
}: {
  categories: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs border border-white/[0.07] bg-white/[0.02] text-neutral-400 hover:border-white/[0.14] hover:text-neutral-200 transition-all min-w-[140px]"
      >
        <span className="flex-1 text-left truncate">{value === 'ALL' ? 'All Categories' : value}</span>
        <ChevronDown size={13} className={`shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-30 w-52 bg-[#10131a] border border-white/[0.10] rounded-xl shadow-2xl py-1 overflow-hidden">
          {['ALL', ...categories].map(cat => (
            <button
              key={cat}
              onClick={() => { onChange(cat); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-xs transition-colors ${
                value === cat
                  ? 'text-white bg-white/[0.07]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Problems() {
  const navigate = useNavigate();
  const user = useStore(s => s.user);
  const isAdmin = user?.role === 'ADMIN';

  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>('browse');

  // Filters
  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState<string>('ALL');
  const [catFilter, setCatFilter] = useState<string>('ALL');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);

  // Delete
  const [deletingProblem, setDeletingProblem] = useState<Problem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Data fetching ────────────────────────────────────────────────────────────

  useEffect(() => {
    setLoading(true);
    api.get('/problems')
      .then(res => setProblems(res.data))
      .catch(() => toast.error('Failed to load problems'))
      .finally(() => setLoading(false));
  }, []);

  // ── Derived state ────────────────────────────────────────────────────────────

  const categories = [...new Set(problems.map(p => p.category).filter(Boolean))].sort();

  const filtered = problems.filter(p => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q));
    const matchDiff = diffFilter === 'ALL' || p.difficulty === diffFilter;
    const matchCat = catFilter === 'ALL' || p.category === catFilter;
    return matchSearch && matchDiff && matchCat;
  });

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const openCreate = () => { setEditingProblem(null); setModalOpen(true); };
  const openEdit = (p: Problem) => { setEditingProblem(p); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingProblem(null); };

  const handleSaved = (saved: Problem) => {
    setProblems(prev => {
      const id = problemId(saved);
      const idx = prev.findIndex(p => problemId(p) === id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    closeModal();
  };

  const confirmDelete = async () => {
    if (!deletingProblem) return;
    setIsDeleting(true);
    try {
      await api.delete(`/problems/${problemId(deletingProblem)}`);
      setProblems(prev => prev.filter(p => problemId(p) !== problemId(deletingProblem!)));
      toast.success('Problem deleted');
      setDeletingProblem(null);
    } catch {
      toast.error('Failed to delete problem');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStartInterview = (problem: Problem) => {
    navigate(
      `/create-session?problem=${encodeURIComponent(problem.title)}&difficulty=${problem.difficulty}`,
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen pt-20 sm:pt-24 px-4 sm:px-6 pb-16 bg-[#0B0B0D]">
      <div className="max-w-6xl mx-auto">

        {/* ── Page header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Problem Library</h1>
            <p className="text-sm text-neutral-500">
              {isAdmin
                ? 'Browse, create, and manage interview problems'
                : 'Browse curated problems and start interview sessions'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Mode tabs — only shown to admins */}
            {isAdmin && (
              <div className="flex items-center bg-white/[0.03] border border-white/[0.07] rounded-xl p-1">
                {(['browse', 'manage'] as Mode[]).map(m => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-150 ${
                      mode === m
                        ? 'bg-white text-black shadow'
                        : 'text-neutral-500 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
            {isAdmin && (
              <button
                onClick={openCreate}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-xl font-semibold text-sm hover:bg-neutral-100 transition-colors shrink-0"
              >
                <Plus size={15} /> Add Problem
              </button>
            )}
          </div>
        </div>

        {/* ── Filters bar ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, category, or tag…"
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-white/[0.15] transition-colors"
            />
          </div>

          {/* Difficulty pills */}
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-neutral-700 shrink-0" />
            {['ALL', 'EASY', 'MEDIUM', 'HARD'].map(d => (
              <button
                key={d}
                onClick={() => setDiffFilter(d)}
                className={`px-3 py-2 rounded-lg text-[11px] font-mono font-bold uppercase transition-all duration-150 border ${
                  diffFilter === d
                    ? d === 'ALL'
                      ? 'bg-white text-black border-white'
                      : DIFF_BADGE[d as Difficulty]
                    : 'border-white/[0.06] text-neutral-600 hover:text-neutral-300 hover:border-white/[0.12] bg-white/[0.01]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Category dropdown */}
          {categories.length > 0 && (
            <CategoryDropdown
              categories={categories}
              value={catFilter}
              onChange={setCatFilter}
            />
          )}
        </div>

        {/* ── Content ─────────────────────────────────────────────────────────── */}
        {loading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState hasFilters={!!(search || diffFilter !== 'ALL' || catFilter !== 'ALL')} />
        ) : mode === 'browse' || !isAdmin ? (
          <BrowseGrid
            problems={filtered}
            onStart={handleStartInterview}
          />
        ) : (
          <ManageTable
            problems={filtered}
            onEdit={openEdit}
            onDelete={setDeletingProblem}
            onStart={handleStartInterview}
          />
        )}

        {/* Count footer */}
        {!loading && (
          <p className="text-center text-[10px] text-neutral-700 mt-10 font-mono uppercase tracking-[0.2em]">
            {filtered.length} problem{filtered.length !== 1 ? 's' : ''}
            {filtered.length !== problems.length ? ` of ${problems.length}` : ''}
          </p>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      <ProblemModal
        open={modalOpen}
        editing={editingProblem}
        onClose={closeModal}
        onSaved={handleSaved}
      />
      <DeleteConfirm
        problem={deletingProblem}
        onCancel={() => setDeletingProblem(null)}
        onConfirm={confirmDelete}
        deleting={isDeleting}
      />
    </div>
  );
}

// ── Browse Grid ───────────────────────────────────────────────────────────────

function BrowseGrid({
  problems,
  onStart,
}: {
  problems: Problem[];
  onStart: (p: Problem) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {problems.map(problem => (
        <ProblemCard key={problemId(problem)} problem={problem} onStart={onStart} />
      ))}
    </div>
  );
}

function ProblemCard({ problem, onStart }: { problem: Problem; onStart: (p: Problem) => void }) {
  return (
    <div className="group flex flex-col gap-3 p-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:border-white/[0.18] hover:bg-white/[0.05] transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-white leading-snug group-hover:text-[#137fec] transition-colors line-clamp-2">
          {problem.title}
        </h3>
        <DiffBadge diff={problem.difficulty} />
      </div>

      {/* Category */}
      <p className="text-[11px] text-neutral-500 font-mono">{problem.category}</p>

      {/* Tags */}
      {problem.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {problem.tags.slice(0, 4).map(tag => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[10px] text-neutral-600 font-mono"
            >
              #{tag}
            </span>
          ))}
          {problem.tags.length > 4 && (
            <span className="text-[10px] text-neutral-700 self-center">+{problem.tags.length - 4}</span>
          )}
        </div>
      )}

      {/* Description preview */}
      {problem.description && (
        <p className="text-[11px] text-neutral-600 leading-relaxed line-clamp-2 flex-1">
          {problem.description}
        </p>
      )}

      {/* CTA */}
      <button
        onClick={() => onStart(problem)}
        className="mt-auto w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-neutral-400 text-xs font-bold hover:bg-white hover:text-black hover:border-white transition-all duration-200"
      >
        <Code2 size={13} /> Start Interview
      </button>
    </div>
  );
}

// ── Manage Table ──────────────────────────────────────────────────────────────

function ManageTable({
  problems,
  onEdit,
  onDelete,
  onStart,
}: {
  problems: Problem[];
  onEdit: (p: Problem) => void;
  onDelete: (p: Problem) => void;
  onStart: (p: Problem) => void;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-[2fr_1fr_1fr_2fr_auto] gap-4 px-5 py-3 bg-white/[0.025] border-b border-white/[0.07] text-[10px] font-semibold uppercase tracking-widest text-neutral-600">
        <span>Title</span>
        <span>Difficulty</span>
        <span>Category</span>
        <span>Tags</span>
        <span className="text-right pr-1">Actions</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/[0.04]">
        {problems.map(problem => (
          <div
            key={problemId(problem)}
            className="grid grid-cols-[2fr_1fr_1fr_2fr_auto] gap-4 items-center px-5 py-3.5 hover:bg-white/[0.02] transition-colors group"
          >
            {/* Title */}
            <span className="text-sm text-white font-medium truncate group-hover:text-[#137fec] transition-colors">
              {problem.title}
            </span>

            {/* Difficulty */}
            <DiffBadge diff={problem.difficulty} />

            {/* Category */}
            <span className="text-[11px] text-neutral-500 font-mono truncate">{problem.category}</span>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {problem.tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[10px] text-neutral-600 font-mono">
                  #{tag}
                </span>
              ))}
              {problem.tags.length > 3 && (
                <span className="text-[10px] text-neutral-700 self-center">+{problem.tags.length - 3}</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 justify-end">
              <button
                onClick={() => onStart(problem)}
                title="Start Interview"
                className="p-1.5 rounded-lg text-neutral-600 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                <Code2 size={14} />
              </button>
              <button
                onClick={() => onEdit(problem)}
                title="Edit"
                className="p-1.5 rounded-lg text-neutral-600 hover:text-[#137fec] hover:bg-[#137fec]/10 transition-all"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => onDelete(problem)}
                title="Delete"
                className="p-1.5 rounded-lg text-neutral-600 hover:text-red-400 hover:bg-red-400/10 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Skeletons & Empty ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-48 rounded-2xl border border-white/[0.05] bg-white/[0.02] animate-pulse"
        />
      ))}
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.01] text-neutral-600">
      <Code2 size={40} className="mb-4 opacity-30" />
      <h3 className="text-white font-medium mb-1">
        {hasFilters ? 'No matching problems' : 'No problems yet'}
      </h3>
      <p className="text-sm text-neutral-600">
        {hasFilters ? 'Try adjusting your search or filters' : 'Add your first problem to get started'}
      </p>
    </div>
  );
}
