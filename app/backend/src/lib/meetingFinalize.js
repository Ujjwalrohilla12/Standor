import Session from "../models/Session.js";
import User from "../models/User.js";
import { sendMail } from "./emailer.js";
import {
  buildCandidateGenericEmailHtml,
  buildHostEmailHtml,
  buildMeetingSummaryAndPerformance,
} from "./meetingInsights.js";

const finalizeInFlight = new Set();

function normalizeCode(code) {
  return typeof code === "string" ? code.trim() : "";
}

async function findSessionByCode(code) {
  const normalized = normalizeCode(code);
  if (!normalized) return null;
  return Session.findOne({
    $or: [{ callId: normalized }, { roomId: normalized }],
  });
}

export async function finalizeMeetingAndDispatch({ session, trigger = "manual" }) {
  if (!session) {
    return { finalized: false, reason: "SESSION_NOT_FOUND" };
  }

  const lockKey = String(session._id);
  if (finalizeInFlight.has(lockKey)) {
    return { finalized: false, reason: "FINALIZATION_IN_PROGRESS" };
  }

  if (session.hostNotified) {
    return { finalized: true, reason: "ALREADY_FINALIZED", hostEmailSent: true, candidateEmailSent: true };
  }

  finalizeInFlight.add(lockKey);

  try {
    const [host, candidate] = await Promise.all([
      User.findById(session.hostId).select("name email"),
      session.participantId ? User.findById(session.participantId).select("name email") : null,
    ]);

    const hostEmail = (session.hostEmail || host?.email || "").trim();
    const candidateEmail = (session.candidateEmail || candidate?.email || "").trim();

    const report = await buildMeetingSummaryAndPerformance({
      problem: session.problem,
      language: session.language,
      transcripts: session.transcripts || [],
      codeAnalyses: session.analyses || [],
    });

    session.meetingSummary = report.meetingSummary?.executiveSummary || "";
    session.performanceReport = report.candidatePerformance || null;
    session.status = "COMPLETED";
    if (!session.endedAt) {
      session.endedAt = new Date();
    }

    let hostEmailSent = false;
    let candidateEmailSent = false;

    if (hostEmail) {
      const hostHtml = buildHostEmailHtml({
        session,
        hostName: host?.name,
        candidateName: candidate?.name || "Candidate",
        report,
      });

      const hostMail = await sendMail({
        to: hostEmail,
        subject: `Standor Interview Report - ${session.problem || "Meeting"}`,
        text: "Your interview report is ready. Please view the HTML version for full details.",
        html: hostHtml,
      });

      hostEmailSent = !!hostMail.success;
    }

    if (candidateEmail) {
      const candidateHtml = buildCandidateGenericEmailHtml({
        candidateName: candidate?.name,
      });

      const candidateMail = await sendMail({
        to: candidateEmail,
        subject: "Thank you for interviewing with Standor",
        text: "Thank you for taking the interview. We will share next steps within 3-4 working days.",
        html: candidateHtml,
      });

      candidateEmailSent = !!candidateMail.success;
    }

    // hostNotified is used as the idempotent marker for report dispatch completion.
    session.hostNotified = hostEmailSent;
    session.lastActivityAt = new Date();
    await session.save();

    return {
      finalized: true,
      trigger,
      hostEmailSent,
      candidateEmailSent,
      report,
    };
  } finally {
    finalizeInFlight.delete(lockKey);
  }
}

export async function finalizeMeetingByCode({ code, trigger = "auto_room_empty" }) {
  const session = await findSessionByCode(code);
  if (!session) {
    return { finalized: false, reason: "SESSION_NOT_FOUND" };
  }

  return finalizeMeetingAndDispatch({ session, trigger });
}
