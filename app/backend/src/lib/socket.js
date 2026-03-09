import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { ENV } from "./env.js";

let io;
const rooms = new Map(); // roomId -> { hostId, participants: Map(userId -> { name, role, socketId, micOn, camOn, handRaised }), pendingParticipants: Map(userId -> { name, socketId, requestedAt }), codingModeEnabled: boolean, code: string, language: string, editorAccess: Set(userId) }

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: ENV.CLIENT_URL,
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);

        // Join Waiting Room (Lobby)
        socket.on("join-meeting-waiting-room", ({ code }) => {
            socket.join(`waiting-${code}`);
            console.log(`User ${socket.id} joined waiting room for ${code}`);
        });

        // Request to Join Meeting
        socket.on("join-meeting", ({ code, userId, name }) => {
            let room = rooms.get(code);
            if (!room) {
                // If room doesn't exist, the first person to join (who should be the host via API) creates it
                // Note: Real host check should happen via DB/Auth
                room = {
                    hostId: userId,
                    participants: new Map(),
                    pendingParticipants: new Map(),
                    codingModeEnabled: false,
                    code: "// Start coding together...",
                    language: "javascript",
                    editorAccess: new Set([userId]), // Host always has access
                };
                rooms.set(code, room);
            }

            // If user is host, admit automatically
            if (room.hostId === userId) {
                room.participants.set(userId, { userId, name, role: "host", socketId: socket.id, micOn: true, camOn: true });
                socket.join(code);

                // Send current room state to host
                socket.emit("meeting:info", {
                    hostId: room.hostId,
                    participants: Array.from(room.participants.values()),
                    pendingParticipants: Array.from(room.pendingParticipants.values()),
                    codingModeEnabled: room.codingModeEnabled,
                    code: room.code,
                    language: room.language
                });

                io.to(code).emit("meeting:participants", Array.from(room.participants.values()));
            } else {
                // Candidate/Guest - put in pending if not already admitted
                if (!room.participants.has(userId)) {
                    room.pendingParticipants.set(userId, { userId, name, socketId: socket.id, requestedAt: new Date().toISOString() });

                    // Notify host about pending participant
                    const hostSocketId = room.participants.get(room.hostId)?.socketId;
                    if (hostSocketId) {
                        io.to(hostSocketId).emit("meeting:pending-list-updated", Array.from(room.pendingParticipants.values()));
                    }
                    // Already admitted (e.g. reconnection)
                    room.participants.get(userId).socketId = socket.id;
                    socket.join(code);

                    socket.emit("meeting:info", {
                        hostId: room.hostId,
                        participants: Array.from(room.participants.values()),
                        pendingParticipants: Array.from(room.pendingParticipants.values()),
                        codingModeEnabled: room.codingModeEnabled,
                        code: room.code,
                        language: room.language
                    });

                    io.to(code).emit("meeting:participants", Array.from(room.participants.values()));
                }
            }
        });

        // Host Action: Admit Participant
        socket.on("meeting:admit", ({ code, pendingUserId }) => {
            const room = rooms.get(code);
            if (!room) return;

            // Security check: Only host can admit
            const host = room.participants.get(room.hostId);
            if (!host || host.socketId !== socket.id) {
                console.log("Unauthorized admit attempt by", socket.id);
                return;
            }

            const pending = room.pendingParticipants.get(pendingUserId);
            if (pending) {
                room.pendingParticipants.delete(pendingUserId);
                room.participants.set(pendingUserId, {
                    userId: pendingUserId,
                    name: pending.name,
                    role: "candidate",
                    socketId: pending.socketId,
                    micOn: true,
                    camOn: true
                });

                // Notify the admitted user
                io.to(pending.socketId).emit("meeting:admitted");

                // Also send current room state to the newly admitted user
                io.to(pending.socketId).emit("meeting:info", {
                    hostId: room.hostId,
                    participants: Array.from(room.participants.values()),
                    pendingParticipants: Array.from(room.pendingParticipants.values()),
                    codingModeEnabled: room.codingModeEnabled,
                    code: room.code,
                    language: room.language
                });

                // Notify host about updated pending list
                socket.emit("meeting:pending-list-updated", Array.from(room.pendingParticipants.values()));
            }
        });

        // Host Action: Deny Participant
        socket.on("meeting:deny", ({ code, pendingUserId }) => {
            const room = rooms.get(code);
            if (!room) return;

            // Security check: Only host can deny
            const host = room.participants.get(room.hostId);
            if (!host || host.socketId !== socket.id) return;

            const pending = room.pendingParticipants.get(pendingUserId);
            if (pending) {
                room.pendingParticipants.delete(pendingUserId);
                io.to(pending.socketId).emit("meeting:denied");
                socket.emit("meeting:pending-list-updated", Array.from(room.pendingParticipants.values()));
            }
        });

        // Host Action: End Meeting for All
        socket.on("meeting:end-for-all", ({ code }) => {
            const room = rooms.get(code);
            if (!room) return;

            // Security check: Only host can end for all
            const host = room.participants.get(room.hostId);
            if (!host || host.socketId !== socket.id) return;

            io.to(code).emit("meeting:ended");
            rooms.delete(code);
        });

        // Toggle Coding Mode
        socket.on("meeting:toggle-coding", ({ code, enabled }) => {
            const room = rooms.get(code);
            if (!room) return;

            room.codingModeEnabled = enabled;
            io.to(code).emit("meeting:coding-toggled", { enabled });
        });

        // Grant Editor Access
        socket.on("meeting:grant-editor-access", ({ code, userId }) => {
            const room = rooms.get(code);
            if (!room) return;

            room.editorAccess.add(userId);
            io.to(code).emit("meeting:editor-access-updated", Array.from(room.editorAccess));
        });

        // Revoke Editor Access
        socket.on("meeting:revoke-editor-access", ({ code, userId }) => {
            const room = rooms.get(code);
            if (!room) return;

            if (userId !== room.hostId) {
                room.editorAccess.delete(userId);
            }
            io.to(code).emit("meeting:editor-access-updated", Array.from(room.editorAccess));
        });

        // Code Update Sync
        socket.on("coding:update", ({ code: roomCode, newCode, language }) => {
            const room = rooms.get(roomCode);
            if (!room) return;

            room.code = newCode;
            if (language) room.language = language;

            // Broadcast to others in the room
            socket.to(roomCode).emit("coding:sync", { code: newCode, language });
        });

        // Media Toggle Sync
        socket.on("meeting:mic-toggle", ({ code, micOn }) => {
            const room = rooms.get(code);
            if (!room) return;
            const participant = Array.from(room.participants.values()).find(p => p.socketId === socket.id);
            if (participant) {
                participant.micOn = micOn;
                io.to(code).emit("meeting:mic-status", { userId: participant.userId, micOn });
            }
        });

        socket.on("meeting:cam-toggle", ({ code, camOn }) => {
            const room = rooms.get(code);
            if (!room) return;
            const participant = Array.from(room.participants.values()).find(p => p.socketId === socket.id);
            if (participant) {
                participant.camOn = camOn;
                io.to(code).emit("meeting:cam-status", { userId: participant.userId, camOn });
            }
        });

        socket.on("meeting:hand-raise", ({ code, raised }) => {
            const room = rooms.get(code);
            if (!room) return;
            const participant = Array.from(room.participants.values()).find(p => p.socketId === socket.id);
            if (participant) {
                participant.handRaised = raised;
                io.to(code).emit("meeting:hand-raised", { userId: participant.userId, raised });
            }
        });

        // WebRTC Signaling
        socket.on("media:join", ({ roomId, userId, userName }) => {
            socket.to(roomId).emit("media:peer-joined", { socketId: socket.id, userId, userName });
        });

        socket.on("webrtc:offer", ({ to, offer, from }) => {
            io.to(to).emit("webrtc:offer", { from, offer });
        });

        socket.on("webrtc:answer", ({ to, answer, from }) => {
            io.to(to).emit("webrtc:answer", { from, answer });
        });

        socket.on("webrtc:ice-candidate", ({ to, candidate, from }) => {
            io.to(to).emit("webrtc:ice-candidate", { from, candidate });
        });

        // Chat
        socket.on("meeting:chat", ({ code, text }) => {
            const room = rooms.get(code);
            if (!room) return;
            const participant = Array.from(room.participants.values()).find(p => p.socketId === socket.id);
            if (participant) {
                io.to(code).emit("meeting:chat-message", {
                    sender: participant.name,
                    text,
                    ts: Date.now()
                });
            }
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
            // Cleanup: Find which room this user was in
            for (const [code, room] of rooms.entries()) {
                const participant = Array.from(room.participants.values()).find(p => p.socketId === socket.id);
                if (participant) {
                    room.participants.delete(participant.userId);
                    io.to(code).emit("meeting:participant-left", { userId: participant.userId, name: participant.name });

                    if (room.participants.size === 0) {
                        // Optional: delete room after timeout or immediately
                        // rooms.delete(code);
                    }
                    break;
                }

                const pending = Array.from(room.pendingParticipants.values()).find(p => p.socketId === socket.id);
                if (pending) {
                    room.pendingParticipants.delete(pending.userId);
                    const hostSocketId = room.participants.get(room.hostId)?.socketId;
                    if (hostSocketId) {
                        io.to(hostSocketId).emit("meeting:pending-list-updated", Array.from(room.pendingParticipants.values()));
                    }
                    break;
                }
            }
            io.emit("user-left", { socketId: socket.id });
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
