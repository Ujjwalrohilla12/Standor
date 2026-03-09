import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor, { type OnMount } from '@monaco-editor/react';
type IStandaloneCodeEditor = Parameters<OnMount>[0];
import { ArrowLeft, Play, Pause, RotateCcw, FastForward, Clock, Users, MessageSquare, Loader2 } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';

interface ReplayEvent {
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
  actorId: string;
}

interface ReplayData {
  roomId: string;
  room: {
    problem: string;
    difficulty: string;
    language: string;
    startedAt: string;
    endedAt?: string;
  };
  events: ReplayEvent[];
  initialSnapshot: string;
}

const SPEEDS = [0.5, 1, 2, 4];

export default function Replay() {
  const { id: roomId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<ReplayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [chatLog, setChatLog] = useState<Array<{ sender: string; text: string; ts: number }>>([]);

  const editorRef = useRef<IStandaloneCodeEditor | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idxRef = useRef(-1);

  useEffect(() => {
    if (!roomId) return;
    api.get(`/replay/${roomId}`)
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load replay'))
      .finally(() => setLoading(false));
  }, [roomId]);

  // Initialize editor with first snapshot
  useEffect(() => {
    if (!data || !editorRef.current) return;
    editorRef.current.setValue(data.initialSnapshot || '');
    setChatLog([]);
    setCurrentIdx(-1);
    idxRef.current = -1;
  }, [data]);

  const applyEvent = useCallback((evt: ReplayEvent) => {
    if (evt.type === 'editor-delta') {
      const editor = editorRef.current;
      if (!editor) return;
      const delta = evt.payload as any;
      if (typeof delta.code === 'string') {
        editor.setValue(delta.code);
      } else if (delta.changes && Array.isArray(delta.changes)) {
        const model = editor.getModel();
        if (model) {
          model.pushEditOperations([], delta.changes.map((c: any) => ({
            range: c.range,
            text: c.text,
          })), () => null);
        }
      }
    } else if (evt.type === 'chat') {
      const p = evt.payload as any;
      setChatLog(prev => [...prev, {
        sender: String(p.sender || 'Unknown'),
        text: String(p.text || ''),
        ts: new Date(evt.timestamp).getTime(),
      }]);
    }
  }, []);

  const stopReplay = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPlaying(false);
  }, []);

  const stepForward = useCallback(() => {
    if (!data) return;
    const next = idxRef.current + 1;
    if (next >= data.events.length) {
      stopReplay();
      return;
    }
    idxRef.current = next;
    setCurrentIdx(next);
    applyEvent(data.events[next]);
  }, [data, applyEvent, stopReplay]);

  const scheduleNext = useCallback(() => {
    if (!data || !playing) return;
    const next = idxRef.current + 1;
    if (next >= data.events.length) {
      stopReplay();
      return;
    }

    const curr = data.events[idxRef.current >= 0 ? idxRef.current : 0];
    const nextEvt = data.events[next];
    const delay = idxRef.current < 0
      ? 0
      : Math.min(3000, Math.max(50, (new Date(nextEvt.timestamp).getTime() - new Date(curr.timestamp).getTime()) / speed));

    timerRef.current = setTimeout(() => {
      idxRef.current = next;
      setCurrentIdx(next);
      applyEvent(nextEvt);
      scheduleNext();
    }, delay);
  }, [data, playing, speed, applyEvent, stopReplay]);

  useEffect(() => {
    if (playing) scheduleNext();
    else if (timerRef.current) clearTimeout(timerRef.current);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing]);

  const handleReset = () => {
    stopReplay();
    if (data && editorRef.current) {
      editorRef.current.setValue(data.initialSnapshot || '');
    }
    setChatLog([]);
    setCurrentIdx(-1);
    idxRef.current = -1;
  };

  const progress = data?.events.length ? (currentIdx + 1) / data.events.length : 0;
  const totalEvents = data?.events.length ?? 0;
  const chatEvents = data?.events.filter(e => e.type === 'chat') ?? [];

  if (loading) return (
    <div className="min-h-screen bg-bg-900 flex items-center justify-center">
      <Loader2 size={24} className="animate-spin text-accent" />
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-bg-900 flex items-center justify-center text-neutral-500 text-sm">
      Replay not available for this session.
    </div>
  );

  const durationS = data.room.startedAt && data.room.endedAt
    ? Math.round((new Date(data.room.endedAt).getTime() - new Date(data.room.startedAt).getTime()) / 1000)
    : null;

  return (
    <div className="min-h-screen bg-bg-900 flex flex-col h-screen overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center gap-3 px-4 h-12 border-b border-border shrink-0">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-neutral-500 hover:text-white transition-colors text-xs">
          <ArrowLeft size={14} /> Dashboard
        </button>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold text-sm truncate max-w-xs">{data.room.problem}</span>
          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
            data.room.difficulty === 'EASY' ? 'text-accent border-accent/20 bg-accent/10' :
            data.room.difficulty === 'HARD' ? 'text-accent-tertiary border-accent-tertiary/20 bg-accent-tertiary/10' :
            'text-accent-secondary border-accent-secondary/20 bg-accent-secondary/10'
          }`}>{data.room.difficulty}</span>
        </div>
        <div className="flex-1" />
        {durationS && (
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-mono">
            <Clock size={13} />
            <span>{Math.floor(durationS / 60)}m {durationS % 60}s total</span>
          </div>
        )}
        <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest bg-white/[0.04] px-2 py-1 rounded">
          Replay Mode
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <Editor
            language={data.room.language || 'javascript'}
            defaultValue={data.initialSnapshot || '// No code recorded'}
            onMount={e => { editorRef.current = e; }}
            theme="vs-dark"
            options={{
              fontSize: 13,
              fontFamily: '"JetBrains Mono", monospace',
              minimap: { enabled: false },
              readOnly: true,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 16 },
            }}
          />

          {/* Playback Controls */}
          <div className="border-t border-border bg-bg-900 px-4 py-3 space-y-2 shrink-0">
            {/* Seekable Timeline */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-neutral-600 w-8 text-right">
                {currentIdx < 0 ? '0%' : `${Math.round(progress * 100)}%`}
              </span>
              <input
                type="range"
                min={0}
                max={Math.max(0, totalEvents - 1)}
                value={Math.max(0, currentIdx)}
                onChange={(e) => {
                  const targetIdx = parseInt(e.target.value);
                  if (!data) return;
                  stopReplay();
                  // Rebuild state by replaying all events up to targetIdx
                  if (editorRef.current) editorRef.current.setValue(data.initialSnapshot || '');
                  setChatLog([]);
                  const newChat: typeof chatLog = [];
                  for (let i = 0; i <= targetIdx; i++) {
                    const evt = data.events[i];
                    if (evt.type === 'editor-delta') {
                      const delta = evt.payload as any;
                      if (typeof delta.code === 'string' && editorRef.current) editorRef.current.setValue(delta.code);
                    } else if (evt.type === 'chat') {
                      const p = evt.payload as any;
                      newChat.push({ sender: String(p.sender || ''), text: String(p.text || ''), ts: new Date(evt.timestamp).getTime() });
                    }
                  }
                  setChatLog(newChat);
                  setCurrentIdx(targetIdx);
                  idxRef.current = targetIdx;
                }}
                className="flex-1 accent-blue-500 h-1.5 cursor-pointer"
                style={{ accentColor: 'var(--accent, #137fec)' }}
              />
              <span className="text-[9px] font-mono text-neutral-600 w-8">100%</span>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={handleReset} className="p-1.5 text-neutral-500 hover:text-white transition-colors">
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => setPlaying(p => !p)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-bold hover:bg-accent-secondary transition-colors"
              >
                {playing ? <Pause size={12} /> : <Play size={12} />}
                {playing ? 'Pause' : currentIdx < 0 ? 'Play' : 'Resume'}
              </button>
              <button
                onClick={stepForward}
                disabled={playing || currentIdx >= totalEvents - 1}
                className="p-1.5 text-neutral-500 hover:text-white disabled:opacity-30 transition-colors"
                title="Step forward"
              >
                <FastForward size={14} />
              </button>

              <div className="flex-1" />

              {/* Speed */}
              <div className="flex items-center gap-1">
                {SPEEDS.map(s => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${speed === s ? 'bg-white text-black font-bold' : 'text-neutral-500 hover:text-white'}`}
                  >
                    {s}×
                  </button>
                ))}
              </div>

              <span className="text-[10px] font-mono text-neutral-600">
                {currentIdx + 1} / {totalEvents} events
              </span>
            </div>
          </div>
        </div>

        {/* Right: Chat Replay */}
        <div className="w-72 border-l border-border bg-bg-900 flex flex-col shrink-0">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <MessageSquare size={13} className="text-neutral-500" />
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Chat Replay</span>
            <span className="ml-auto text-[9px] text-neutral-600 font-mono">{chatEvents.length} msgs</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatLog.map((m, i) => (
              <div key={i} className="flex flex-col gap-0.5">
                <span className="text-[9px] text-neutral-600 font-mono">{m.sender}</span>
                <div className="glass-panel px-3 py-1.5 rounded-xl text-xs text-neutral-300 max-w-full">
                  {m.text}
                </div>
              </div>
            ))}
            {chatLog.length === 0 && (
              <p className="text-[11px] text-neutral-700 text-center mt-8">
                Chat messages will appear as you replay
              </p>
            )}
          </div>

          {/* Session stats */}
          <div className="border-t border-border p-4 space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-600">
              <Users size={11} />
              <span>Session Events: {totalEvents}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-600">
              <MessageSquare size={11} />
              <span>Chat Messages: {chatEvents.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
