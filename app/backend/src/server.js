import express from "express";
import path from "path";
import cors from "cors";
import { serve } from "inngest/express";

import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { inngest, functions } from "./lib/inngest.js";

import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoute.js";
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
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/rooms", sessionRoutes);
app.use("/api/meetings", meetingRoutes);

// make our app ready for deployment
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

const startServer = async () => {
  try {
    await connectDB();

    // Initialize Socket.IO
    initSocket(httpServer);

    httpServer.listen(ENV.PORT, () => console.log("Server is running on port:", ENV.PORT));
  } catch (error) {
    console.error("💥 Error starting the server", error);
  }
};

startServer();
