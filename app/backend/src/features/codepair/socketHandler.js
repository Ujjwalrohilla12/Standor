import crypto from "crypto";

// Deterministic color assignment (ported from coding-interview-platform's CRC32 approach)
const PARTICIPANT_COLORS = [
  "#3b82f6", // Blue
  "#ef4444", // Red
  "#22c55e", // Green
  "#f59e0b", // Amber
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#f97316", // Orange
];

function getParticipantColor(participantId) {
  // Simple hash for deterministic color
  const hash = crypto.createHash("md5").update(participantId).digest();
  const idx = hash.readUInt32BE(0) % PARTICIPANT_COLORS.length;
  return PARTICIPANT_COLORS[idx];
}

export const setupCodePairSocket = (io) => {
  // In-memory store for CodePair rooms (ported from coding-interview-platform's ConnectionManager)
  const codepairRooms = new Map();

  io.on("connection", (socket) => {
    // --- CodePair Events ---

    socket.on("codepair:join", ({ roomId, user }) => {
      socket.join(`codepair-${roomId}`);

      if (!codepairRooms.has(roomId)) {
        codepairRooms.set(roomId, {
          code: "// Welcome to CodePair\n\n",
          language: "javascript",
          participants: new Map(),
        });
      }

      const room = codepairRooms.get(roomId);

      // Assign deterministic color based on socket ID
      const color = getParticipantColor(socket.id);
      const participant = {
        id: socket.id,
        name: user?.name || `User ${socket.id.substring(0, 4)}`,
        color,
      };
      room.participants.set(socket.id, participant);

      // Send current state to newly joined user (SYNC_RESPONSE equivalent)
      socket.emit("codepair:init", {
        code: room.code,
        language: room.language,
        participants: Array.from(room.participants.values()),
        participantId: socket.id,
        participantColor: color,
      });

      // Notify others (USER_JOINED equivalent)
      socket.to(`codepair-${roomId}`).emit("codepair:user-joined", {
        participants: Array.from(room.participants.values()),
      });

      // Track which codepair room this socket is in
      socket.codepairRoomId = roomId;
    });

    socket.on("codepair:code-update", ({ roomId, code, language }) => {
      const room = codepairRooms.get(roomId);
      if (room) {
        room.code = code;
        if (language) room.language = language;

        const participant = room.participants.get(socket.id);

        // Broadcast to other participants (CODE_UPDATE equivalent)
        socket.to(`codepair-${roomId}`).emit("codepair:code-sync", { code, language });

        // Broadcast typing indicator to others
        if (participant) {
          socket.to(`codepair-${roomId}`).emit("codepair:typing", {
            participantId: socket.id,
            name: participant.name,
            color: participant.color,
          });
        }
      }
    });

    socket.on("codepair:chat", ({ roomId, message }) => {
      socket.to(`codepair-${roomId}`).emit("codepair:chat-message", message);
    });

    // Handle cursor position updates (from coding-interview-platform)
    socket.on("codepair:cursor", ({ roomId, cursor }) => {
      socket.to(`codepair-${roomId}`).emit("codepair:cursor-update", {
        participantId: socket.id,
        cursor,
      });
    });

    // Handle language changes
    socket.on("codepair:language-change", ({ roomId, language }) => {
      const room = codepairRooms.get(roomId);
      if (room) {
        room.language = language;
        socket.to(`codepair-${roomId}`).emit("codepair:code-sync", {
          code: room.code,
          language,
        });
      }
    });

    // Handle name changes (from coding-interview-platform)
    socket.on("codepair:name-change", ({ roomId, name }) => {
      const room = codepairRooms.get(roomId);
      if (room && room.participants.has(socket.id)) {
        const participant = room.participants.get(socket.id);
        participant.name = name;
        io.to(`codepair-${roomId}`).emit("codepair:name-updated", {
          participants: Array.from(room.participants.values()),
        });
      }
    });

    // Sync request (from coding-interview-platform)
    socket.on("codepair:sync-request", ({ roomId }) => {
      const room = codepairRooms.get(roomId);
      if (room) {
        socket.emit("codepair:init", {
          code: room.code,
          language: room.language,
          participants: Array.from(room.participants.values()),
        });
      }
    });

    socket.on("disconnect", () => {
      if (socket.codepairRoomId) {
        const roomId = socket.codepairRoomId;
        const room = codepairRooms.get(roomId);

        if (room) {
          room.participants.delete(socket.id);

          // Notify others (USER_LEFT equivalent)
          io.to(`codepair-${roomId}`).emit("codepair:user-left", {
            participants: Array.from(room.participants.values()),
          });

          // Cleanup empty rooms
          if (room.participants.size === 0) {
            codepairRooms.delete(roomId);
          }
        }
      }
    });
  });
};
