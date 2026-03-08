import useStore from '../store/useStore';
import { SkipBack, Play, Pause, SkipForward } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Timeline() {
  const { packets, currentTime, setCurrentTime, isPlaying, setIsPlaying, playbackSpeed, setPlaybackSpeed, setSelectedPacket } = useStore();
  const [progress, setProgress] = useState(0);
  const totalDuration = packets.length > 0 ? packets.length * 100 : 1000;

  useEffect(() => {
    if (!isPlaying || packets.length === 0) return;
    const interval = setInterval(() => {
      const next = currentTime + playbackSpeed * 10;
      if (next >= totalDuration) { setIsPlaying(false); setCurrentTime(totalDuration); }
      else { setCurrentTime(next); }
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, totalDuration, setCurrentTime, setIsPlaying, packets.length]);

  useEffect(() => {
    const p = (currentTime / totalDuration) * 100;
    setProgress(Math.min(p, 100));

    if (packets.length > 0) {
      const idx = Math.min(Math.floor((currentTime / totalDuration) * packets.length), packets.length - 1);
      if (idx >= 0) setSelectedPacket(packets[idx]);
    }
  }, [currentTime, totalDuration, packets, setSelectedPacket]);

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = (x / rect.width) * 100;
    setCurrentTime((pct / 100) * totalDuration);
  };

  const formatTime = (ms) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-ns-bg-800/80 backdrop-blur-sm border-t border-white/[0.06] px-3 sm:px-6 py-2 sm:py-3" data-testid="timeline">
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          <button
            onClick={() => setCurrentTime(Math.max(0, currentTime - 1000))}
            className="p-1 sm:p-1.5 rounded hover:bg-white/[0.06] text-neutral-500 hover:text-white transition-colors"
            data-testid="rewind-btn"
          >
            <SkipBack size={13} className="sm:w-[14px] sm:h-[14px]" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 sm:p-2 rounded-full bg-white text-black hover:bg-neutral-200 transition-colors"
            data-testid="play-pause-timeline-btn"
          >
            {isPlaying ? <Pause size={13} className="sm:w-[14px] sm:h-[14px]" /> : <Play size={13} className="ml-0.5 sm:w-[14px] sm:h-[14px]" />}
          </button>
          <button
            onClick={() => setCurrentTime(Math.min(totalDuration, currentTime + 1000))}
            className="p-1 sm:p-1.5 rounded hover:bg-white/[0.06] text-neutral-500 hover:text-white transition-colors"
            data-testid="forward-btn"
          >
            <SkipForward size={13} className="sm:w-[14px] sm:h-[14px]" />
          </button>
        </div>

        <span className="hidden sm:block text-[10px] text-neutral-600 font-mono min-w-[70px] shrink-0" data-testid="time-display">
          {formatTime(currentTime)} / {formatTime(totalDuration)}
        </span>
        <span className="sm:hidden text-[9px] text-neutral-500 font-mono shrink-0">
          {formatTime(currentTime)}
        </span>

        <div className="flex-1 min-w-0 px-1 sm:px-0" data-testid="timeline-scrubber">
          <div className="relative h-6 cursor-pointer group flex items-center" onClick={handleSeek}>
            <div className="relative w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div className="h-full bg-white/60 transition-all duration-75" style={{ width: `${progress}%` }} />
              {packets.map((pkt, idx) => (
                <div
                  key={pkt.id}
                  className={`absolute top-0 w-px h-full ${pkt.entropyFlag ? 'bg-white/40' : 'bg-white/10'}`}
                  style={{ left: `${(idx / packets.length) * 100}%` }}
                />
              ))}
            </div>
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full shadow pointer-events-none transition-transform"
              style={{ left: `${progress}%` }}
            />
          </div>
        </div>

        <select
          value={playbackSpeed}
          onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
          className="shrink-0 bg-white/[0.04] border border-white/[0.08] rounded-md text-[9px] sm:text-[10px] text-neutral-400 py-1 px-1.5 sm:px-2 outline-none"
          data-testid="timeline-speed-select"
        >
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={5}>5x</option>
        </select>
      </div>
    </div>
  );
}
