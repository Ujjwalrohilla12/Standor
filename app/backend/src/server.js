import express from "express";
import path from "path";
import cors from "cors";

import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/authRoutes.js";
import sessionRoutes from "./routes/sessionRoute.js";
import webauthnRoutes from "./routes/webauthnRoutes.js";
import problemsRoutes from "./routes/problemsRoutes.js";
import executionRoutes from "./routes/executionRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";

import { createServer } from "http";
import { initSocket } from "./lib/socket.js";

const app = express();
const httpServer = createServer(app);

const __dirname = path.resolve();

// middleware
app.use(express.json());
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));

app.get("/health", (req, res) => {
  res.status(200).json({ msg: "api is up and running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/rooms", sessionRoutes);
app.use("/api/webauthn", webauthnRoutes);
app.use("/api/problems", problemsRoutes);
app.use("/api/execution", executionRoutes);
app.use("/api/meetings", meetingRoutes);

// Replay endpoint (returns session snapshots for replay)
app.get("/api/replay/:roomId", async (req, res) => {
  try {
    const { default: Session } = await import("./models/Session.js");
    const mongoose = await import("mongoose");
    let session;
    if (mongoose.default.Types.ObjectId.isValid(req.params.roomId)) {
      session = await Session.findById(req.params.roomId);
    } else {
      session = await Session.findOne({ roomId: req.params.roomId });
    }
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.status(200).json({
      snapshots: session.codeSnapshots,
      messages: session.messages,
      analyses: session.analyses,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// make our app ready for deployment
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

import { setupCodePairSocket } from "./features/codepair/socketHandler.js";

const startServer = async () => {
  try {
    await connectDB();

    // Initialize Socket.IO
    const io = initSocket(httpServer);

    // Initialize CodePair Socket
    setupCodePairSocket(io);

    httpServer.listen(ENV.PORT, () => console.log("Server is running on port:", ENV.PORT));
  } catch (error) {
    console.error("Error starting the server", error);
  }
};

startServer();