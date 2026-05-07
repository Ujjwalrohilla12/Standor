import jwt from "jsonwebtoken";
import Session from "../models/Session.js";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";
import crypto from "crypto";

const MAX_PARTICIPANTS = 50;

// POST /api/meetings - Create a new meeting
export async function createMeeting(req, res) {
  try {
    const userId = req.user._id;
    const { title, problem, difficulty, language, hostEmail, candidateEmail } = req.body;

    const session = await Session.create({
      problem: problem || title || "Meeting",
      difficulty: difficulty ? difficulty.toUpperCase() : "MEDIUM",
      language: language || "javascript",
      hostId: userId,
      hostEmail: typeof hostEmail === "string" && hostEmail.trim() ? hostEmail.trim() : (req.user.email || ""),
      candidateEmail: typeof candidateEmail === "string" && candidateEmail.trim() ? candidateEmail.trim() : "",
      type: "MEETING",
      maxParticipants: MAX_PARTICIPANTS,
      startedAt: new Date(),
    });

    res.status(201).json({
      _id: session._id,
      id: session._id,
      callId: session.callId,
      roomId: session.roomId,
      hostId: session.hostId,
      status: session.status,
      problem: session.problem,
      difficulty: session.difficulty,
      language: session.language,
      maxParticipants: session.maxParticipants,
      meetingLink: `${ENV.CLIENT_URL || ""}/join/${session.callId}`,
    });
  } catch (error) {
    console.log("Error in createMeeting controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// GET /api/meetings/:code - Verify meeting exists
export async function getMeeting(req, res) {
  try {
    const { code } = req.params;
    const session = await Session.findOne({
      $or: [{ callId: code }, { roomId: code }],
      status: "ACTIVE",
    });

    if (!session) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    res.status(200).json({
      id: session._id,
      callId: session.callId,
      roomId: session.roomId,
      hostId: session.hostId,
      status: session.status,
      problem: session.problem,
      difficulty: session.difficulty,
      language: session.language,
    });
  } catch (error) {
    console.log("Error in getMeeting controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// POST /api/meetings/:code/join - Authenticated user join
export async function joinMeeting(req, res) {
  try {
    const { code } = req.params;
    const userId = req.user._id;
    const { hostEmail, candidateEmail } = req.body;

    const session = await Session.findOne({
      $or: [{ callId: code }, { roomId: code }],
      status: "ACTIVE",
    });

    if (!session) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    // Host is auto-admitted
    if (session.hostId.toString() === userId.toString()) {
      return res.status(200).json({ status: "ADMITTED", joined: true });
    }

    // Persist first joined participant as candidate for reporting/email workflow
    if (!session.participantId) {
      session.participantId = userId;
      session.lastActivityAt = new Date();
    }

    if (typeof hostEmail === "string" && hostEmail.trim()) {
      session.hostEmail = hostEmail.trim();
    }

    if (typeof candidateEmail === "string" && candidateEmail.trim()) {
      session.candidateEmail = candidateEmail.trim();
    }

    if ((typeof hostEmail === "string" && hostEmail.trim()) || (typeof candidateEmail === "string" && candidateEmail.trim())) {
      session.lastActivityAt = new Date();
    }

    await session.save();

    // Non-host goes to waiting room
    res.status(200).json({ status: "WAITING_ROOM", joined: true });
  } catch (error) {
    console.log("Error in joinMeeting controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// POST /api/meetings/:code/guest-join - Guest join (creates temp user + token)
export async function guestJoinMeeting(req, res) {
  try {
    const { code } = req.params;
    const { name, hostEmail, candidateEmail } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }

    const session = await Session.findOne({
      $or: [{ callId: code }, { roomId: code }],
      status: "ACTIVE",
    });

    if (!session) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    // Create a guest user with a unique email
    const guestId = crypto.randomBytes(8).toString("hex");
    const guestUser = await User.create({
      name: name.trim(),
      email: `guest_${guestId}@standor.guest`,
      password: crypto.randomBytes(16).toString("hex"),
      emailVerified: true,
    });

    // Persist guest candidate for post-meeting generic email
    if (!session.participantId) {
      session.participantId = guestUser._id;
    }

    if (typeof hostEmail === "string" && hostEmail.trim()) {
      session.hostEmail = hostEmail.trim();
    }

    if (typeof candidateEmail === "string" && candidateEmail.trim()) {
      session.candidateEmail = candidateEmail.trim();
    }

    session.lastActivityAt = new Date();
    await session.save();

    const token = jwt.sign({ userId: guestUser._id }, ENV.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(200).json({
      user: {
        id: guestUser._id,
        _id: guestUser._id,
        name: guestUser.name,
        email: guestUser.email,
      },
      token,
      status: "WAITING_ROOM",
    });
  } catch (error) {
    console.log("Error in guestJoinMeeting controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
