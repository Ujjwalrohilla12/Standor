import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, SkipBack, SkipForward } from 'lucide-react';

interface Packet {
  id: string;
  src: string;
  dst: string;
  srcPort?: number;
  dstPort?: number;
  protocol: string;
  size: number;
  flags?: string;
  timestamp?: string;
  entropy?: number;
  entropyFlag?: boolean;
}

interface ReplayPanelProps {
  packets: Packet[];
  onPacketSelect: (packet: Packet) => void;
  selectedPacket: Packet | null;
}

export default function ReplayPanel({ packets, onPacketSelect, selectedPacket }: ReplayPanelProps) {
  const [playing, setPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [markedIndices, setMarkedIndices] = useState<Set<number>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-advance while playing
  useEffect(() => {
    if (!playing) return;
    if (currentIndex >= packets.length - 1) {
      setPlaying(false);
      return;
    }

    // Try to use real inter-packet delay; fall back to 500ms
    const current = packets[currentIndex];
    const next = packets[currentIndex + 1];
    let delayMs = 500 / speed;

    if (current?.timestamp && next?.timestamp) {
      const delta = new Date(next.timestamp).getTime() - new Date(current.timestamp).getTime();
      if (delta > 0 && delta < 10_000) {
        delayMs = Math.max(40, delta / speed);
      }
    }

    timerRef.current = setTimeout(() => {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      onPacketSelect(packets[nextIdx]);
    }, delayMs);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, currentIndex, packets, speed, onPacketSelect]);

  // Sync slider position with external packet selection (when not playing)
  useEffect(() => {
    if (playing || !selectedPacket) return;
    const idx = packets.findIndex(p => p.id === selectedPacket.id);
    if (idx >= 0) setCurrentIndex(idx);
  }, [selectedPacket, packets, playing]);

  const stop = () => {
    setPlaying(false);
    setCurrentIndex(0);
    if (packets.length > 0) onPacketSelect(packets[0]);
  };

  const stepBack = () => {
    const idx = Math.max(0, currentIndex - 1);
    setCurrentIndex(idx);
    onPacketSelect(packets[idx]);
  };

  const stepForward = () => {
    const idx = Math.min(packets.length - 1, currentIndex + 1);
    setCurrentIndex(idx);
    onPacketSelect(packets[idx]);
  };

  const seekTo = (pct: number) => {
    const idx = Math.round(pct * (packets.length - 1));
    setCurrentIndex(idx);
    onPacketSelect(packets[idx]);
  };

  const toggleMark = () => {
    setMarkedIndices(prev => {
      const next = new Set(prev);
      if (next.has(currentIndex)) next.delete(currentIndex);
      else next.add(currentIndex);
      return next;
    });
  };

  if (!packets.length) {
    return (
      <div className="h-full flex items-center justify-center text-neutral-600 text-xs">
        No packets — upload a PCAP to use replay mode.
      </div>
    );
  }

  const current = packets[currentIndex];
  const progress = packets.length > 1 ? (currentIndex / (packets.length - 1)) * 100 : 0;

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
          Investigation Replay
        </span>
        <span className="text-[9px] text-neutral-700 font-mono">
          {currentIndex + 1} / {packets.length}
        </span>
      </div>

      {/* Scrubber */}
      <div className="relative">
        <div
          className="relative h-3 bg-white/[0.04] rounded-full overflow-hidden cursor-pointer group"
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            seekTo((e.clientX - rect.left) / rect.width);
          }}
        >
          <div
            className="h-full bg-indigo-500/70 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
          {/* Marked waypoints */}
          {Array.from(markedIndices).map(idx => (
            <div
              key={idx}
              className="absolute top-0 h-full w-0.5 bg-amber-400/80"
              style={{ left: `${(idx / Math.max(1, packets.length - 1)) * 100}%` }}
            />
          ))}
        </div>
      </div>

      {/* Transport controls */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={stop}
          className="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-white/[0.06] transition-colors"
          title="Stop"
        >
          <Square size={13} />
        </button>
        <button
          onClick={stepBack}
          disabled={currentIndex === 0}
          className="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-white/[0.06] transition-colors disabled:opacity-30"
          title="Step back"
        >
          <SkipBack size={13} />
        </button>
        <button
          onClick={() => setPlaying(v => !v)}
          className="p-3 rounded-xl bg-white text-black hover:bg-neutral-200 transition-colors"
          title={playing ? 'Pause' : 'Play'}
        >
          {playing ? <Pause size={15} /> : <Play size={15} />}
        </button>
        <button
          onClick={stepForward}
          disabled={currentIndex >= packets.length - 1}
          className="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-white/[0.06] transition-colors disabled:opacity-30"
          title="Step forward"
        >
          <SkipForward size={13} />
        </button>
        <select
          value={speed}
          onChange={e => setSpeed(Number(e.target.value))}
          className="bg-white/[0.04] border border-white/[0.08] rounded text-[10px] text-neutral-400 px-2 py-1 outline-none cursor-pointer"
        >
          <option value={0.25}>0.25×</option>
          <option value={0.5}>0.5×</option>
          <option value={1}>1×</option>
          <option value={2}>2×</option>
          <option value={4}>4×</option>
          <option value={10}>10×</option>
        </select>
      </div>

      {/* Current packet card */}
      {current && (
        <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-white">{current.protocol}</span>
            <div className="flex items-center gap-1.5">
              {current.entropyFlag && (
                <span className="px-1.5 py-0.5 text-[9px] rounded bg-amber-500/20 text-amber-400 font-medium">
                  High Entropy
                </span>
              )}
              <button
                onClick={toggleMark}
                className={`px-1.5 py-0.5 text-[9px] rounded transition-colors ${
                  markedIndices.has(currentIndex)
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-white/[0.04] text-neutral-500 hover:text-white'
                }`}
                title="Mark as investigation waypoint"
              >
                {markedIndices.has(currentIndex) ? '★ Marked' : '☆ Mark'}
              </button>
            </div>
          </div>

          <div className="text-[10px] font-mono text-neutral-400">
            {current.src}{current.srcPort ? `:${current.srcPort}` : ''} → {current.dst}{current.dstPort ? `:${current.dstPort}` : ''}
          </div>

          <div className="text-[9px] text-neutral-600">
            {current.size} B
            {current.flags && ` · ${current.flags}`}
            {current.timestamp && ` · ${new Date(current.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`}
          </div>

          {current.entropy != null && (
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-neutral-600 w-12 flex-shrink-0">Entropy</span>
              <div className="flex-1 h-1 bg-white/[0.04] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(current.entropy * 100).toFixed(0)}%`,
                    background:
                      current.entropy > 0.7 ? '#f59e0b'
                      : current.entropy > 0.5 ? '#6366f1'
                      : '#10b981',
                  }}
                />
              </div>
              <span className="text-[9px] font-mono text-neutral-500">{(current.entropy * 100).toFixed(1)}%</span>
            </div>
          )}
        </div>
      )}

      {/* Waypoints list */}
      {markedIndices.size > 0 && (
        <div className="space-y-1">
          <div className="text-[9px] font-semibold text-neutral-600 uppercase tracking-wider flex items-center justify-between">
            <span>Waypoints ({markedIndices.size})</span>
            <button
              onClick={() => setMarkedIndices(new Set())}
              className="text-neutral-700 hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="max-h-32 overflow-y-auto space-y-0.5">
            {Array.from(markedIndices).sort((a, b) => a - b).map(idx => {
              const p = packets[idx];
              return (
                <button
                  key={idx}
                  onClick={() => { setCurrentIndex(idx); onPacketSelect(packets[idx]); }}
                  className="w-full text-left px-2 py-1 rounded text-[9px] font-mono hover:bg-white/[0.04] transition-colors flex items-center gap-2"
                >
                  <span className="text-neutral-600 w-8 flex-shrink-0">#{idx + 1}</span>
                  <span className="text-neutral-400">{p?.protocol}</span>
                  <span className="truncate text-neutral-600">{p?.src} → {p?.dst}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-[8px] text-neutral-700 text-center pt-1 leading-relaxed">
        Mark packets during playback to create investigation waypoints.
        Replay uses real inter-packet timing scaled by speed.
      </p>
    </div>
  );
}
