'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Copy, ExternalLink, Clock, CheckCircle2, Loader2, Zap, ChevronDown } from 'lucide-react';
import { LeftNav } from '@/components/LeftNav';
import { TopBar } from '@/components/TopBar';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import type { Session } from '@/types';

interface Problem { title: string; difficulty: string; tags: readonly string[] }

const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
type Difficulty = (typeof DIFFICULTIES)[number];

const DIFF_BADGE: Record<Difficulty, string> = {
  easy:   'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-status-success/10 text-status-success ring-1 ring-inset ring-status-success/20',
  medium: 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20',
  hard:   'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-status-error/10 text-status-error ring-1 ring-inset ring-status-error/20',
};

export default function DashboardPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ problem: '', difficulty: 'medium' as Difficulty });
  const [showProblems, setShowProblems] = useState(false);

  const { data: problemList = [] } = useQuery<Problem[]>({
    queryKey: ['problems'],
    queryFn: () => api.get('/api/problems').then((r) => r.data),
    enabled: showModal,
  });

  const { data: sessions = [], isLoading } = useQuery<Session[]>({
    queryKey: ['sessions'],
    queryFn: () => api.get('/api/sessions/my-sessions').then((r) => r.data),
  });

  const { mutate: createSession, isPending } = useMutation({
    mutationFn: (body: { problem: string; difficulty: string }) =>
      api.post('/api/sessions', body).then((r) => r.data),
    onSuccess: (session: Session) => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      setShowModal(false);
      toast.success('Session created!');
      navigator.clipboard.writeText(session.roomId).catch(() => null);
    },
    onError: () => toast.error('Failed to create session'),
  });

  const filtered = sessions.filter((s) => filter === 'all' || s.status === filter);
  const stats = {
    total:      sessions.length,
    active:     sessions.filter((s) => s.status === 'active').length,
    completed:  sessions.filter((s) => s.status === 'completed').length,
    aiAnalyzed: sessions.filter((s) => s.aiAnalysis).length,
  };

  return (
    <div className="flex min-h-screen bg-bg-base">
      <LeftNav />

      {/* Content pushed right of the collapsed nav */}
      <div
        className="flex flex-1 flex-col"
        style={{ marginLeft: 'var(--nav-w-collapsed)' }}
      >
        <TopBar />

        <main
          className="flex-1 overflow-y-auto px-6 lg:px-10"
          style={{ paddingTop: 'calc(var(--topbar-h) + 2rem)', paddingBottom: '2rem' }}
        >
          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Total sessions', value: stats.total,      Icon: Clock,        color: 'text-text-secondary' },
              { label: 'Active',         value: stats.active,     Icon: Zap,          color: 'text-teal-400' },
              { label: 'Completed',      value: stats.completed,  Icon: CheckCircle2, color: 'text-status-success' },
              { label: 'AI analyzed',    value: stats.aiAnalyzed, Icon: Zap,          color: 'text-amber-400' },
            ].map(({ label, value, Icon, color }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="card flex items-center gap-4 p-5"
              >
                <div className={`rounded-xl bg-bg-elevated p-2.5 ${color}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-text-primary">{value}</p>
                  <p className="text-xs text-text-tertiary">{label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-1 rounded-xl border border-border bg-bg-elevated p-1">
              {(['all', 'active', 'completed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                    filter === f
                      ? 'bg-teal-500 text-bg-base shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New session
            </button>
          </div>

          {/* Session cards */}
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-teal-400" aria-label="Loading sessions" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="card flex flex-col items-center py-20 text-center">
              <p className="text-lg font-semibold text-text-primary">No sessions yet</p>
              <p className="mt-1 text-sm text-text-secondary">Create your first interview session above.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((session, i) => (
                <motion.div
                  key={session._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  className="card p-5"
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <h3 className="line-clamp-1 font-semibold text-text-primary">{session.problem}</h3>
                    <span className={DIFF_BADGE[session.difficulty as Difficulty]}>
                      {session.difficulty}
                    </span>
                  </div>

                  <p className="mb-4 font-mono text-xs text-text-tertiary">{session.roomId}</p>

                  {session.aiAnalysis && (
                    <div className="mb-3 flex items-center gap-1.5 text-xs text-amber-400">
                      <Zap className="h-3 w-3" aria-hidden="true" />
                      <span>Score: {session.aiAnalysis.overallScore}/10</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <a
                      href={`/room/${session.roomId}`}
                      className="btn-primary flex-1 justify-center py-2 text-xs"
                    >
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      {session.status === 'active' ? 'Join' : 'View'}
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(session.roomId).catch(() => null);
                        toast.success('Room ID copied');
                      }}
                      className="btn-secondary p-2"
                      aria-label="Copy room ID"
                    >
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Create session modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="card-elevated w-full max-w-md p-6"
          >
            <h2 className="mb-5 text-lg font-extrabold text-text-primary">Create interview session</h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createSession(form);
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                  Problem title
                </label>
                <div className="relative">
                  <input
                    className="input pr-10"
                    required
                    value={form.problem}
                    onChange={(e) => setForm((f) => ({ ...f, problem: e.target.value }))}
                    placeholder="e.g. Two Sum, System Design: URL Shortener"
                  />
                  <button
                    type="button"
                    onClick={() => setShowProblems((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
                    aria-label="Pick a demo problem"
                  >
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                {showProblems && problemList.length > 0 && (
                  <ul className="mt-1 max-h-40 overflow-y-auto rounded-xl border border-border bg-bg-elevated shadow-panel">
                    {problemList.map((p) => (
                      <li key={p.title}>
                        <button
                          type="button"
                          onClick={() => {
                            setForm({ problem: p.title, difficulty: p.difficulty.toLowerCase() as Difficulty });
                            setShowProblems(false);
                          }}
                          className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-bg-subtle"
                        >
                          <span className="font-medium text-text-primary">{p.title}</span>
                          <span className="ml-2 text-xs text-text-tertiary">{p.difficulty.toLowerCase()}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">Difficulty</label>
                <div className="flex gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, difficulty: d }))}
                      className={`flex-1 rounded-xl border py-2 text-sm font-medium capitalize transition-colors ${
                        form.difficulty === d
                          ? 'border-teal-500/50 bg-teal-500/10 text-teal-400'
                          : 'border-border text-text-secondary hover:border-border-strong'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1 justify-center"
                >
                  Cancel
                </button>
                <button type="submit" disabled={isPending} className="btn-primary flex-1 justify-center">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-label="Creating" /> : 'Create session'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
