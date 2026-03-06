import { chatClient, streamClient } from "../lib/stream.js";
import Session from "../models/Session.js";
import User from "../models/User.js";
import { sendFeedbackEmail } from "../lib/resend.js";

export async function createSession(req, res) {
  try {
    const { problem, difficulty } = req.body;
    const userId = req.user._id;
    const streamUserId = userId.toString();

    if (!problem || !difficulty) {
      return res.status(400).json({ message: "Problem and difficulty are required" });
    }

    const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const session = await Session.create({ problem, difficulty, host: userId, callId });

    await streamClient.video.call("default", callId).getOrCreate({
      data: {
        created_by_id: streamUserId,
        custom: { problem, difficulty, sessionId: session._id.toString() },
      },
    });

    const channel = chatClient.channel("messaging", callId, {
      name: `${problem} Session`,
      created_by_id: streamUserId,
      members: [streamUserId],
    });

    await channel.create();

    res.status(201).json({ session });
  } catch (error) {
    console.log("Error in createSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getActiveSessions(_, res) {
  try {
    const sessions = await Session.find({ status: "active" })
      .populate("host", "name profileImage email _id")
      .populate("participant", "name profileImage email _id")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.log("Error in getActiveSessions controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyRecentSessions(req, res) {
  try {
    const userId = req.user._id;

    const sessions = await Session.find({
      status: "completed",
      $or: [{ host: userId }, { participant: userId }],
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.log("Error in getMyRecentSessions controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getSessionById(req, res) {
  try {
    const { id } = req.params;

    const session = await Session.findById(id)
      .populate("host", "name email profileImage _id")
      .populate("participant", "name email profileImage _id");

    if (!session) return res.status(404).json({ message: "Session not found" });

    res.status(200).json({ session });
  } catch (error) {
    console.log("Error in getSessionById controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function joinSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const streamUserId = userId.toString();

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.status !== "active") {
      return res.status(400).json({ message: "Cannot join a completed session" });
    }

    if (session.host.toString() === userId.toString()) {
      return res.status(400).json({ message: "Host cannot join their own session as participant" });
    }

    if (session.participant) return res.status(409).json({ message: "Session is full" });

    session.participant = userId;
    await session.save();

    const channel = chatClient.channel("messaging", session.callId);
    await channel.addMembers([streamUserId]);

    res.status(200).json({ session });
  } catch (error) {
    console.log("Error in joinSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function endSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.host.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the host can end the session" });
    }

    if (session.status === "completed") {
      return res.status(400).json({ message: "Session is already completed" });
    }

    const call = streamClient.video.call("default", session.callId);
    await call.delete({ hard: true });

    const channel = chatClient.channel("messaging", session.callId);
    await channel.delete();

    session.status = "completed";
    await session.save();

    sendFeedbackEmails(session).catch((err) =>
      console.error("Error sending feedback emails:", err.message)
    );

    res.status(200).json({ session, message: "Session ended successfully" });
  } catch (error) {
    console.log("Error in endSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function sendFeedbackEmails(session) {
  const [host, participant] = await Promise.all([
    User.findById(session.host),
    session.participant ? User.findById(session.participant) : null,
  ]);

  const emailPayload = {
    sessionProblem: session.problem,
    sessionDifficulty: session.difficulty,
    analysis: session.aiAnalysis || null,
  };

  const promises = [];

  if (host?.email) {
    promises.push(
      sendFeedbackEmail({ to: host.email, name: host.name, ...emailPayload, role: "host" })
    );
  }

  if (participant?.email) {
    promises.push(
      sendFeedbackEmail({ to: participant.email, name: participant.name, ...emailPayload, role: "participant" })
    );
  }

  await Promise.all(promises);
  console.log(`Feedback emails sent for session ${session._id}`);
}
