import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Copy,
  Check,
  Users,
  ArrowRight,
  Loader2,
  Wifi,
  ArrowLeft,
  Clock,
  Code2,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import useStore from '../store/useStore';
import { roomsApi, type InterviewRoom } from '../utils/api';

const API_BASE = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:4000';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Participant {
  userId: string;
  name: string;
  role: 'host' | 'candidate';
  isReady: boolean;
  joinedAt: number;
}

type NetworkQuality = 'good' | 'fair' | 'poor' | 'checking';

// ── Helpers ───────────────────────────────────────────────────────────────────

const DIFFICULTY_STYLES: Record<string, { label: string; classes: string; dot: string }> = {
  EASY: {
    label: 'Easy',
    classes: 'text-green-400 bg-green-400/10 border-green-400/20',
    dot: 'bg-green-400',
  },
  MEDIUM: {
    label: 'Medium',
    classes: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    dot: 'bg-yellow-400',
  },
  HARD: {
    label: 'Hard',
    classes: 'text-red-400 bg-red-400/10 border-red-400/20',
    dot: 'bg-red-400',
  },
};

const LANGUAGE_DISPLAY: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  go: 'Go',
  rust: 'Rust',
  csharp: 'C#',
  ruby: 'Ruby',
  swift: 'Swift',
  kotlin: 'Kotlin',
  php: 'PHP',
};

function formatCountdown(ms: number): string {
  if (ms <= 0) return 'Now';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ReadyPulse({ ready }: { ready: boolean }) {
  return (
    <span className="relative flex items-center justify-center w-3 h-3">
      {ready && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-50" />
      )}
      <span
        className={`relative inline-flex rounded-full w-2.5 h-2.5 transition-colors duration-300 ${ready ? 'bg-green-400' : 'bg-white/20'
          }`}
      />
    </span>
  );
}

