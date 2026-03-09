import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Video,
    VideoOff,
    Mic,
    MicOff,
    ArrowRight,
    Keyboard,
    User as UserIcon,
    ShieldCheck,
    Loader2
} from 'lucide-react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import useStore from '../store/useStore';

const API_BASE = import.meta.env?.VITE_BACKEND_URL || 'http://localhost:4000';

export default function JoinMeeting() {
    const { code: urlCode } = useParams<{ code: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, setAuth } = useStore();

    const [code, setCode] = useState(urlCode || '');
    const [guestName, setGuestName] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [step, setStep] = useState<'CODE' | 'PREVIEW' | 'WAITING'>(urlCode ? 'PREVIEW' : 'CODE');

    // Media Preview
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [cameraPermission, setCameraPermission] = useState<'pending' | 'granted' | 'denied'>('pending');

    const startMedia = useCallback(async () => {
        try {
            if (streamRef.current) return;
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setCameraPermission('granted');
        } catch (err) {
            console.error('Media error:', err);
            setCameraPermission('denied');
        }
    }, []);

    const stopMedia = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (step === 'WAITING' && code) {
            const socket = io(API_BASE, {
                auth: { token: localStorage.getItem('standor_token') }
            });

            socket.on('connect', () => {
                socket.emit('join-meeting-waiting-room', { code: code.trim() });
            });

            socket.on('meeting:admitted', () => {
                toast.success('Admitted to meeting');
                localStorage.setItem('standor_meeting_prefs', JSON.stringify({ micOn, camOn }));
                navigate(`/meeting/${code.trim()}`);
            });

            socket.on('meeting:denied', () => {
                toast.error('The host denied your request to join.');
                setStep('PREVIEW');
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [step, code, navigate, micOn, camOn]);

    useEffect(() => {
        if (step === 'PREVIEW') {
            startMedia();
        } else {
            stopMedia();
        }
        return () => stopMedia();
    }, [step, startMedia, stopMedia]);

    const handleNext = async () => {
        if (!code) return;
        setIsJoining(true);
        try {
            const { data } = await axios.get(`${API_BASE}/api/meetings/${code.trim()}`);
            if (data) {
                setStep('PREVIEW');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Meeting not found');
        } finally {
            setIsJoining(false);
        }
    };

    const handleJoin = async () => {
        setIsJoining(true);
        try {
            const meetingCode = code.trim();
            let joinData = { joined: true };

            if (!user) {
                // Guest Join
                if (!guestName.trim()) {
                    toast.error('Please enter your name');
                    setIsJoining(false);
                    return;
                }
                const { data } = await axios.post(`${API_BASE}/api/meetings/${meetingCode}/guest-join`, {
                    name: guestName.trim()
                });
                setAuth(data.user, data.token);
                localStorage.setItem('standor_token', data.token);

                if (data.status === 'WAITING_ROOM') {
                    setStep('WAITING');
                    return;
                }
            } else {
                // Authenticated Join
                const { data } = await axios.post(`${API_BASE}/api/meetings/${meetingCode}/join`, {}, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('standor_token')}` }
                });

                if (data.status === 'WAITING_ROOM') {
                    setStep('WAITING');
                    return;
                }
            }

            // Store device preferences in local storage for the meeting room
            localStorage.setItem('standor_meeting_prefs', JSON.stringify({ micOn, camOn }));

            navigate(`/meeting/${meetingCode}`);
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to join meeting');
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background radial glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-4xl relative z-10">
                <header className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-6"
                    >
                        <ShieldCheck size={14} className="text-white/60" />
                        <span className="text-xs font-semibold tracking-widest text-white/40 uppercase">Encrypted Session</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
                    >
                        {step === 'CODE' ? 'Standor Meetings' : 'Ready to join?'}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-white/40 text-sm max-w-md mx-auto"
                    >
                        {step === 'CODE' ? 'Experience the future of real-time collaboration. Enter a code to start.' : 'Customize your profile and check your setup before entering the room.'}
                    </motion.p>
                </header>

                <main className="flex flex-col items-center">
                    <AnimatePresence mode="wait">
                        {step === 'CODE' ? (
                            <motion.div
                                key="step-code"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="w-full max-w-sm"
                            >
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <Keyboard className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/60 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Enter meeting code"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                                            className="w-full bg-[#0A0A0A] border border-white/[0.1] rounded-2xl py-4 pl-12 pr-4 text-center text-xl font-mono tracking-widest focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
                                        />
                                    </div>
                                    <button
                                        onClick={handleNext}
                                        disabled={!code || isJoining}
                                        className="w-full bg-white text-black h-14 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                                    >
                                        {isJoining ? <Loader2 size={20} className="animate-spin" /> : (
                                            <>
                                                Continue
                                                <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>
                                    <p className="text-center text-white/20 text-xs">
                                        Format: abc-defg-hij
                                    </p>
                                </div>
                            </motion.div>
                        ) : step === 'PREVIEW' ? (
                            <motion.div
                                key="step-preview"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
                            >
                                {/* Visual Setup */}
                                <div className="space-y-4">
                                    <div className="aspect-video bg-[#0A0A0A] rounded-3xl border border-white/[0.08] relative overflow-hidden group">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            muted
                                            playsInline
                                            className={`w-full h-full object-cover transition-opacity duration-700 ${camOn && cameraPermission === 'granted' ? 'opacity-100' : 'opacity-0'}`}
                                        />

                                        {!camOn || cameraPermission !== 'granted' ? (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xl">
                                                <div className="w-16 h-16 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center mb-3">
                                                    <VideoOff size={24} className="text-white/40" />
                                                </div>
                                                <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Camera is off</p>
                                            </div>
                                        ) : null}

                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <button
                                                onClick={() => setMicOn(!micOn)}
                                                className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${micOn ? 'bg-white/10 border-white/20 text-white' : 'bg-red-500/20 border-red-500/30 text-red-500'}`}
                                            >
                                                {micOn ? <Mic size={20} /> : <MicOff size={20} />}
                                            </button>
                                            <button
                                                onClick={() => setCamOn(!camOn)}
                                                className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${camOn ? 'bg-white/10 border-white/20 text-white' : 'bg-red-500/20 border-red-500/30 text-red-500'}`}
                                            >
                                                {camOn ? <Video size={20} /> : <VideoOff size={20} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between px-2">
                                        <div className="flex items-center gap-2 text-white/40">
                                            <div className={`w-2 h-2 rounded-full ${micOn ? 'bg-green-500' : 'bg-white/10'}`} />
                                            <span className="text-[10px] uppercase tracking-widest font-bold">Audio check</span>
                                        </div>
                                        <button onClick={() => setStep('CODE')} className="text-white/30 text-xs hover:text-white transition-colors">
                                            Change Room
                                        </button>
                                    </div>
                                </div>

                                {/* Profile Setup */}
                                <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-3xl p-8 space-y-8">
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">Participant Details</h3>
                                            {user ? (
                                                <div className="flex items-center gap-4 py-3">
                                                    <div className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center">
                                                        <span className="text-lg font-bold">{(user as any).name?.[0] || 'U'}</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold">{(user as any).name}</p>
                                                        <p className="text-xs text-white/40">{user.email}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="relative group">
                                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/60 transition-colors" size={18} />
                                                    <input
                                                        type="text"
                                                        placeholder="Your Name (for guests)"
                                                        value={guestName}
                                                        onChange={(e) => setGuestName(e.target.value)}
                                                        className="w-full bg-black/40 border border-white/[0.1] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-white/30 transition-all"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3 pt-4">
                                            <button
                                                onClick={handleJoin}
                                                disabled={isJoining}
                                                className="w-full bg-white text-black h-14 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all active:scale-[0.98]"
                                            >
                                                {isJoining ? <Loader2 size={20} className="animate-spin" /> : (
                                                    <>
                                                        Join Meeting Now
                                                        <ArrowRight size={18} />
                                                    </>
                                                )}
                                            </button>
                                            <p className="text-center text-[10px] text-white/20 uppercase tracking-widest">
                                                Joining as {user ? 'Verified User' : 'Guest'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step-waiting"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center text-center space-y-6 max-w-sm"
                            >
                                <div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center relative">
                                    <Loader2 className="animate-spin text-white/40" size={32} />
                                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-white text-black rounded-full flex items-center justify-center shadow-lg">
                                        <ShieldCheck size={14} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold">Waiting to be admitted...</h3>
                                    <p className="text-white/40 text-xs leading-relaxed">
                                        The host has been notified that you'd like to join. You'll be admitted as soon as they approve.
                                    </p>
                                </div>
                                <div className="w-full pt-4">
                                    <button
                                        onClick={() => setStep('PREVIEW')}
                                        className="text-white/20 text-xs uppercase tracking-widest font-bold hover:text-white transition-colors"
                                    >
                                        Cancel Request
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>

                <footer className="mt-20 flex items-center justify-center gap-12 border-t border-white/[0.05] pt-10">
                    <div className="flex items-center gap-3 text-white/20 text-[10px] uppercase tracking-[0.2em] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500/60 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                        End-to-End Encrypted
                    </div>
                    <div className="flex items-center gap-3 text-white/20 text-[10px] uppercase tracking-[0.2em] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500/60 shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                        Edge Relays Active
                    </div>
                </footer>
            </div>
        </div>
    );
}
