import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import {
    Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff,
    Users, MessageSquare, Hand, Smile, Share, Settings,
    MoreVertical, Send,
    Shield,
    Terminal,
    Code2,
    Copy,
    Check,
    Minimize2,
    Maximize2,
    Info, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import Editor from '@monaco-editor/react';
import useStore from '../store/useStore';
import { MediaProvider, useMedia } from '../components/session/MediaProvider';

const API_BASE = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:4000';

interface Participant {
    userId: string;
    name: string;
    role: string;
    micOn: boolean;
    camOn: boolean;
    handRaised?: boolean;
}

interface PendingParticipant {
    userId?: string;
    name: string;
    isGuest: boolean;
    requestedAt: string;
}

interface ChatMessage {
    sender: string;
    text: string;
    ts: number;
}

function MeetingInner({ socket, code }: { socket: Socket | null; code: string }) {
    const navigate = useNavigate();
    const { user } = useStore();
    const {
        localStream,
        remoteStreams,
        joinMedia,
        leaveMedia,
        toggleAudio,
        toggleVideo,
        audioEnabled,
        videoEnabled,
    } = useMedia();

    const [participants, setParticipants] = useState<Participant[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [sidebar, setSidebar] = useState<'CHAT' | 'USERS' | 'WAITING' | null>(null);
    const [pendingParticipants, setPendingParticipants] = useState<PendingParticipant[]>([]);
    const [handRaised, setHandRaised] = useState(false);
    const [isHost, setIsHost] = useState(false);

    const [codingMode, setCodingMode] = useState(false);
    const [codeContent, setCodeContent] = useState('// Your code here...');
    const [codeLanguage, setCodeLanguage] = useState('javascript');
    const [editorAccess, setEditorAccess] = useState<string[]>([]);

    const chatEndRef = useRef<HTMLDivElement>(null);

    const [admitted, setAdmitted] = useState(false);

    // Initial Join
    useEffect(() => {
        if (!socket || !user) return;

        socket.emit('join-meeting', { code, userId: user.id || (user as any)._id, name: user.name });
        joinMedia(code, user.id || (user as any)._id, user.name);

        socket.on('meeting:participants', (list: Participant[]) => {
            setParticipants(list);
            const isMeAdmitted = list.some(p => p.userId === (user.id || (user as any)._id));
            if (isMeAdmitted) setAdmitted(true);
        });

        socket.on('meeting:admitted', () => {
            setAdmitted(true);
            toast.success('You have been admitted to the meeting');
        });

        socket.on('meeting:participant-joined', (p: Participant) => {
            setParticipants(prev => {
                const exists = prev.find(x => x.userId === p.userId);
                return exists ? prev : [...prev, p];
            });
            toast(`${p.name} joined`);
        });

        socket.on('meeting:participant-left', ({ userId, name }) => {
            setParticipants(prev => prev.filter(p => p.userId !== userId));
            toast(`${name} left`);
        });

        socket.on('meeting:chat-message', (msg: ChatMessage) => {
            setMessages(prev => [...prev, msg]);
        });

        socket.on('meeting:mic-status', ({ userId, micOn }) => {
            setParticipants(prev => prev.map(p => p.userId === userId ? { ...p, micOn } : p));
        });

        socket.on('meeting:cam-status', ({ userId, camOn }) => {
            setParticipants(prev => prev.map(p => p.userId === userId ? { ...p, camOn } : p));
        });

        socket.on('meeting:hand-raised', ({ userId, raised }) => {
            setParticipants(prev => prev.map(p => p.userId === userId ? { ...p, handRaised: raised } : p));
            if (raised) {
                const p = participants.find(x => x.userId === userId);
                if (p) toast(`${p.name} raised their hand`, { icon: '✋' });
            }
        });

        socket.on('meeting:info', (info: any) => {
            setIsHost(info.hostId === user.id || info.hostId === (user as any)._id);
            if (info.hostId === (user.id || (user as any)._id)) setAdmitted(true);
            if (info.pendingParticipants) setPendingParticipants(info.pendingParticipants);
            if (info.codingModeEnabled !== undefined) setCodingMode(info.codingModeEnabled);
            if (info.editorAccess) setEditorAccess(info.editorAccess);
            if (info.code) setCodeContent(info.code);
            if (info.language) setCodeLanguage(info.language);
        });

        socket.on('meeting:editor-access-updated', (accessList: string[]) => {
            setEditorAccess(accessList);
            const hasAccess = accessList.includes(user.id || (user as any)._id);
            if (hasAccess) {
                toast.success('You have been granted editor access');
            } else {
                toast.info('Editor access updated');
            }
        });

        socket.on('meeting:coding-toggled', ({ enabled }) => {
            setCodingMode(enabled);
            toast(enabled ? 'Host enabled coding mode' : 'Host disabled coding mode', { icon: enabled ? '💻' : '🎥' });
        });

        socket.on('coding:sync', ({ code: newCode, language }) => {
            setCodeContent(newCode);
            if (language) setCodeLanguage(language);
        });

        socket.on('meeting:pending-list-updated', (list: PendingParticipant[]) => {
            setPendingParticipants(list);
        });

        socket.on('meeting:ended', () => {
            toast.error('The meeting has been ended by the host.');
            navigate('/dashboard');
        });

        return () => {
            socket.off('meeting:participants');
            socket.off('meeting:participant-joined');
            socket.off('meeting:participant-left');
            socket.off('meeting:chat-message');
            socket.off('meeting:media-status');
            socket.off('meeting:hand-raised');
            socket.off('meeting:coding-toggled');
            socket.off('coding:sync');
            socket.off('meeting:pending-list-updated');
            socket.off('meeting:ended');
        };
    }, [socket, code, user, joinMedia, navigate, participants]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, sidebar]);

    const handleLeave = () => {
        if (window.confirm('Leave the meeting?')) {
            leaveMedia();
            navigate('/dashboard');
        }
    };

    const handleToggleMic = () => {
        const next = !audioEnabled;
        toggleAudio();
        socket?.emit('meeting:mic-toggle', { code, micOn: next });
    };

    const handleToggleCam = () => {
        const next = !videoEnabled;
        toggleVideo();
        socket?.emit('meeting:cam-toggle', { code, camOn: next });
    };

    const handleRaiseHand = () => {
        const next = !handRaised;
        setHandRaised(next);
        socket?.emit('meeting:hand-raise', { code, raised: next });
    };

    const sendChat = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        socket?.emit('meeting:chat', { code, text: chatInput.trim() });
        setChatInput('');
    };

    const handleAdmit = (pendingUserId: string) => {
        socket?.emit('meeting:admit', { code, pendingUserId });
    };

    const handleDeny = (pendingUserId: string) => {
        socket?.emit('meeting:deny', { code, pendingUserId });
    };

    const handleEndMeeting = () => {
        if (window.confirm('End the meeting for everyone?')) {
            socket?.emit('meeting:end-for-all', { code });
        }
    };

    const toggleCodingMode = () => {
        socket?.emit('meeting:toggle-coding', { code, enabled: !codingMode });
    };

    const handleCodeChange = (newVal: string | undefined) => {
        if (newVal === undefined) return;
        setCodeContent(newVal);
        socket?.emit('coding:update', { code, newCode: newVal, language: codeLanguage });
    };

    const grantAccess = (userId: string) => {
        socket?.emit('meeting:grant-editor-access', { code, userId });
    };

    const revokeAccess = (userId: string) => {
        socket?.emit('meeting:revoke-editor-access', { code, userId });
    };

    const canEdit = isHost || editorAccess.includes(user?.id || (user as any)?._id);

    // Video Grid Helper
    const allStreams = Array.from(remoteStreams.entries());
    const gridCount = allStreams.length + (localStream ? 1 : 0);

    if (!admitted && !isHost) {
        return (
            <div className="h-screen bg-[#000000] text-white flex flex-col items-center justify-center p-6 text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center relative">
                    <Loader2 className="animate-spin text-white/40" size={32} />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#137fec] text-white rounded-full flex items-center justify-center shadow-lg">
                        <Shield size={14} />
                    </div>
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold tracking-tight">Waiting for host to admit you...</h3>
                    <p className="text-white/40 text-sm max-w-xs mx-auto leading-relaxed">
                        Stay on this screen. You'll be admitted as soon as the interviewer is ready.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="mt-4 px-6 py-2 rounded-xl bg-white/05 border border-white/10 text-white/40 text-xs font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
                >
                    Leave Room
                </button>
            </div>
        );
    }

    return (
        <div className="h-screen bg-[#000000] text-white flex flex-col overflow-hidden font-sans">
            {/* Top Header */}
            <header className="h-14 border-b border-white/[0.05] px-6 flex items-center justify-between shrink-0 bg-[#050505] z-30">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Shield size={16} className="text-white/40" />
                        <h1 className="text-sm font-bold tracking-tight">{code}</h1>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(code);
                                toast.success('Meeting code copied');
                            }}
                            className="p-1 px-1.5 rounded bg-white/05 hover:bg-white/10 text-white/40 hover:text-white transition-all ml-1"
                        >
                            <Copy size={12} />
                        </button>
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08]">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Live</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {isHost && pendingParticipants.length > 0 && (
                        <button
                            onClick={() => setSidebar('WAITING')}
                            className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white text-black hover:bg-neutral-200"
                        >
                            <Shield size={16} />
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] flex items-center justify-center rounded-full border border-black font-bold">
                                {pendingParticipants.length}
                            </span>
                        </button>
                    )}
                    <div className="flex items-center gap-2 text-white/30">
                        <Users size={14} />
                        <span className="text-xs font-medium">{participants.length}</span>
                    </div>
                    <button className="text-white/40 hover:text-white transition-colors">
                        <Settings size={18} />
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex overflow-hidden relative">
                <div className="flex-1 min-w-0 h-full relative p-4 flex gap-4 overflow-hidden">
                    {/* Video Grid Section */}
                    <div className={`flex-1 transition-all duration-500 ${codingMode ? 'flex-[0.4]' : 'flex-1'}`}>
                        <div className={`grid h-full gap-4 transition-all duration-500 ${gridCount === 1 ? 'grid-cols-1' :
                            gridCount === 2 ? (codingMode ? 'grid-cols-1' : 'grid-cols-2') :
                                gridCount <= 4 ? 'grid-cols-2' : 'grid-cols-3'
                            }`}>
                            {localStream && (
                                <VideoCard
                                    stream={localStream}
                                    name={user?.name || 'You'}
                                    isLocal
                                    micOn={audioEnabled}
                                    camOn={videoEnabled}
                                    handRaised={handRaised}
                                />
                            )}
                            {allStreams.map(([userId, stream]) => {
                                const p = participants.find(x => x.userId === userId);
                                return (
                                    <VideoCard
                                        key={userId}
                                        stream={stream}
                                        name={p?.name || 'Participant'}
                                        micOn={p?.micOn ?? true}
                                        camOn={p?.camOn ?? true}
                                        handRaised={p?.handRaised}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Coding Editor Section */}
                    <AnimatePresence>
                        {codingMode && (
                            <motion.div
                                initial={{ x: 100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 100, opacity: 0 }}
                                className="flex-[0.6] bg-[#0A0A0A] rounded-3xl border border-white/[0.08] flex flex-col overflow-hidden shadow-2xl relative group"
                            >
                                <div className="h-12 border-b border-white/[0.05] px-4 flex items-center justify-between bg-white/[0.02]">
                                    <div className="flex items-center gap-2">
                                        <Terminal size={14} className="text-white/40" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Collaborative Editor</span>
                                        <span className="ml-2 text-[8px] bg-white text-black px-1.5 py-0.5 rounded font-bold uppercase">{codeLanguage}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="p-1.5 text-white/40 hover:text-white hover:bg-white/05 rounded-lg transition-colors">
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 relative">
                                    <Editor
                                        height="100%"
                                        language={codeLanguage}
                                        value={codeContent}
                                        theme="vs-dark"
                                        onChange={handleCodeChange}
                                        options={{
                                            readOnly: !canEdit,
                                            minimap: { enabled: false },
                                            fontSize: 14,
                                            padding: { top: 20 },
                                            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                            smoothScrolling: true,
                                            cursorBlinking: 'smooth',
                                            cursorSmoothCaretAnimation: 'on',
                                            scrollbar: {
                                                vertical: 'hidden',
                                                horizontal: 'hidden'
                                            }
                                        }}
                                    />
                                </div>
                                <div className="h-8 px-4 flex items-center justify-between border-t border-white/[0.05] bg-white/[0.01]">
                                    <span className="text-[9px] text-white/20 font-mono italic">Changes are synced in real-time</span>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[9px] text-white/30 font-bold uppercase">Live</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Sidebar */}
                <AnimatePresence>
                    {sidebar && (
                        <motion.aside
                            initial={{ x: 320 }}
                            animate={{ x: 0 }}
                            exit={{ x: 320 }}
                            className="w-80 h-full bg-[#050505] border-l border-white/[0.05] flex flex-col z-20 shadow-2xl shrink-0"
                        >
                            <div className="h-14 border-b border-white/[0.05] px-4 flex items-center justify-between">
                                <h2 className="text-xs uppercase tracking-widest font-bold text-white/60">
                                    {sidebar === 'CHAT' ? 'Meeting Chat' : sidebar === 'USERS' ? 'Participants' : 'Waiting Room'}
                                </h2>
                                <button onClick={() => setSidebar(null)} className="text-white/40 hover:text-white">
                                    <MoreVertical size={16} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                {sidebar === 'CHAT' ? (
                                    <div className="space-y-4">
                                        {messages.map((msg, i) => (
                                            <div key={i} className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-white/40">{msg.sender}</span>
                                                    <span className="text-[9px] text-white/20">{new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <p className="text-xs text-white/80 bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.05]">
                                                    {msg.text}
                                                </p>
                                            </div>
                                        ))}
                                        <div ref={chatEndRef} />
                                    </div>
                                ) : sidebar === 'USERS' ? (
                                    <div className="space-y-3">
                                        {participants.map((p) => (
                                            <div key={p.userId} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-xs font-bold text-white">
                                                        {p.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold">{p.name}</p>
                                                        <p className="text-[10px] text-white/30 uppercase tracking-tighter">{p.role}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isHost && p.role !== 'host' && (
                                                        <button
                                                            onClick={() => editorAccess.includes(p.userId) ? revokeAccess(p.userId) : grantAccess(p.userId)}
                                                            className={`text-[9px] font-bold uppercase px-2 py-1 rounded transition-colors ${editorAccess.includes(p.userId) ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-white/05 text-white/40 border border-white/10 hover:bg-white/10 hover:text-white'}`}
                                                        >
                                                            {editorAccess.includes(p.userId) ? 'Revoke Editor' : 'Grant Editor'}
                                                        </button>
                                                    )}
                                                    {!p.micOn && <MicOff size={12} className="text-red-500/60" />}
                                                    {!p.camOn && <VideoOff size={12} className="text-red-500/60" />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {pendingParticipants.length === 0 ? (
                                            <div className="py-12 text-center text-white/20 text-xs uppercase tracking-widest italic">
                                                No pending requests
                                            </div>
                                        ) : (
                                            pendingParticipants.map((p) => (
                                                <div key={p.userId || p.name} className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-2xl space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-white/[0.05] flex items-center justify-center font-bold text-sm">
                                                            {p.name[0]}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold">{p.name}</p>
                                                            <p className="text-[10px] text-white/30 italic">Wants to join...</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleAdmit(p.userId || p.name)}
                                                            className="flex-1 h-8 bg-white text-black text-[10px] font-bold uppercase rounded-lg hover:bg-neutral-200 transition-colors"
                                                        >
                                                            Admit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeny(p.userId || p.name)}
                                                            className="flex-1 h-8 bg-white/[0.05] text-white/60 text-[10px] font-bold uppercase rounded-lg hover:bg-white/[0.1] transition-colors border border-white/[0.05]"
                                                        >
                                                            Deny
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            {sidebar === 'CHAT' && (
                                <form onSubmit={sendChat} className="p-4 border-t border-white/[0.05] flex gap-2">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        placeholder="Send a message..."
                                        className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-white/20"
                                    />
                                    <button type="submit" className="w-9 h-9 flex items-center justify-center bg-white text-black rounded-xl hover:bg-neutral-200 transition-colors">
                                        <Send size={16} />
                                    </button>
                                </form>
                            )}
                        </motion.aside>
                    )}
                </AnimatePresence>
            </main>

            {/* Empty States if only 1 person - Moved inside grid for better layout or kept outside if preferred */}
            {gridCount === 1 && !codingMode && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
                    <div className="flex flex-col items-center justify-center border border-dashed border-white/[0.05] rounded-3xl bg-[#050505]/40 backdrop-blur-sm p-12 max-w-md text-center pointer-events-auto">
                        <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mb-4">
                            <Info size={24} className="text-white/20" />
                        </div>
                        <p className="text-white/20 text-sm font-medium tracking-tight">Wait for others to join using the code:<br /><span className="text-white/40 font-mono mt-2 block">{code}</span></p>
                    </div>
                </div>
            )}

            {/* Control Bar */}
            <footer className="h-20 bg-[#050505] border-t border-white/[0.05] px-8 flex items-center justify-between shrink-0 z-30">
                <div className="hidden sm:flex items-center gap-4 text-white/30">
                    <div className="text-xs font-mono">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="text-xs font-semibold tracking-tight">{code}</div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                    <ControlButton
                        active={audioEnabled}
                        onClick={handleToggleMic}
                        iconOn={<Mic size={20} />}
                        iconOff={<MicOff size={20} />}
                    />
                    <ControlButton
                        active={videoEnabled}
                        onClick={handleToggleCam}
                        iconOn={<VideoIcon size={20} />}
                        iconOff={<VideoOff size={20} />}
                    />
                    <ControlButton
                        active={handRaised}
                        onClick={handleRaiseHand}
                        iconOn={<Hand size={20} />}
                    />

                    <div className="h-4 w-px bg-white/10 mx-1" />

                    {isHost && (
                        <ControlButton
                            active={codingMode}
                            onClick={toggleCodingMode}
                            iconOn={<Code2 size={20} />}
                            colorClass="text-indigo-400"
                        />
                    )}

                    <button
                        onClick={() => setSidebar(sidebar === 'CHAT' ? null : 'CHAT')}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${sidebar === 'CHAT' ? 'bg-white text-black' : 'text-white/40 hover:bg-white/05'}`}
                    >
                        <MessageSquare size={18} />
                    </button>
                    <button
                        onClick={() => setSidebar(sidebar === 'USERS' ? null : 'USERS')}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors relative ${sidebar === 'USERS' ? 'bg-white text-black' : 'text-white/40 hover:bg-white/05'}`}
                    >
                        <Users size={18} />
                        {isHost && pendingParticipants.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-black animate-pulse">
                                {pendingParticipants.length}
                            </span>
                        )}
                    </button>

                    <div className="h-4 w-px bg-white/10 mx-1" />

                    {isHost ? (
                        <button
                            onClick={handleEndMeeting}
                            className="h-10 sm:h-12 px-4 sm:px-6 bg-red-500 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-red-600 transition-all active:scale-[0.98]"
                        >
                            <PhoneOff size={18} />
                            <span className="hidden sm:inline">End Meeting</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleLeave}
                            className="h-10 sm:h-12 px-4 sm:px-6 bg-[#1A1A1A] border border-white/[0.1] text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-[#252525] transition-all active:scale-[0.98]"
                        >
                            <PhoneOff size={18} className="text-red-500" />
                            <span className="hidden sm:inline">Leave</span>
                        </button>
                    )}
                </div>
            </footer>
        </div >
    );
}

function VideoCard({
    stream,
    name,
    isLocal,
    micOn,
    camOn,
    handRaised,
    isSpeaking = false
}: {
    stream: MediaStream;
    name: string;
    isLocal?: boolean;
    micOn: boolean;
    camOn: boolean;
    handRaised?: boolean;
    isSpeaking?: boolean;
}) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <motion.div
            layout
            className={`relative aspect-video bg-[#0A0A0A] rounded-3xl border overflow-hidden group shadow-2xl transition-all duration-300 ${isSpeaking ? 'border-indigo-500 ring-4 ring-indigo-500/20' : 'border-white/[0.08]'
                }`}
        >
            <video
                ref={videoRef}
                autoPlay
                muted={isLocal}
                playsInline
                className={`w-full h-full object-cover transition-opacity duration-1000 ${camOn ? 'opacity-100' : 'opacity-0'}`}
            />

            <AnimatePresence>
                {!camOn && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center bg-[#080808]"
                    >
                        <div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center shadow-2xl">
                            <span className="text-3xl font-bold text-white/40">{name[0]}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Overlays */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
                <div className="px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/[0.1] text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-indigo-400 animate-pulse' : 'bg-white/20'}`} />
                    {name} {isLocal && '(You)'}
                </div>

                <div className="flex gap-2">
                    {!micOn && (
                        <div className="p-2 rounded-lg bg-red-500/20 backdrop-blur-md border border-red-500/30">
                            <MicOff size={12} className="text-red-500" />
                        </div>
                    )}
                </div>
            </div>

            {handRaised && (
                <motion.div
                    initial={{ scale: 0, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="absolute bottom-4 right-4 w-10 h-10 bg-yellow-500 text-black rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/20"
                >
                    <Hand size={20} fill="currentColor" />
                </motion.div>
            )}

            <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 hover:text-white">
                <Maximize2 size={20} />
            </button>
        </motion.div>
    );
}

function ControlButton({ active = true, onClick, iconOn, iconOff, colorClass = "" }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-95 border ${active
                ? `bg-white/[0.05] border-white/[0.08] text-white hover:bg-white/[0.1] ${colorClass}`
                : 'bg-red-500/20 border-red-500/30 text-red-500 hover:bg-red-500/30'
                }`}
        >
            {!active && iconOff ? iconOff : iconOn}
        </button>
    );
}

export default function MeetingRoom() {
    const { code } = useParams<{ code: string }>();
    const [socket, setSocket] = useState<Socket | null>(null);
    const { token } = useStore();

    useEffect(() => {
        if (!token) return;
        const s = io(API_BASE, {
            auth: { token },
            transports: ['websocket', 'polling']
        });
        setSocket(s);
        return () => { s.disconnect(); };
    }, [token]);

    if (!code) return null;

    return (
        <MediaProvider socket={socket}>
            <MeetingRoomWithMedia socket={socket} code={code} />
        </MediaProvider>
    );
}

function MeetingRoomWithMedia({ socket, code }: { socket: Socket | null; code: string }) {
    const { localStream } = useMedia();

    // Wait for local stream to be ready before showing UI
    if (!localStream) {
        return (
            <div className="h-screen bg-black flex flex-col items-center justify-center gap-6">
                <Loader2 className="animate-spin text-white/20" size={40} />
                <p className="text-white/20 text-xs uppercase tracking-[0.2em] font-bold">Initializing Secure Stream</p>
            </div>
        );
    }

    return <MeetingInner socket={socket} code={code} />;
}
