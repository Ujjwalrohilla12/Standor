import Session from "../models/Session.js";
import mongoose from "mongoose";
import { analyzeCodeWithGemini, generateFeedbackReport, analyzeSnapshotProgression } from "../lib/geminiAnalyzer.js";
import {
  transcribeAudioChunk,
} from "../lib/meetingInsights.js";
import { finalizeMeetingAndDispatch } from "../lib/meetingFinalize.js";

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

    // Use real Gemini AI analysis instead of fake analysis
    const aiAnalysis = await analyzeCodeWithGemini(code, language || "javascript");
    const feedbackReport = generateFeedbackReport(aiAnalysis, session, session.codeSnapshots?.length || 0);

    session.analyses.push(aiAnalysis);
    session.feedbackReports = session.feedbackReports || [];
    session.feedbackReports.push(feedbackReport);
    session.lastActivityAt = new Date();
    await session.save();

    res.status(200).json({ aiAnalysis, feedbackReport });
  } catch (error) {
    console.log("Error in analyzeCode controller:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
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

export async function getReport(req, res) {
  try {
    const session = await findSession(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const latestReport = session.feedbackReports?.[session.feedbackReports.length - 1] || null;
    if (!latestReport) {
      return res.status(404).json({ message: "No report available" });
    }

    res.status(200).json({ report: latestReport });
  } catch (error) {
    console.log("Error in getReport controller:", error.message);
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

export async function uploadAudioChunk(req, res) {
  try {
    const session = await findSession(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const userId = req.user._id.toString();
    const isHost = session.hostId?.toString() === userId;
    const isCandidate = session.participantId?.toString() === userId;

    if (!isHost && !isCandidate) {
      return res.status(403).json({ message: "Not allowed to upload audio for this meeting" });
    }

    if (!req.file?.buffer) {
      return res.status(400).json({ message: "Audio chunk is required" });
    }

    const mimeType = req.file.mimetype || "audio/webm";
    const audioBase64 = req.file.buffer.toString("base64");
    const speaker = req.body?.speaker || (isHost ? "interviewer" : "candidate");

    const result = await transcribeAudioChunk({ audioBase64, mimeType });

    if (!result.transcript) {
      return res.status(202).json({ accepted: true, transcript: "", skipped: "No speech detected" });
    }

    session.transcripts = session.transcripts || [];
    session.transcripts.push({
      speaker,
      text: result.transcript,
      timestamp: new Date(),
    });
    session.lastActivityAt = new Date();
    await session.save();

    res.status(200).json({
      accepted: true,
      transcript: result.transcript,
      confidence: result.confidence || 0,
      transcriptCount: session.transcripts.length,
    });
  } catch (error) {
    console.log("Error in uploadAudioChunk controller:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}

export async function finalizeMeetingAndSendReports(req, res) {
  try {
    const session = await findSession(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const userId = req.user._id.toString();
    if (session.hostId?.toString() !== userId) {
      return res.status(403).json({ message: "Only the meeting host can finalize reports" });
    }

    const result = await finalizeMeetingAndDispatch({
      session,
      trigger: "manual_finalize_endpoint",
    });

    res.status(200).json({
      finalized: result.finalized,
      hostEmailSent: !!result.hostEmailSent,
      candidateEmailSent: !!result.candidateEmailSent,
      report: {
        meetingSummary: result.report?.meetingSummary || null,
        candidatePerformance: result.report?.candidatePerformance || null,
      },
    });
  } catch (error) {
    console.log("Error in finalizeMeetingAndSendReports controller:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}

export async function getMeetingReport(req, res) {
  try {
    const session = await findSession(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const userId = req.user._id.toString();
    if (session.hostId?.toString() !== userId) {
      return res.status(403).json({ message: "Only interviewer can access meeting performance report" });
    }

    res.status(200).json({
      sessionId: session._id,
      meetingSummary: session.meetingSummary || "",
      performanceReport: session.performanceReport || null,
      transcriptCount: (session.transcripts || []).length,
      endedAt: session.endedAt,
    });
  } catch (error) {
    console.log("Error in getMeetingReport controller:", error.message);
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

/**
 * Get all feedback reports history for a session
 */
export async function getReportHistory(req, res) {
  try {
    const session = await findSession(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const reports = session.feedbackReports || [];
    if (reports.length === 0) {
      return res.status(404).json({ message: "No reports available" });
    }

    // Return reports with metadata
    const history = reports.map((report, index) => ({
      reportNumber: index + 1,
      score: report.score,
      summary: report.summary,
      generatedAt: report.generatedAt,
      snapshotCount: report.snapshotCount,
    }));

    res.status(200).json({
      sessionId: session._id,
      totalReports: history.length,
      history,
    });
  } catch (error) {
    console.log("Error in getReportHistory controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Get detailed report with full analysis
 */
export async function getFullReport(req, res) {
  try {
    const session = await findSession(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const reportIndex = parseInt(req.query.index) || session.feedbackReports.length - 1;
    const report = session.feedbackReports?.[reportIndex];

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json({
      sessionId: session._id,
      problem: session.problem,
      difficulty: session.difficulty,
      language: session.language,
      report,
      snapshotCount: session.codeSnapshots?.length || 0,
      analysisCount: session.analyses?.length || 0,
    });
  } catch (error) {
    console.log("Error in getFullReport controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Analyze code snapshot progression to show improvement over time
 */
export async function analyzeProgression(req, res) {
  try {
    const session = await findSession(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const snapshots = session.codeSnapshots || [];
    if (snapshots.length < 2) {
      return res.status(400).json({ message: "Need at least 2 snapshots for progression analysis" });
    }

    const progression = await analyzeSnapshotProgression(snapshots);

    res.status(200).json({
      sessionId: session._id,
      snapshotCount: snapshots.length,
      progression,
      snapshotTimeline: snapshots.map((s, i) => ({
        index: i + 1,
        timestamp: s.timestamp,
        language: s.language,
        lines: s.content.split("\n").length,
      })),
    });
  } catch (error) {
    console.log("Error in analyzeProgression controller:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}

/**
 * Get all analyses for a session
 */
export async function getAnalyses(req, res) {
  try {
    const session = await findSession(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const analyses = session.analyses || [];
    if (analyses.length === 0) {
      return res.status(404).json({ message: "No analyses available" });
    }

    res.status(200).json({
      sessionId: session._id,
      totalAnalyses: analyses.length,
      analyses: analyses.map((a, i) => ({
        analysisNumber: i + 1,
        score: a.overallScore,
        summary: a.summary,
        timeComplexity: a.timeComplexity,
        spaceComplexity: a.spaceComplexity,
        bugCount: a.bugs?.length || 0,
        analyzedAt: a.analyzedAt,
      })),
      detailedAnalyses: analyses, // Include full details
    });
  } catch (error) {
    console.log("Error in getAnalyses controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Get snapshot history with content
 */
export async function getSnapshotHistory(req, res) {
  try {
    const session = await findSession(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const snapshots = session.codeSnapshots || [];
    if (snapshots.length === 0) {
      return res.status(404).json({ message: "No snapshots available" });
    }

    res.status(200).json({
      sessionId: session._id,
      totalSnapshots: snapshots.length,
      snapshots: snapshots.map((s, i) => ({
        snapshotNumber: i + 1,
        timestamp: s.timestamp,
        language: s.language,
        lines: s.content.split("\n").length,
        preview: s.content.split("\n").slice(0, 5).join("\n"), // First 5 lines
        content: s.content, // Full content
      })),
    });
  } catch (error) {
    console.log("Error in getSnapshotHistory controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

