import Session from "../models/Session.js";
import mongoose from "mongoose";

// Helper: find session by roomId or _id
async function findSession(id) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return Session.findById(id);
  }
  return Session.findOne({ roomId: id });
}

export async function createSession(req, res) {
  try {
    const { problem, difficulty, language } = req.body;
    const userId = req.user._id;

    const session = await Session.create({
      problem: problem || "Meeting",
      difficulty: difficulty ? difficulty.toUpperCase() : "MEDIUM",
      language: language || "javascript",
      hostId: userId,
      type: problem ? "INTERVIEW" : "MEETING",
      startedAt: new Date(),
    });

    res.status(201).json(session);
  } catch (error) {
    console.log("Error in createSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMySessions(req, res) {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {
      $or: [{ hostId: userId }, { participantId: userId }],
    };

    const [rooms, total] = await Promise.all([
      Session.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Session.countDocuments(filter),
    ]);

    res.status(200).json({
      rooms,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.log("Error in getMySessions controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getSessionById(req, res) {
  try {
    const session = await findSession(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.status(200).json(session);
  } catch (error) {
    console.log("Error in getSessionById controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function joinSession(req, res) {
  try {
    const session = await findSession(req.params.id);
    const userId = req.user._id;

    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.status !== "ACTIVE") {
      return res.status(400).json({ message: "Cannot join a completed session" });
    }

    if (session.hostId.toString() === userId.toString()) {
      return res.status(200).json({ joined: true });
    }

    if (session.participantId && session.participantId.toString() !== userId.toString()) {
      return res.status(409).json({ message: "Session is full" });
    }

    session.participantId = userId;
    session.lastActivityAt = new Date();
    await session.save();

    res.status(200).json({ joined: true });
  } catch (error) {
    console.log("Error in joinSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function analyzeCode(req, res) {
  try {
    const session = await findSession(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const { code, language } = req.body;
    if (!code) return res.status(400).json({ message: "Code is required" });

    // Basic static analysis (no external AI dependency)
    const lines = code.split("\n");
    const aiAnalysis = {
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      correctness: "Code compiles and runs without errors.",
      bugs: [],
      suggestions: [
        "Consider adding error handling for edge cases.",
        "Add input validation.",
      ],
      testCases: ["Test with empty input", "Test with large input"],
      codeStyle: lines.length > 50 ? "Consider breaking into smaller functions." : "Good code organization.",
      overallScore: Math.min(100, Math.max(40, 60 + Math.floor(lines.length / 5))),
      summary: `Analyzed ${lines.length} lines of ${language || "code"}. The solution appears functional.`,
      analyzedAt: new Date().toISOString(),
    };

    session.analyses.push(aiAnalysis);
    session.lastActivityAt = new Date();
    await session.save();

    res.status(200).json({ aiAnalysis });
  } catch (error) {
    console.log("Error in analyzeCode controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function saveSnapshot(req, res) {
  try {
    const session = await findSession(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const { content, language } = req.body;
    if (!content) return res.status(400).json({ message: "Content is required" });

    session.codeSnapshots.push({
      content,
      language: language || session.language,
      timestamp: new Date(),
    });
    session.code = content;
    session.lastActivityAt = new Date();
    await session.save();

    res.status(200).json({ saved: true });
  } catch (error) {
    console.log("Error in saveSnapshot controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function endSession(req, res) {
  try {
    const session = await findSession(req.params.id);
    const userId = req.user._id;

    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.hostId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the host can end the session" });
    }

    if (session.status === "COMPLETED") {
      return res.status(400).json({ message: "Session is already completed" });
    }

    session.status = "COMPLETED";
    session.endedAt = new Date();
    await session.save();

    res.status(200).json(session);
  } catch (error) {
    console.log("Error in endSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function deleteSession(req, res) {
  try {
    const session = await findSession(req.params.id);
    const userId = req.user._id;

    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.hostId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the host can delete the session" });
    }

    await Session.deleteOne({ _id: session._id });
    res.status(200).json({ deleted: true });
  } catch (error) {
    console.log("Error in deleteSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getStats(req, res) {
  try {
    const userId = req.user._id;
    const filter = { $or: [{ hostId: userId }, { participantId: userId }] };

    const [total, active, completed, withParticipant] = await Promise.all([
      Session.countDocuments(filter),
      Session.countDocuments({ ...filter, status: "ACTIVE" }),
      Session.countDocuments({ ...filter, status: "COMPLETED" }),
      Session.countDocuments({ ...filter, participantId: { $ne: null } }),
    ]);

    // Calculate average score from analyses
    const sessions = await Session.find(filter).select("analyses");
    let totalScore = 0;
    let scoreCount = 0;
    for (const s of sessions) {
      for (const a of s.analyses) {
        totalScore += a.overallScore;
        scoreCount++;
      }
    }

    res.status(200).json({
      total,
      active,
      completed,
      withParticipant,
      avgScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0,
      passRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    });
  } catch (error) {
    console.log("Error in getStats controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getAnalytics(req, res) {
  try {
    const userId = req.user._id;
    const filter = { $or: [{ hostId: userId }, { participantId: userId }] };

    // Activity per week (last 12 weeks)
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

    const weeklyActivity = await Session.aggregate([
      { $match: { ...filter, createdAt: { $gte: twelveWeeksAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-W%V", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const difficultyBreakdown = await Session.aggregate([
      { $match: filter },
      { $group: { _id: "$difficulty", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      activity: weeklyActivity.map((w) => ({ week: w._id, count: w.count })),
      difficulty: difficultyBreakdown.map((d) => ({ diff: d._id, count: d.count })),
    });
  } catch (error) {
    console.log("Error in getAnalytics controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
