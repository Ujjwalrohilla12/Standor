import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import useStore from '../store/useStore';

export default function GlobalSearch() {
  const navigate = useNavigate();
  const { sessions, packets } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const results = query.trim() ? [
    ...sessions.filter(s => (s.title || '').toLowerCase().includes(query.toLowerCase())).map(s => ({
      type: 'Session', title: s.title, action: () => { navigate(`/session/${s.id}`); setIsOpen(false); }
    })),
    ...packets.filter(p =>
      p.protocol.toLowerCase().includes(query.toLowerCase()) ||
      p.src.includes(query) || p.dst.includes(query)
    ).slice(0, 5).map(p => ({
      type: 'Packet', title: `${p.protocol} ${p.src}:${p.srcPort} -> ${p.dst}:${p.dstPort}`,
      action: () => { setIsOpen(false); }
    }))
  ] : [];

  return (
    <div className="relative" data-testid="global-search">
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg hover:border-white/[0.15] text-neutral-500 transition-colors"
        data-testid="search-trigger-btn"
      >
        <Search size={14} />
        <span className="text-xs hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline px-1.5 py-0.5 text-[10px] bg-white/[0.06] rounded border border-white/[0.1] ml-2">
          Cmd+K
        </kbd>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex items-start justify-center pt-[15vh] z-50"
          onClick={() => setIsOpen(false)}
          data-testid="search-overlay"
        >
          <div
            className="w-full max-w-xl bg-ns-bg-800 border border-white/[0.1] rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
              <Search size={18} className="text-neutral-500" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sessions, packets, annotations..."
                className="flex-1 bg-transparent text-white placeholder-neutral-600 outline-none text-sm"
                data-testid="global-search-input"
              />
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-500 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {query && results.length > 0 ? (
                results.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={result.action}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.04] text-left transition-colors"
                    data-testid={`search-result-${idx}`}
                  >
                    <div className="w-7 h-7 rounded bg-white/[0.06] flex items-center justify-center text-neutral-400 text-[10px] font-semibold uppercase shrink-0">
                      {result.type[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-neutral-200 truncate">{result.title}</div>
                      <div className="text-xs text-neutral-600">{result.type}</div>
                    </div>
                  </button>
                ))
              ) : query ? (
                <div className="text-center py-8 text-neutral-600 text-sm">No results found</div>
              ) : (
                <div className="text-center py-8 text-neutral-600 text-sm">Type to search...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
