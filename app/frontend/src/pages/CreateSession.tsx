import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, ArrowRight, Code2, Search, ChevronRight } from 'lucide-react';
import { roomsApi } from '../utils/api';
import api from '../utils/api';
import { toast } from 'sonner';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
];

const DIFFICULTIES = [
  { value: 'EASY', label: 'Easy', color: 'text-green-400 border-green-400/30 bg-green-400/10' },
  { value: 'MEDIUM', label: 'Medium', color: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' },
  { value: 'HARD', label: 'Hard', color: 'text-red-400 border-red-400/30 bg-red-400/10' },
] as const;

const DIFF_BADGE: Record<string, string> = {
  EASY: 'text-green-400',
  MEDIUM: 'text-yellow-400',
  HARD: 'text-red-400',
};

interface ProblemSuggestion {
  id: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  category: string;
  tags: string[];
}

export default function CreateSession() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialProblem = searchParams.get('problem') || '';
  const initialDifficulty = (searchParams.get('difficulty') as 'EASY' | 'MEDIUM' | 'HARD') || 'MEDIUM';

  const [problem, setProblem] = useState(initialProblem);
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>(initialDifficulty);
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [problemSearch, setProblemSearch] = useState('');
  const [problems, setProblems] = useState<ProblemSuggestion[]>([]);
  const [loadingProblems, setLoadingProblems] = useState(true);
  const [showProblemPicker, setShowProblemPicker] = useState(false);

  useEffect(() => {
    api.get('/problems')
      .then(res => setProblems(res.data))
      .catch(() => {/* silently skip if not available */ })
      .finally(() => setLoadingProblems(false));
  }, []);

  // Auto-fill problem and difficulty if they come from search params
  useEffect(() => {
    if (initialProblem) setProblem(initialProblem);
    if (initialDifficulty) setDifficulty(initialDifficulty);
  }, [initialProblem, initialDifficulty]);

  const filteredProblems = problems.filter(p =>
    p.title.toLowerCase().includes(problemSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(problemSearch.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(problemSearch.toLowerCase()))
  );

  const handleSelectProblem = (p: ProblemSuggestion) => {
    setProblem(p.title);
    setDifficulty(p.difficulty);
    setShowProblemPicker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem.trim()) {
      toast.error('Please enter a problem name');
      return;
    }
    setLoading(true);
    try {
      const room = await roomsApi.create({ problem: problem.trim(), difficulty, language });
      toast.success('Interview session created');
      navigate(`/meeting/${room.callId || (room as any).id || room._id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0B0D] px-4 pt-20">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="mb-10">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-6">
            <Code2 size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">New Interview Session</h1>
          <p className="text-sm text-neutral-500">
            Set the problem, difficulty, and language. A collaborative room will be created instantly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Problem */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                Problem *
              </label>
              {!loadingProblems && problems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowProblemPicker(v => !v)}
                  className="text-[10px] font-mono text-neutral-500 hover:text-white transition-colors flex items-center gap-1"
                >
                  Browse library <ChevronRight size={10} />
                </button>
              )}
            </div>

            {/* Problem picker */}
            {showProblemPicker && (
              <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-[#0D0D0D] mb-2">
                <div className="relative border-b border-white/[0.06]">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
                  <input
                    type="text"
                    value={problemSearch}
                    onChange={e => setProblemSearch(e.target.value)}
                    placeholder="Search problems..."
                    className="w-full pl-8 pr-4 py-2.5 bg-transparent text-sm text-white placeholder:text-neutral-700 outline-none"
                    autoFocus
                  />
                </div>
                <div className="max-h-52 overflow-y-auto">
                  {filteredProblems.length === 0 ? (
                    <p className="text-center text-xs text-neutral-600 py-4">No problems found</p>
                  ) : filteredProblems.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectProblem(p)}
                      className="w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-white/[0.04] border-b border-white/[0.04] last:border-0 transition-colors"
                    >
                      <div>
                        <span className="text-sm text-neutral-200">{p.title}</span>
                        <span className="ml-2 text-[10px] text-neutral-600 font-mono">{p.category}</span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold uppercase ${DIFF_BADGE[p.difficulty]}`}>
                        {p.difficulty}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <input
              type="text"
              value={problem}
              onChange={e => setProblem(e.target.value)}
              placeholder="e.g. Two Sum, LRU Cache, Valid Parentheses"
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder:text-neutral-700 focus:border-white/[0.2] outline-none transition-colors"
              autoFocus={!showProblemPicker}
            />
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
              Difficulty
            </label>
            <div className="grid grid-cols-3 gap-3">
              {DIFFICULTIES.map(d => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDifficulty(d.value)}
                  className={`py-2.5 rounded-xl border text-sm font-semibold transition-all ${difficulty === d.value
                    ? d.color
                    : 'border-white/[0.06] text-neutral-600 bg-white/[0.02] hover:border-white/[0.12] hover:text-neutral-400'
                    }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
              Language
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {LANGUAGES.map(l => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => setLanguage(l.value)}
                  className={`py-2 rounded-lg border text-xs font-mono transition-all ${language === l.value
                    ? 'bg-white text-black border-white'
                    : 'border-white/[0.06] text-neutral-500 bg-transparent hover:border-white/[0.15] hover:text-neutral-300'
                    }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !problem.trim()}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-white text-black rounded-xl font-bold text-sm hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all mt-8"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                Create Interview Room
                <ArrowRight size={16} />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="w-full text-center text-sm text-neutral-600 hover:text-neutral-400 transition-colors py-1"
          >
            Cancel
          </button>

        </form>
      </div>
    </div>
  );
}
