import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import useStore from '../store/useStore';
import { sessionsApi } from '../utils/api';


export default function SessionSelector() {
  const navigate = useNavigate();
  const { sessions, setSessions, setCurrentSession } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (sessions.length === 0) {
      sessionsApi.getAll().then(data => {
        setSessions(data);
      }).catch(() => setSessions([]));
    }
  }, [sessions.length, setSessions]);

  const activeSession = sessions[0];
  const filteredSessions = sessions.filter(s =>
    (s.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (session) => {
    setCurrentSession(session);
    setIsOpen(false);
    navigate(`/session/${session.id}`);
  };

  if (!activeSession) return null;

  return (
    <div className="relative" data-testid="session-selector">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg hover:border-white/[0.15] text-neutral-300 min-w-[160px] transition-colors"
        data-testid="session-selector-btn"
      >
        <span className="text-xs flex-1 text-left truncate">{activeSession.title}</span>
        <ChevronDown size={12} className={`text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1.5 w-72 bg-ns-bg-800 border border-white/[0.1] rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-2 border-b border-white/[0.06]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sessions..."
                className="w-full px-3 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-lg text-xs text-white placeholder-neutral-600 focus:border-white/[0.15] outline-none"
                data-testid="session-search-input"
              />
            </div>
            <div className="max-h-56 overflow-y-auto p-1">
              {filteredSessions.map(session => (
                <button
                  key={session.id}
                  onClick={() => handleSelect(session)}
                  className="w-full px-3 py-2 text-left rounded-lg hover:bg-white/[0.04] transition-colors"
                  data-testid={`session-option-${session.id}`}
                >
                  <div className="text-xs text-neutral-200 truncate">{session.title}</div>
                  <div className="text-[10px] text-neutral-600">{(session.packets || 0)} packets</div>
                </button>
              ))}
            </div>
            <div className="p-2 border-t border-white/[0.06]">
              <button
                onClick={() => { setIsOpen(false); navigate('/upload'); }}
                className="w-full py-1.5 bg-white text-black rounded-lg text-xs font-semibold hover:bg-neutral-200 transition-colors"
                data-testid="new-session-from-selector"
              >
                + New Session
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
