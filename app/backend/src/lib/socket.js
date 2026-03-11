import { Server } from "socket.io";
import { ENV } from "./env.js";

let io;
const rooms = new Map(); // roomId -> Set of { socketId, userId, name }

// Meeting state: meetingCode -> { hostId, participants, pendingParticipants, codingMode, editorAccess, code, language }
const meetings = new Map();

// Lobby state: roomId -> Map<socketId, { userId, name, ready }>
const lobbies = new Map();

// Map socketId -> { meetingCode, userId, name }
const socketMeetingMap = new Map();

function getMeetingState(code) {
  if (!meetings.has(code)) {
    meetings.set(code, {
      hostId: null,
      participants: [], // [{ userId, name, role, micOn, camOn, handRaised, socketId }]
      pendingParticipants: [], // [{ userId, name, isGuest, requestedAt, socketId }]
      codingModeEnabled: false,
      editorAccess: [],
      code: "// Your code here...",
      language: "javascript",
      maxParticipants: 50,
    });
  }
  return meetings.get(code);
}

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

    // ==========================================
    // Basic Room Presence (for SessionView etc.)
    // ==========================================

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      socket.roomId = roomId;

      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      rooms.get(roomId).add(socket.id);

      socket.emit("room-info", { participants: rooms.get(roomId).size });
      socket.to(roomId).emit("user-joined", { socketId: socket.id });
    });

    socket.on("chat-message", ({ roomId, sender, text, ts }) => {
      socket.to(roomId).emit("chat-message", { sender, text, ts });
    });

    socket.on("typing", ({ roomId }) => {
      socket.to(roomId).emit("user-typing", { userName: socket.id });
    });

    socket.on("stop-typing", ({ roomId }) => {
      socket.to(roomId).emit("user-stop-typing", { userName: socket.id });
    });

    // ==========================================
    // Meeting Waiting Room
    // ==========================================

    socket.on("join-meeting-waiting-room", ({ code }) => {
      socket.join(`waiting-${code}`);
      socket.waitingCode = code;
    });

    // ==========================================
    // Meeting Lifecycle
    // ==========================================

    socket.on("join-meeting", ({ code, userId, name }) => {
      const meeting = getMeetingState(code);

      socket.join(`meeting-${code}`);
      socketMeetingMap.set(socket.id, { meetingCode: code, userId, name });

      // First joiner or if this user is the host
      if (!meeting.hostId) {
        meeting.hostId = userId;
      }

      const isHost = meeting.hostId === userId;

      if (isHost) {
        // Host auto-admitted
        const existing = meeting.participants.find((p) => p.userId === userId);
        if (!existing) {
          meeting.participants.push({
            userId,
            name,
            role: "HOST",
            micOn: true,
            camOn: true,
            handRaised: false,
            socketId: socket.id,
          });
        } else {
          existing.socketId = socket.id;
        }

        // Send meeting info to host
        socket.emit("meeting:info", {
          hostId: meeting.hostId,
          pendingParticipants: meeting.pendingParticipants.map((p) => ({
            userId: p.userId,
            name: p.name,
            isGuest: p.isGuest,
            requestedAt: p.requestedAt,
          })),
          codingModeEnabled: meeting.codingModeEnabled,
          editorAccess: meeting.editorAccess,
          code: meeting.code,
          language: meeting.language,
        });

        // Broadcast updated participant list
        io.to(`meeting-${code}`).emit(
          "meeting:participants",
          meeting.participants.map((p) => ({
            userId: p.userId,
            name: p.name,
            role: p.role,
            micOn: p.micOn,
            camOn: p.camOn,
            handRaised: p.handRaised,
          }))
        );
      } else {
        // Non-host: add to pending list for host approval
        const alreadyParticipant = meeting.participants.find(
          (p) => p.userId === userId
        );
        const alreadyPending = meeting.pendingParticipants.find(
          (p) => p.userId === userId
        );

        if (alreadyParticipant) {
          // Re-joining (e.g., after page refresh)
          alreadyParticipant.socketId = socket.id;

          socket.emit("meeting:admitted");
          socket.emit("meeting:info", {
            hostId: meeting.hostId,
            codingModeEnabled: meeting.codingModeEnabled,
            editorAccess: meeting.editorAccess,
            code: meeting.code,
            language: meeting.language,
          });

          io.to(`meeting-${code}`).emit(
            "meeting:participants",
            meeting.participants.map((p) => ({
              userId: p.userId,
              name: p.name,
              role: p.role,
              micOn: p.micOn,
              camOn: p.camOn,
              handRaised: p.handRaised,
            }))
          );
        } else if (!alreadyPending) {
          meeting.pendingParticipants.push({
            userId,
            name,
            isGuest: false,
            requestedAt: new Date().toISOString(),
            socketId: socket.id,
          });

          // Notify host about pending participant
          const hostSocket = meeting.participants.find(
            (p) => p.role === "HOST"
          );
          if (hostSocket) {
            io.to(hostSocket.socketId).emit(
              "meeting:pending-list-updated",
              meeting.pendingParticipants.map((p) => ({
                userId: p.userId,
                name: p.name,
                isGuest: p.isGuest,
                requestedAt: p.requestedAt,
              }))
            );
          }

          // Tell the joining user to wait
          socket.emit("meeting:info", {
            hostId: meeting.hostId,
          });
        }
      }
    });

    // Host admits a pending participant
    socket.on("meeting:admit", ({ code, pendingUserId }) => {
      const meeting = getMeetingState(code);
      const info = socketMeetingMap.get(socket.id);
      if (!info || meeting.hostId !== info.userId) return; // Only host can admit

      // Enforce max participants cap
      if (meeting.participants.length >= meeting.maxParticipants) {
        socket.emit("meeting:error", {
          message: `Meeting is full (max ${meeting.maxParticipants} participants)`,
        });
        return;
      }

      const pendingIdx = meeting.pendingParticipants.findIndex(
        (p) => p.userId === pendingUserId
      );
      if (pendingIdx === -1) return;

      const pending = meeting.pendingParticipants.splice(pendingIdx, 1)[0];

      // Add to participants
      meeting.participants.push({
        userId: pending.userId,
        name: pending.name,
        role: "PARTICIPANT",
        micOn: true,
        camOn: true,
        handRaised: false,
        socketId: pending.socketId,
      });

      // Notify the admitted user
      io.to(pending.socketId).emit("meeting:admitted");

      // Also notify in waiting room
      io.to(`waiting-${code}`).emit("meeting:admitted");

      // Send meeting info to newly admitted user
      io.to(pending.socketId).emit("meeting:info", {
        hostId: meeting.hostId,
        codingModeEnabled: meeting.codingModeEnabled,
        editorAccess: meeting.editorAccess,
        code: meeting.code,
        language: meeting.language,
      });

      // Broadcast updated participant list
      io.to(`meeting-${code}`).emit(
        "meeting:participants",
        meeting.participants.map((p) => ({
          userId: p.userId,
          name: p.name,
          role: p.role,
          micOn: p.micOn,
          camOn: p.camOn,
          handRaised: p.handRaised,
        }))
      );

      // Notify about new participant joining
      io.to(`meeting-${code}`).emit("meeting:participant-joined", {
        userId: pending.userId,
        name: pending.name,
        role: "PARTICIPANT",
        micOn: true,
        camOn: true,
        handRaised: false,
      });

      // Update pending list for host
      const hostSocket = meeting.participants.find((p) => p.role === "HOST");
      if (hostSocket) {
        io.to(hostSocket.socketId).emit(
          "meeting:pending-list-updated",
          meeting.pendingParticipants.map((p) => ({
            userId: p.userId,
            name: p.name,
            isGuest: p.isGuest,
            requestedAt: p.requestedAt,
          }))
        );
      }
    });

    // Host denies a pending participant
    socket.on("meeting:deny", ({ code, pendingUserId }) => {
      const meeting = getMeetingState(code);
      const info = socketMeetingMap.get(socket.id);
      if (!info || meeting.hostId !== info.userId) return;

      const pendingIdx = meeting.pendingParticipants.findIndex(
        (p) => p.userId === pendingUserId
      );
      if (pendingIdx === -1) return;

      const pending = meeting.pendingParticipants.splice(pendingIdx, 1)[0];

      // Notify the denied user
      io.to(pending.socketId).emit("meeting:denied");
      io.to(`waiting-${code}`).emit("meeting:denied");

      // Update pending list for host
      const hostSocket = meeting.participants.find((p) => p.role === "HOST");
      if (hostSocket) {
        io.to(hostSocket.socketId).emit(
          "meeting:pending-list-updated",
          meeting.pendingParticipants.map((p) => ({
            userId: p.userId,
            name: p.name,
            isGuest: p.isGuest,
            requestedAt: p.requestedAt,
          }))
        );
      }
    });

    // Host ends meeting for all
    socket.on("meeting:end-for-all", ({ code }) => {
      const meeting = getMeetingState(code);
      const info = socketMeetingMap.get(socket.id);
      if (!info || meeting.hostId !== info.userId) return;

      io.to(`meeting-${code}`).emit("meeting:ended");

      // Cleanup
      meeting.participants.forEach((p) => {
        socketMeetingMap.delete(p.socketId);
      });
      meetings.delete(code);
    });

    // ==========================================
    // Media Status Toggles
    // ==========================================

    socket.on("meeting:mic-toggle", ({ code, micOn }) => {
      const meeting = getMeetingState(code);
      const info = socketMeetingMap.get(socket.id);
      if (!info) return;

      const participant = meeting.participants.find(
        (p) => p.userId === info.userId
      );
      if (participant) participant.micOn = micOn;

      io.to(`meeting-${code}`).emit("meeting:mic-status", {
        userId: info.userId,
        micOn,
      });
    });

    socket.on("meeting:cam-toggle", ({ code, camOn }) => {
      const meeting = getMeetingState(code);
      const info = socketMeetingMap.get(socket.id);
      if (!info) return;

      const participant = meeting.participants.find(
        (p) => p.userId === info.userId
      );
      if (participant) participant.camOn = camOn;

      io.to(`meeting-${code}`).emit("meeting:cam-status", {
        userId: info.userId,
        camOn,
      });
    });

    socket.on("meeting:hand-raise", ({ code, raised }) => {
      const meeting = getMeetingState(code);
      const info = socketMeetingMap.get(socket.id);
      if (!info) return;

      const participant = meeting.participants.find(
        (p) => p.userId === info.userId
      );
      if (participant) participant.handRaised = raised;

      io.to(`meeting-${code}`).emit("meeting:hand-raised", {
        userId: info.userId,
        raised,
      });
    });

    // ==========================================
    // Meeting Chat
    // ==========================================

    socket.on("meeting:chat", ({ code, text }) => {
      const info = socketMeetingMap.get(socket.id);
      if (!info) return;

      const msg = {
        sender: info.name,
        text,
        ts: new Date().toISOString(),
      };

      io.to(`meeting-${code}`).emit("meeting:chat-message", msg);
    });

    // ==========================================
    // Coding Mode & Editor Access
    // ==========================================

    socket.on("meeting:toggle-coding", ({ code, enabled }) => {
      const meeting = getMeetingState(code);
      const info = socketMeetingMap.get(socket.id);
      if (!info || meeting.hostId !== info.userId) return;

      meeting.codingModeEnabled = enabled;

      io.to(`meeting-${code}`).emit("meeting:coding-toggled", { enabled });
    });

    socket.on("meeting:grant-editor-access", ({ code, userId }) => {
      const meeting = getMeetingState(code);
      const info = socketMeetingMap.get(socket.id);
      if (!info || meeting.hostId !== info.userId) return;

      if (!meeting.editorAccess.includes(userId)) {
        meeting.editorAccess.push(userId);
      }

      io.to(`meeting-${code}`).emit(
        "meeting:editor-access-updated",
        meeting.editorAccess
      );
    });

    socket.on("meeting:revoke-editor-access", ({ code, userId }) => {
      const meeting = getMeetingState(code);
      const info = socketMeetingMap.get(socket.id);
      if (!info || meeting.hostId !== info.userId) return;

      meeting.editorAccess = meeting.editorAccess.filter((id) => id !== userId);

      io.to(`meeting-${code}`).emit(
        "meeting:editor-access-updated",
        meeting.editorAccess
      );
    });

    // ==========================================
    // Coding Sync
    // ==========================================

    socket.on("coding:update", ({ code, newCode, language }) => {
      const meeting = getMeetingState(code);

      meeting.code = newCode;
      if (language) meeting.language = language;

      socket
        .to(`meeting-${code}`)
        .emit("coding:sync", { code: newCode, language });
    });

    // ==========================================
    // WebRTC Signaling
    // ==========================================

    socket.on("media:join", ({ roomId, userId, userName }) => {
      socket.join(`media-${roomId}`);
      socket.mediaRoom = roomId;

      // Notify everyone else in the media room to create a peer connection
      socket
        .to(`media-${roomId}`)
        .emit("media:peer-joined", { socketId: socket.id, userName });
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

    // ==========================================
    // Lobby (pre-meeting ready check)
    // ==========================================

    socket.on("join-lobby", ({ roomId, userId, name }) => {
      socket.join(`lobby-${roomId}`);
      socket.lobbyRoom = roomId;

      if (!lobbies.has(roomId)) {
        lobbies.set(roomId, new Map());
      }
      const lobby = lobbies.get(roomId);
      lobby.set(socket.id, { userId, name, ready: false });

      // Send current lobby state
      socket.emit(
        "lobby:participants",
        Array.from(lobby.values())
      );

      // Notify others
      socket
        .to(`lobby-${roomId}`)
        .emit("lobby:participant-joined", { userId, name, ready: false });
    });

    socket.on("leave-lobby", () => {
      if (socket.lobbyRoom) {
        const lobby = lobbies.get(socket.lobbyRoom);
        if (lobby) {
          const participant = lobby.get(socket.id);
          lobby.delete(socket.id);
          if (participant) {
            io.to(`lobby-${socket.lobbyRoom}`).emit(
              "lobby:participant-left",
              { userId: participant.userId }
            );
          }
          if (lobby.size === 0) lobbies.delete(socket.lobbyRoom);
        }
        socket.leave(`lobby-${socket.lobbyRoom}`);
        socket.lobbyRoom = null;
      }
    });

    socket.on("lobby:ready", ({ ready }) => {
      if (!socket.lobbyRoom) return;
      const lobby = lobbies.get(socket.lobbyRoom);
      if (!lobby) return;

      const participant = lobby.get(socket.id);
      if (participant) {
        participant.ready = ready;
        io.to(`lobby-${socket.lobbyRoom}`).emit("lobby:participant-ready", {
          userId: participant.userId,
          ready,
        });
      }
    });

    // Also handle "presence:ready" if the frontend emits that
    socket.on("presence:ready", ({ ready }) => {
      if (!socket.lobbyRoom) return;
      const lobby = lobbies.get(socket.lobbyRoom);
      if (!lobby) return;

      const participant = lobby.get(socket.id);
      if (participant) {
        participant.ready = ready;
        io.to(`lobby-${socket.lobbyRoom}`).emit("lobby:participant-ready", {
          userId: participant.userId,
          ready,
        });
      }
    });

    // Ping/Pong for keepalive
    socket.on("ping", () => {
      socket.emit("pong");
    });

    // ==========================================
    // Disconnect Cleanup
    // ==========================================

    socket.on("disconnect", () => {
      // Basic room cleanup
      if (socket.roomId) {
        const roomId = socket.roomId;
        const room = rooms.get(roomId);
        if (room) {
          room.delete(socket.id);
          io.to(roomId).emit("user-left", { socketId: socket.id });
          if (room.size === 0) rooms.delete(roomId);
        }
      }

      // Meeting cleanup
      const meetingInfo = socketMeetingMap.get(socket.id);
      if (meetingInfo) {
        const { meetingCode, userId, name } = meetingInfo;
        const meeting = meetings.get(meetingCode);
        if (meeting) {
          // Remove from participants
          meeting.participants = meeting.participants.filter(
            (p) => p.socketId !== socket.id
          );

          // Remove from pending
          meeting.pendingParticipants = meeting.pendingParticipants.filter(
            (p) => p.socketId !== socket.id
          );

          // Broadcast participant left
          io.to(`meeting-${meetingCode}`).emit("meeting:participant-left", {
            userId,
            name,
          });

          // Update participants list
          io.to(`meeting-${meetingCode}`).emit(
            "meeting:participants",
            meeting.participants.map((p) => ({
              userId: p.userId,
              name: p.name,
              role: p.role,
              micOn: p.micOn,
              camOn: p.camOn,
              handRaised: p.handRaised,
            }))
          );

          // Update pending list for host
          const hostSocket = meeting.participants.find(
            (p) => p.role === "HOST"
          );
          if (hostSocket) {
            io.to(hostSocket.socketId).emit(
              "meeting:pending-list-updated",
              meeting.pendingParticipants.map((p) => ({
                userId: p.userId,
                name: p.name,
                isGuest: p.isGuest,
                requestedAt: p.requestedAt,
              }))
            );
          }

          // Cleanup empty meetings
          if (
            meeting.participants.length === 0 &&
            meeting.pendingParticipants.length === 0
          ) {
            meetings.delete(meetingCode);
          }
        }
        socketMeetingMap.delete(socket.id);
      }

      // Media room cleanup
      if (socket.mediaRoom) {
        io.to(`media-${socket.mediaRoom}`).emit("user-left", {
          socketId: socket.id,
        });
      }

      // Lobby cleanup
      if (socket.lobbyRoom) {
        const lobby = lobbies.get(socket.lobbyRoom);
        if (lobby) {
          const participant = lobby.get(socket.id);
          lobby.delete(socket.id);
          if (participant) {
            io.to(`lobby-${socket.lobbyRoom}`).emit(
              "lobby:participant-left",
              { userId: participant.userId }
            );
          }
          if (lobby.size === 0) lobbies.delete(socket.lobbyRoom);
        }
      }
    });
  });

  return io;
};

export const getIO = () => io;
