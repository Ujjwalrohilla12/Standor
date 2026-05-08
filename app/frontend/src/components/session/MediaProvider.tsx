import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { toast } from 'sonner';

interface MediaContextType {
    localStream: MediaStream | null;
    remoteStreams: Map<string, MediaStream>;
    remoteNames: Map<string, string>;          // socketId → display name
    remoteSocketToUserId: Map<string, string>; // socketId → userId
    audioEnabled: boolean;
    videoEnabled: boolean;
    toggleAudio: () => void;
    toggleVideo: () => void;
    joinMedia: (roomId: string, userId: string, userName: string) => void;
    leaveMedia: () => void;
    getPeerConnections: () => Map<string, RTCPeerConnection>;
}

const MediaContext = createContext<MediaContextType | null>(null);

export const useMedia = () => {
    const context = useContext(MediaContext);
    if (!context) throw new Error('useMedia must be used within a MediaProvider');
    return context;
};

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

export const MediaProvider: React.FC<{ socket: Socket | null; children: React.ReactNode }> = ({ socket, children }) => {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);

    const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
    const currentRoomId = useRef<string | null>(null);
    const currentUserId = useRef<string | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);

    const remoteNamesRef = useRef<Map<string, string>>(new Map());
    const remoteSocketToUserIdRef = useRef<Map<string, string>>(new Map());
    const [remoteNames, setRemoteNames] = useState<Map<string, string>>(new Map());
    const [remoteSocketToUserId, setRemoteSocketToUserId] = useState<Map<string, string>>(new Map());
    // ICE candidates that arrived before setRemoteDescription was called
    const pendingCandidates = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

    useEffect(() => {
        localStreamRef.current = localStream;
    }, [localStream]);

    // When localStream changes (e.g. after getUserMedia resolves or track re-enabled),
    // add any new tracks to already-established peer connections.
    useEffect(() => {
        if (!localStream) return;
        for (const pc of peerConnections.current.values()) {
            if (pc.signalingState === 'closed') continue;
            localStream.getTracks().filter(t => t.readyState === 'live').forEach(track => {
                if (!pc.getSenders().some(s => s.track?.id === track.id)) {
                    pc.addTrack(track, localStream);
                }
            });
        }
    }, [localStream]);

    const stopAndRemoveTrack = async (kind: 'audio' | 'video') => {
        if (!localStream) return;

        const tracksToRemove = localStream.getTracks().filter(track => track.kind === kind);
        tracksToRemove.forEach(track => {
            track.stop();
            localStream.removeTrack(track);
        });

        for (const pc of peerConnections.current.values()) {
            const sender = pc.getSenders().find(s => s.track?.kind === kind);
            if (sender) {
                await sender.replaceTrack(null);
            }
        }

        const remaining = localStream.getTracks();
        setLocalStream(remaining.length ? new MediaStream(remaining) : null);
    };

    const startTrack = async (kind: 'audio' | 'video') => {
        const freshStream = await navigator.mediaDevices.getUserMedia({
            audio: kind === 'audio',
            video: kind === 'video',
        });
        const newTrack = kind === 'audio' ? freshStream.getAudioTracks()[0] : freshStream.getVideoTracks()[0];
        if (!newTrack) return;

        const base = localStream ? new MediaStream(localStream.getTracks()) : new MediaStream();
        base.addTrack(newTrack);

        for (const pc of peerConnections.current.values()) {
            const sender = pc.getSenders().find(s => s.track?.kind === kind);
            if (sender) {
                await sender.replaceTrack(newTrack);
            } else {
                pc.addTrack(newTrack, base);
            }
        }

        setLocalStream(base);
    };

    const stopAllLocalTracks = () => {
        const activeStream = localStreamRef.current;
        if (!activeStream) return;
        activeStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
        setAudioEnabled(false);
        setVideoEnabled(false);
    };

    // Initialize local media
    useEffect(() => {
        const initMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });
                setLocalStream(stream);
                setAudioEnabled(stream.getAudioTracks().length > 0);
                setVideoEnabled(stream.getVideoTracks().length > 0);
            } catch (err) {
                console.error('Failed to get local stream:', err);
                toast.error('Camera or microphone access denied');
                setAudioEnabled(false);
                setVideoEnabled(false);
            }
        };

        initMedia();

        return () => {
            // Privacy mode: release camera/mic access when user leaves this page.
            stopAllLocalTracks();
            peerConnections.current.forEach(pc => pc.close());
            peerConnections.current.clear();
        };
    }, []);

    const toggleAudio = () => {
        if (audioEnabled) {
            void stopAndRemoveTrack('audio');
            setAudioEnabled(false);
            return;
        }
        void startTrack('audio')
            .then(() => setAudioEnabled(true))
            .catch((err) => {
                console.error('Failed to start microphone:', err);
                toast.error('Could not access microphone');
                setAudioEnabled(false);
            });
    };

    const toggleVideo = () => {
        if (videoEnabled) {
            void stopAndRemoveTrack('video');
            setVideoEnabled(false);
            return;
        }
        void startTrack('video')
            .then(() => setVideoEnabled(true))
            .catch((err) => {
                console.error('Failed to start camera:', err);
                toast.error('Could not access camera');
                setVideoEnabled(false);
            });
    };

    const createPeerConnection = (remoteSocketId: string) => {
        if (peerConnections.current.has(remoteSocketId)) {
            return peerConnections.current.get(remoteSocketId)!;
        }

        const pc = new RTCPeerConnection(ICE_SERVERS);

        // Add local tracks to the connection
        // Use the ref — localStream may be null in closure if getUserMedia is still in flight
        const currentStream = localStreamRef.current;
        if (currentStream) {
            currentStream.getTracks().filter(t => t.readyState === 'live').forEach(track => {
                pc.addTrack(track, currentStream);
            });
        }

        // Handle incoming remote tracks
        pc.ontrack = (event) => {
            const stream = event.streams[0];
            setRemoteStreams(prev => {
                const next = new Map(prev);
                next.set(remoteSocketId, stream);
                return next;
            });
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate && socket) {
                socket.emit('webrtc:ice-candidate', {
                    to: remoteSocketId,
                    candidate: event.candidate,
                    from: socket.id,
                });
            }
        };

        peerConnections.current.set(remoteSocketId, pc);
        return pc;
    };

    const joinMedia = (roomId: string, userId: string, userName: string) => {
        if (!socket) return;
        currentRoomId.current = roomId;
        currentUserId.current = userId;

        socket.emit('media:join', { roomId, userId, userName });

        // Listen for peer join signals
        socket.on('media:peer-joined', async ({ socketId, userName: peerName, userId: peerUserId }) => {
            console.log(`[WebRTC] Peer joined: ${peerName} (${socketId})`);
            remoteNamesRef.current.set(socketId, peerName);
            setRemoteNames(new Map(remoteNamesRef.current));
            if (peerUserId) {
                remoteSocketToUserIdRef.current.set(socketId, peerUserId);
                setRemoteSocketToUserId(new Map(remoteSocketToUserIdRef.current));
            }
            const pc = createPeerConnection(socketId);

            // Generate offer as the person who was already in the room
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket.emit('webrtc:offer', {
                to: socketId,
                offer,
                from: socket.id,
            });
        });

        // Receive offer
        socket.on('webrtc:offer', async ({ from, offer }) => {
            const pc = createPeerConnection(from);
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            // Drain any ICE candidates that arrived before the remote description
            const buffered = pendingCandidates.current.get(from) || [];
            for (const c of buffered) {
                try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch { /* ignore invalid ICE */ }
            }
            pendingCandidates.current.delete(from);

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socket.emit('webrtc:answer', {
                to: from,
                answer,
                from: socket.id,
            });
        });

        // Receive answer
        socket.on('webrtc:answer', async ({ from, answer }) => {
            const pc = peerConnections.current.get(from);
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
                // Drain any ICE candidates buffered before setRemoteDescription
                const buffered = pendingCandidates.current.get(from) || [];
                for (const c of buffered) {
                    try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch { /* ignore invalid ICE */ }
                }
                pendingCandidates.current.delete(from);
            }
        });

        // Receive ICE candidate
        socket.on('webrtc:ice-candidate', async ({ from, candidate }) => {
            const pc = peerConnections.current.get(from);
            if (pc) {
                if (pc.remoteDescription) {
                    try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch { /* ignore invalid ICE */ }
                } else {
                    // Buffer until remote description is set
                    const arr = pendingCandidates.current.get(from) || [];
                    arr.push(candidate);
                    pendingCandidates.current.set(from, arr);
                }
            } else {
                // PC not created yet — buffer
                const arr = pendingCandidates.current.get(from) || [];
                arr.push(candidate);
                pendingCandidates.current.set(from, arr);
            }
        });

        // Handle peer leaving
        socket.on('media:user-left', ({ userId: leftUserId }) => {
            console.log(`[WebRTC] Peer left: ${leftUserId}`);
            // Find the socketId associated with this userId if needed, 
            // but usually we just want to cleanup based on the socket that disconnected.
            // For now, let's just listen for the socket-level disconnect too.
        });

        socket.on('user-left', ({ socketId }) => {
            const pc = peerConnections.current.get(socketId);
            if (pc) {
                pc.close();
                peerConnections.current.delete(socketId);
                setRemoteStreams(prev => {
                    const next = new Map(prev);
                    next.delete(socketId);
                    return next;
                });
                remoteNamesRef.current.delete(socketId);
                setRemoteNames(new Map(remoteNamesRef.current));
                remoteSocketToUserIdRef.current.delete(socketId);
                setRemoteSocketToUserId(new Map(remoteSocketToUserIdRef.current));
            }
        });
    };

    const leaveMedia = () => {
        stopAllLocalTracks();
        peerConnections.current.forEach(pc => pc.close());
        peerConnections.current.clear();
        setRemoteStreams(new Map());
        if (currentRoomId.current && socket) {
            socket.emit('media:leave', { roomId: currentRoomId.current, userId: currentUserId.current });
        }
    };

    return (
        <MediaContext.Provider value={{
            localStream,
            remoteStreams,
            remoteNames,
            remoteSocketToUserId,
            audioEnabled,
            videoEnabled,
            toggleAudio,
            toggleVideo,
            joinMedia,
            leaveMedia,
            getPeerConnections: () => peerConnections.current,
        }}>
            {children}
        </MediaContext.Provider>
    );
};