function NetworkIndicator({ quality }: { quality: NetworkQuality }) {
  const config: Record<NetworkQuality, { color: string; label: string }> = {
    good: { color: 'text-green-400', label: 'Good' },
    fair: { color: 'text-yellow-400', label: 'Fair' },
    poor: { color: 'text-red-400', label: 'Poor' },
    checking: { color: 'text-white/40', label: 'Checking…' },
  };
  const { color, label } = config[quality];

  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${color}`}>
      <Wifi size={13} />
      <span>Network: {label}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Lobby() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useStore();

  // ── Room state ──
  const [room, setRoom] = useState<InterviewRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── Media state ──
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [cameraPermission, setCameraPermission] = useState<'pending' | 'granted' | 'denied'>('pending');

  // ── Lobby state ──
  const [isReady, setIsReady] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [copied, setCopied] = useState(false);
  const [networkQuality, setNetworkQuality] = useState<NetworkQuality>('checking');
  const [countdown, setCountdown] = useState<number | null>(null);

  // ── Socket ──
  const socketRef = useRef<Socket | null>(null);

  // ── Fetch room ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!roomId) return;

    roomsApi.getOne(roomId)
      .then((data) => {
        setRoom(data);
        setLoading(false);
      })
      .catch((err) => {
        const msg = err?.response?.data?.error || err?.message || 'Failed to load room';
        setLoadError(msg);
        setLoading(false);
      });
  }, [roomId]);

  // ── Countdown timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!room) return;
    const startTs = (room as any).scheduledAt
      ? new Date((room as any).scheduledAt).getTime()
      : null;
    if (!startTs) { setCountdown(null); return; }

    const tick = () => setCountdown(Math.max(0, startTs - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [room]);

  // ── Media setup ─────────────────────────────────────────────────────────────
  const startMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraPermission('granted');
    } catch {
      setCameraPermission('denied');
    }
  }, []);

  useEffect(() => {
    startMedia();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [startMedia]);

  // ── Mic toggle ──────────────────────────────────────────────────────────────
  const toggleMic = useCallback(() => {
    if (!streamRef.current) return;
    const next = !micOn;
    streamRef.current.getAudioTracks().forEach((t) => { t.enabled = next; });
    setMicOn(next);
    toast(next ? 'Microphone on' : 'Microphone muted');
  }, [micOn]);

  // ── Camera toggle ───────────────────────────────────────────────────────────
  const toggleCam = useCallback(() => {
    if (!streamRef.current) return;
    const next = !camOn;
    streamRef.current.getVideoTracks().forEach((t) => { t.enabled = next; });
    setCamOn(next);
    toast(next ? 'Camera on' : 'Camera off');
  }, [camOn]);

  // ── Socket setup ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!roomId || !user) return;

    const token = localStorage.getItem('standor_token');
    const socket: Socket = io(API_BASE, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-lobby', { roomId, userId: user.id, name: user.name });
    });

    // Seed self as a participant immediately
    setParticipants((prev) => {
      const exists = prev.find((p) => p.userId === user.id);
      if (exists) return prev;
      return [
        ...prev,
        {
          userId: user.id,
          name: user.name,
          role: 'candidate',
          isReady: false,
          joinedAt: Date.now(),
        },
      ];
    });

    socket.on('lobby:participants', (list: Participant[]) => {
      setParticipants(list);
    });

    socket.on('lobby:participant-joined', (p: Participant) => {
      setParticipants((prev) => {
        const exists = prev.find((x) => x.userId === p.userId);
        return exists ? prev : [...prev, p];
      });
      toast(`${p.name} joined the lobby`);
    });

    socket.on('lobby:participant-ready', ({ userId, isReady: ready, name }: { userId: string; isReady: boolean; name: string }) => {
      setParticipants((prev) =>
        prev.map((p) => (p.userId === userId ? { ...p, isReady: ready } : p))
      );
      if (userId !== user.id) {
        toast(ready ? `${name} is ready` : `${name} is not ready`);
      }
    });

    socket.on('lobby:participant-left', ({ userId, name }: { userId: string; name: string }) => {
      setParticipants((prev) => prev.filter((p) => p.userId !== userId));
      toast(`${name} left the lobby`);
    });

    // Network quality estimation via ping
    let pingStart = Date.now();
    const pingInterval = setInterval(() => {
      pingStart = Date.now();
      socket.emit('ping');
    }, 5000);

    socket.on('pong', () => {
      const rtt = Date.now() - pingStart;
      if (rtt < 100) setNetworkQuality('good');
      else if (rtt < 300) setNetworkQuality('fair');
      else setNetworkQuality('poor');
    });

    // Initial quality check via navigator
    if ((navigator as any).connection) {
      const conn = (navigator as any).connection;
      const effectiveType = conn?.effectiveType;
      if (effectiveType === '4g') setNetworkQuality('good');
      else if (effectiveType === '3g') setNetworkQuality('fair');
      else if (effectiveType) setNetworkQuality('poor');
    } else {
      // Fallback: assume good after a short delay
      setTimeout(() => setNetworkQuality('good'), 1500);
    }

    return () => {
      clearInterval(pingInterval);
      socket.emit('leave-lobby', { roomId, userId: user.id, name: user.name });
      socket.disconnect();
    };
  }, [roomId, user]);

  // ── Ready toggle ─────────────────────────────────────────────────────────────
  const handleReadyToggle = useCallback(() => {
    if (!user || !socketRef.current) return;
    const next = !isReady;
    setIsReady(next);
    socketRef.current.emit('presence:ready', { roomId, userId: user.id, isReady: next });
    socketRef.current.emit('lobby:ready', { roomId, userId: user.id, name: user.name, isReady: next });
    setParticipants((prev) =>
      prev.map((p) => (p.userId === user.id ? { ...p, isReady: next } : p))
    );
    toast(next ? 'You are ready!' : 'Marked as not ready');
  }, [isReady, roomId, user]);

  // ── Copy invite link ─────────────────────────────────────────────────────────
  const handleCopyInvite = useCallback(() => {
    const url = `${window.location.origin}/lobby/${roomId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success('Invite link copied to clipboard');
      setTimeout(() => setCopied(false), 2500);
    });
  }, [roomId]);

  // ── Join room ────────────────────────────────────────────────────────────────
  const handleJoin = useCallback(() => {
    // Stop local media before entering session
    streamRef.current?.getTracks().forEach((t) => t.stop());
    navigate(`/meeting/${(room as any).callId || roomId}`);
  }, [navigate, roomId]);

  // ── Loading / error screens ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Loader2 className="animate-spin text-[#137fec]" size={36} />
          <p className="text-white/50 text-sm tracking-wide">Connecting to lobby…</p>
        </motion.div>
      </div>
    );
  }

  if (loadError || !room) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-6">
          <p className="text-red-400 text-sm mb-4">{loadError || 'Room not found'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-white/60 text-sm hover:text-white transition-colors"
          >
            ← Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const diff = DIFFICULTY_STYLES[room.difficulty] ?? DIFFICULTY_STYLES.MEDIUM;
  const langDisplay = LANGUAGE_DISPLAY[room.language?.toLowerCase()] ?? room.language ?? 'Any';
  const allReady = participants.length >= 2 && participants.every((p) => p.isReady);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white overflow-x-hidden">
      {/* Ambient radial gradients */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-[#137fec]/5 blur-[120px]" />
        <div className="absolute top-1/2 -right-60 w-[400px] h-[400px] rounded-full bg-[#af25f4]/4 blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full bg-[#137fec]/3 blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col min-h-screen">

        {/* ── Top bar ── */}
        <motion.header
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm transition-colors group"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>

          <div className="flex items-center gap-3">
            <span className="text-white/20 text-xs uppercase tracking-[0.2em] font-medium">Standor</span>
            <span className="w-px h-4 bg-white/10" />
            <span className="text-white/40 text-xs uppercase tracking-[0.15em]">Lobby</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#137fec] animate-pulse" />
            <span className="text-white/50 text-xs font-medium">{participants.length} in lobby</span>
          </div>
        </motion.header>

        {/* ── Problem title hero ── */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold ${diff.classes}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
              {diff.label}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-white/[0.08] text-white/50 text-xs font-medium bg-white/[0.03]">
              <Code2 size={10} />
              {langDisplay}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {room.problem}
          </h1>
          <p className="text-white/35 text-sm mt-1">
            Room <span className="font-mono text-white/50">{roomId}</span>
          </p>
        </motion.div>

        {/* ── Main 3-column grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">

          {/* ── Column 1: Room Info ── */}
          <motion.div
            className="flex flex-col gap-4"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            {/* Room details card */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] backdrop-blur-sm p-5 flex flex-col gap-4">
              <h2 className="text-xs uppercase tracking-[0.15em] text-white/30 font-semibold">Room Info</h2>

              <div className="flex flex-col gap-3">
                {/* Problem */}
                <InfoRow icon={<Code2 size={14} className="text-[#137fec]" />} label="Problem">
                  <span className="text-white/80 text-sm font-medium truncate">{room.problem}</span>
                </InfoRow>

                {/* Difficulty */}
                <InfoRow
                  icon={<span className={`w-2 h-2 rounded-full ${diff.dot}`} />}
                  label="Difficulty"
                >
                  <span className={`text-sm font-semibold ${diff.classes.split(' ')[0]}`}>
                    {diff.label}
                  </span>
                </InfoRow>

                {/* Language */}
                <InfoRow icon={<Code2 size={14} className="text-white/30" />} label="Language">
                  <span className="text-white/70 text-sm">{langDisplay}</span>
                </InfoRow>

                {/* Duration / scheduled */}
                <InfoRow icon={<Clock size={14} className="text-white/30" />} label="Starts">
                  <span className="text-white/70 text-sm font-mono">
                    {countdown !== null ? formatCountdown(countdown) : 'Now'}
                  </span>
                </InfoRow>
              </div>

              <div className="border-t border-white/[0.06] pt-4">
                <p className="text-xs text-white/25 mb-2 uppercase tracking-widest">Invite link</p>
                <div className="flex items-center gap-2 bg-white/[0.04] rounded-lg px-3 py-2 border border-white/[0.06]">
                  <span className="text-xs text-white/40 truncate flex-1 font-mono">
                    {`${window.location.origin}/lobby/${roomId}`}
                  </span>
                  <button
                    onClick={handleCopyInvite}
                    className="flex-shrink-0 text-white/40 hover:text-white transition-colors"
                    title="Copy invite link"
                  >
                    {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Status card */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] backdrop-blur-sm p-5 flex flex-col gap-3">
              <h2 className="text-xs uppercase tracking-[0.15em] text-white/30 font-semibold">Session Status</h2>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${room.status === 'ACTIVE' ? 'bg-green-400' : 'bg-white/20'}`} />
                <span className="text-white/60 text-sm">{room.status === 'ACTIVE' ? 'Active' : 'Waiting'}</span>
              </div>
              {allReady && (
                <motion.p
                  className="text-xs text-green-400/80 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  All participants ready — you can join now
                </motion.p>
              )}
            </div>
          </motion.div>

          {/* ── Column 2: Video Preview ── */}
          <motion.div
            className="flex flex-col gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
          >
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] backdrop-blur-sm p-5 flex flex-col gap-4 flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-xs uppercase tracking-[0.15em] text-white/30 font-semibold">Your Preview</h2>
                <NetworkIndicator quality={networkQuality} />
              </div>

              {/* Video container */}
              <div className="relative rounded-xl overflow-hidden aspect-video bg-[#0F1722] flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #0F1722 0%, #0B0B0D 100%)',
                  boxShadow: 'inset 0 0 40px rgba(19, 127, 236, 0.06)',
                }}
              >
                {/* Camera feed */}
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`w-full h-full object-cover transition-opacity duration-300 ${camOn && cameraPermission === 'granted' ? 'opacity-100' : 'opacity-0'
                    }`}
                />

                {/* Camera off overlay */}
                <AnimatePresence>
                  {(!camOn || cameraPermission !== 'granted') && (
                    <motion.div
                      key="cam-off"
                      className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="w-14 h-14 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                        {cameraPermission === 'denied' ? (
                          <VideoOff size={22} className="text-white/30" />
                        ) : (
                          <span className="text-xl font-bold text-white/40 select-none">
                            {user?.name?.[0]?.toUpperCase() ?? '?'}
                          </span>
                        )}
                      </div>
                      {cameraPermission === 'denied' && (
                        <p className="text-white/30 text-xs text-center px-4">
                          Camera permission denied
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Name badge */}
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/[0.08] text-xs text-white/70 font-medium">
                  {user?.name ?? 'You'} (You)
                </div>

                {/* Mic indicator */}
                {!micOn && (
                  <div className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-red-500/20 border border-red-500/30">
                    <MicOff size={12} className="text-red-400" />
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                <ControlButton
                  active={micOn}
                  onClick={toggleMic}
                  iconOn={<Mic size={16} />}
                  iconOff={<MicOff size={16} />}
                  labelOn="Mute mic"
                  labelOff="Unmute mic"
                  offColor="red"
                />
                <ControlButton
                  active={camOn}
                  onClick={toggleCam}
                  iconOn={<Video size={16} />}
                  iconOff={<VideoOff size={16} />}
                  labelOn="Turn off camera"
                  labelOff="Turn on camera"
                  offColor="red"
                  disabled={cameraPermission === 'denied'}
                />
              </div>

              {/* Ready toggle */}
              <button
                onClick={handleReadyToggle}
                className={`w-full py-3 rounded-xl border text-sm font-semibold transition-all duration-300 ${isReady
                    ? 'bg-green-400/15 border-green-400/30 text-green-400 hover:bg-green-400/20'
                    : 'bg-white/[0.04] border-white/[0.08] text-white/60 hover:bg-white/[0.07] hover:text-white hover:border-white/[0.15]'
                  }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <ReadyPulse ready={isReady} />
                  {isReady ? 'Ready' : 'Mark as Ready'}
                </span>
              </button>
            </div>
          </motion.div>

          {/* ── Column 3: Participants + Actions ── */}
          <motion.div
            className="flex flex-col gap-4"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
          >
            {/* Participants card */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] backdrop-blur-sm p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs uppercase tracking-[0.15em] text-white/30 font-semibold">Participants</h2>
                <div className="flex items-center gap-1.5 text-white/30">
                  <Users size={13} />
                  <span className="text-xs">{participants.length}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 min-h-[80px]">
                <AnimatePresence mode="popLayout">
                  {participants.length === 0 ? (
                    <motion.p
                      key="empty"
                      className="text-white/25 text-xs text-center py-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Waiting for participants…
                    </motion.p>
                  ) : (
                    participants.map((p) => (
                      <motion.div
                        key={p.userId}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-[#137fec]/20 border border-[#137fec]/20 flex items-center justify-center text-xs font-bold text-[#137fec] flex-shrink-0">
                            {p.name?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white/80 text-sm font-medium truncate">
                              {p.name}
                              {p.userId === user?.id && (
                                <span className="ml-1.5 text-white/25 text-xs font-normal">(you)</span>
                              )}
                            </p>
                            <p className="text-white/30 text-xs capitalize">{p.role}</p>
                          </div>
                        </div>
                        <ReadyPulse ready={p.isReady} />
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              {/* Ready summary */}
              <div className="pt-1 border-t border-white/[0.05] flex items-center justify-between text-xs">
                <span className="text-white/30">
                  {participants.filter((p) => p.isReady).length}/{participants.length} ready
                </span>
                <div className="flex gap-1">
                  {participants.map((p) => (
                    <span
                      key={p.userId}
                      className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${p.isReady ? 'bg-green-400' : 'bg-white/15'
                        }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Actions card */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] backdrop-blur-sm p-5 flex flex-col gap-3">
              <h2 className="text-xs uppercase tracking-[0.15em] text-white/30 font-semibold">Actions</h2>

              {/* Copy invite */}
              <button
                onClick={handleCopyInvite}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.14] text-white/60 hover:text-white text-sm transition-all duration-200 group"
              >
                <span className="flex items-center gap-2 font-medium">
                  {copied ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
                  {copied ? 'Copied!' : 'Copy Invite Link'}
                </span>
                <ChevronRight size={14} className="opacity-40 group-hover:opacity-70 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Join room button */}
              <button
                onClick={handleJoin}
                className={`w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${allReady
                    ? 'bg-[#137fec] hover:bg-[#1a8fff] text-white shadow-lg shadow-[#137fec]/25'
                    : 'bg-[#137fec]/80 hover:bg-[#137fec] text-white'
                  }`}
              >
                {allReady ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                    Join Room
                    <ArrowRight size={16} />
                  </>
                ) : (
                  <>
                    Join Room
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {!allReady && participants.length < 2 && (
                <p className="text-center text-xs text-white/25">
                  Waiting for all participants to join
                </p>
              )}
              {!allReady && participants.length >= 2 && (
                <p className="text-center text-xs text-white/25">
                  Waiting for everyone to mark ready
                </p>
              )}
            </div>

            {/* Tips card */}
            <div className="rounded-2xl border border-white/[0.04] bg-white/[0.015] p-4 flex flex-col gap-2">
              <h3 className="text-xs uppercase tracking-[0.15em] text-white/20 font-semibold">Tips</h3>
              <ul className="flex flex-col gap-1.5">
                {[
                  'Test your mic and camera before joining',
                  'Close unnecessary tabs to reduce lag',
                  'Think out loud — interviewers value communication',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-white/30">
                    <span className="mt-0.5 w-1 h-1 rounded-full bg-white/15 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* ── Footer strip ── */}
        <motion.div
          className="mt-6 flex items-center justify-between text-xs text-white/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <span>Standor Interview Platform</span>
          <span className="font-mono">room/{roomId}</span>
        </motion.div>
      </div>
    </div>
  );
}

// ── Reusable sub-components ───────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06]">
        {icon}
      </span>
      <div className="flex flex-col min-w-0">
        <span className="text-white/30 text-[10px] uppercase tracking-widest leading-none mb-0.5">{label}</span>
        {children}
      </div>
    </div>
  );
}

function ControlButton({
  active,
  onClick,
  iconOn,
  iconOff,
  labelOn,
  labelOff,
  offColor = 'neutral',
  disabled = false,
}: {
  active: boolean;
  onClick: () => void;
  iconOn: React.ReactNode;
  iconOff: React.ReactNode;
  labelOn: string;
  labelOff: string;
  offColor?: 'red' | 'neutral';
  disabled?: boolean;
}) {
  const offBg =
    offColor === 'red'
      ? 'bg-red-500/15 border-red-500/25 text-red-400 hover:bg-red-500/25'
      : 'bg-white/[0.06] border-white/[0.08] text-white/50 hover:text-white';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={active ? labelOn : labelOff}
      className={`flex items-center justify-center w-11 h-11 rounded-xl border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${active
          ? 'bg-white/[0.06] border-white/[0.08] text-white hover:bg-white/[0.1]'
          : offBg
        }`}
    >
      {active ? iconOn : iconOff}
    </button>
  );
}
