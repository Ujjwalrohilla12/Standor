import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function safeParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

export async function transcribeAudioChunk({ audioBase64, mimeType = "audio/webm" }) {
  if (!process.env.GEMINI_API_KEY) return { transcript: "", confidence: 0 };

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt =
      "Transcribe this interview audio chunk accurately. Return only valid JSON: {\"transcript\":\"...\",\"confidence\":0.0,\"keyPoints\":[\"...\"]}. If speech is unclear or silent, return an empty transcript string.";

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType,
          data: audioBase64,
        },
      },
    ]);

    const text = result?.response?.text?.() || "";
    const parsed = safeParseJson(text);
    if (!parsed) return { transcript: "", confidence: 0 };

    return {
      transcript: String(parsed.transcript || "").trim(),
      confidence: Number(parsed.confidence || 0),
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
    };
  } catch (error) {
    console.error("transcribeAudioChunk error:", error.message);
    return { transcript: "", confidence: 0 };
  }
}

export async function buildMeetingSummaryAndPerformance({
  problem,
  language,
  transcripts,
  codeAnalyses,
}) {
  const transcriptText = (transcripts || [])
    .map((t, idx) => `[${idx + 1}] ${t.speaker}: ${t.text}`)
    .join("\n");

  const codeSnapshot = (codeAnalyses || [])
    .map((a, idx) => `Analysis ${idx + 1}: score=${a.overallScore}, summary=${a.summary}`)
    .join("\n");

  if (!process.env.GEMINI_API_KEY) {
    return fallbackReport({ problem, language, transcripts, codeAnalyses });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an expert technical interviewer evaluator.
Create a post-interview report from transcript and coding analysis.

Problem: ${problem || "General technical interview"}
Language: ${language || "unknown"}

Transcript lines:
${transcriptText || "No transcript available"}

Code analyses:
${codeSnapshot || "No code analysis available"}

Return ONLY valid JSON with this exact shape:
{
  "meetingSummary": {
    "executiveSummary": "...",
    "topicsCovered": ["..."],
    "technicalHighlights": ["..."],
    "communicationSummary": "...",
    "finalRecommendation": "..."
  },
  "candidatePerformance": {
    "overallScore": 0,
    "problemSolving": 0,
    "technicalDepth": 0,
    "communication": 0,
    "codingQuality": 0,
    "strengths": ["..."],
    "improvementAreas": ["..."],
    "riskFlags": ["..."],
    "decisionSuggestion": "Strong Hire | Hire | Hold | No Hire"
  }
}

Scoring rules:
- Scores must be integers 0-100
- Base your assessment only on available data
- Keep strengths and improvementAreas practical and actionable`;

    const result = await model.generateContent(prompt);
    const text = result?.response?.text?.() || "";
    const parsed = safeParseJson(text);

    if (!parsed?.meetingSummary || !parsed?.candidatePerformance) {
      return fallbackReport({ problem, language, transcripts, codeAnalyses });
    }

    const cp = parsed.candidatePerformance;
    parsed.candidatePerformance.overallScore = clampScore(cp.overallScore);
    parsed.candidatePerformance.problemSolving = clampScore(cp.problemSolving);
    parsed.candidatePerformance.technicalDepth = clampScore(cp.technicalDepth);
    parsed.candidatePerformance.communication = clampScore(cp.communication);
    parsed.candidatePerformance.codingQuality = clampScore(cp.codingQuality);

    return parsed;
  } catch (error) {
    console.error("buildMeetingSummaryAndPerformance error:", error.message);
    return fallbackReport({ problem, language, transcripts, codeAnalyses });
  }
}

function clampScore(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function fallbackReport({ problem, language, transcripts, codeAnalyses }) {
  const transcriptCount = transcripts?.length || 0;
  const codeScores = (codeAnalyses || []).map((a) => Number(a.overallScore || 0));
  const avgCode = codeScores.length
    ? Math.round(codeScores.reduce((acc, cur) => acc + cur, 0) / codeScores.length)
    : 0;
  const communication = transcriptCount > 10 ? 75 : transcriptCount > 3 ? 65 : 50;
  const technicalDepth = avgCode || 60;
  const problemSolving = Math.round((technicalDepth + communication) / 2);
  const codingQuality = avgCode || 60;
  const overallScore = Math.round(
    (problemSolving * 0.3) +
      (technicalDepth * 0.25) +
      (communication * 0.2) +
      (codingQuality * 0.25),
  );

  return {
    meetingSummary: {
      executiveSummary: `Interview concluded for ${problem || "technical discussion"} in ${language || "mixed"} context with ${transcriptCount} transcript entries captured.`,
      topicsCovered: [
        "Problem understanding",
        "Approach discussion",
        "Code walkthrough",
      ],
      technicalHighlights: [
        "Code quality signals extracted",
        "Complexity discussion inferred",
      ],
      communicationSummary:
        transcriptCount > 5
          ? "Candidate communicated approach with moderate clarity."
          : "Limited transcript data; communication assessment has low confidence.",
      finalRecommendation:
        overallScore >= 75
          ? "Proceed to next stage"
          : "Further evaluation recommended before final decision",
    },
    candidatePerformance: {
      overallScore,
      problemSolving,
      technicalDepth,
      communication,
      codingQuality,
      strengths: [
        "Participated in interview flow",
        "Demonstrated coding attempt",
      ],
      improvementAreas: [
        "Add stronger edge-case coverage",
        "Improve explanation of trade-offs",
      ],
      riskFlags: [],
      decisionSuggestion:
        overallScore >= 80
          ? "Hire"
          : overallScore >= 65
            ? "Hold"
            : "No Hire",
    },
  };
}

export function buildHostEmailHtml({ session, hostName, candidateName, report }) {
  const ms = report.meetingSummary;
  const cp = report.candidatePerformance;

  const getScoreColor = (score) => {
    if (score >= 75) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const scoreBarHtml = (score) => `
    <div style="background: #f0f0f0; height: 8px; border-radius: 4px; overflow: hidden;">
      <div style="background: ${getScoreColor(score)}; height: 100%; width: ${score}%; transition: width 0.3s;"></div>
    </div>
  `;

  return `
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#f5f5f5">
    <div style="background:#ffffff;max-width:600px;margin:0 auto;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
      <!-- Header -->
      <div style="background:linear-gradient(135deg, #1f2937 0%, #374151 100%);padding:32px;text-align:center;border-bottom:4px solid #3b82f6">
        <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700">Standor Interview Report</h1>
        <p style="margin:8px 0 0 0;color:#e5e7eb;font-size:14px">${session.problem || "Technical Interview"}</p>
      </div>

      <!-- Content -->
      <div style="padding:32px;color:#1f2937">
        <p style="margin:0 0 16px 0;font-size:15px">Hello ${hostName || "Interviewer"},</p>
        <p style="margin:0 0 24px 0;font-size:15px;color:#4b5563">Your AI-powered meeting analysis is ready. Below is a comprehensive evaluation of the candidate's performance.</p>

        <!-- Candidate Info -->
        <div style="background:#f9fafb;border-left:4px solid #3b82f6;padding:16px;margin:24px 0;border-radius:4px">
          <p style="margin:0;font-weight:600;color:#1f2937">Candidate: ${candidateName || "Candidate"}</p>
          <p style="margin:8px 0 0 0;font-size:13px;color:#6b7280">Interview Date: ${new Date().toLocaleDateString()}</p>
        </div>

        <!-- Overall Score -->
        <div style="background:#f0f9ff;border:1px solid #bfdbfe;border-radius:8px;padding:20px;margin:24px 0">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <span style="font-weight:600;color:#1f2937">Overall Score</span>
            <span style="font-size:32px;font-weight:700;color:${getScoreColor(cp.overallScore)}">${cp.overallScore}</span>
          </div>
          ${scoreBarHtml(cp.overallScore)}
          <p style="margin:12px 0 0 0;font-size:12px;color:#6b7280">Range: 0-100</p>
        </div>

        <!-- Performance Breakdown -->
        <div style="margin:24px 0">
          <h3 style="margin:0 0 16px 0;font-size:16px;font-weight:600;color:#1f2937">Performance Breakdown</h3>
          
          <div style="margin-bottom:16px">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:14px">
              <span style="color:#4b5563">Problem Solving</span>
              <span style="font-weight:600;color:#1f2937">${cp.problemSolving}/100</span>
            </div>
            ${scoreBarHtml(cp.problemSolving)}
          </div>

          <div style="margin-bottom:16px">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:14px">
              <span style="color:#4b5563">Technical Depth</span>
              <span style="font-weight:600;color:#1f2937">${cp.technicalDepth}/100</span>
            </div>
            ${scoreBarHtml(cp.technicalDepth)}
          </div>

          <div style="margin-bottom:16px">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:14px">
              <span style="color:#4b5563">Communication</span>
              <span style="font-weight:600;color:#1f2937">${cp.communication}/100</span>
            </div>
            ${scoreBarHtml(cp.communication)}
          </div>

          <div style="margin-bottom:16px">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:14px">
              <span style="color:#4b5563">Coding Quality</span>
              <span style="font-weight:600;color:#1f2937">${cp.codingQuality}/100</span>
            </div>
            ${scoreBarHtml(cp.codingQuality)}
          </div>
        </div>

        <!-- Executive Summary -->
        <div style="margin:24px 0">
          <h3 style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#1f2937">Executive Summary</h3>
          <p style="margin:0;line-height:1.6;color:#4b5563;font-size:14px">${ms.executiveSummary}</p>
        </div>

        <!-- Communication -->
        <div style="margin:24px 0">
          <h3 style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#1f2937">Communication Assessment</h3>
          <p style="margin:0;line-height:1.6;color:#4b5563;font-size:14px">${ms.communicationSummary}</p>
        </div>

        <!-- Strengths -->
        ${(cp.strengths || []).length > 0 ? `
        <div style="margin:24px 0;background:#f0fdf4;border:1px solid #dcfce7;border-radius:8px;padding:16px">
          <h3 style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#15803d">Strengths</h3>
          <ul style="margin:0;padding-left:24px;color:#166534">
            ${(cp.strengths || []).map((s) => `<li style="margin:6px 0;font-size:14px">${s}</li>`).join("")}
          </ul>
        </div>
        ` : ''}

        <!-- Improvement Areas -->
        ${(cp.improvementAreas || []).length > 0 ? `
        <div style="margin:24px 0;background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:16px">
          <h3 style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#b45309">Areas for Improvement</h3>
          <ul style="margin:0;padding-left:24px;color:#92400e">
            ${(cp.improvementAreas || []).map((s) => `<li style="margin:6px 0;font-size:14px">${s}</li>`).join("")}
          </ul>
        </div>
        ` : ''}

        <!-- Risk Flags -->
        ${(cp.riskFlags || []).length > 0 ? `
        <div style="margin:24px 0;background:#fee2e2;border:1px solid #fecaca;border-radius:8px;padding:16px">
          <h3 style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#991b1b">Risk Flags</h3>
          <ul style="margin:0;padding-left:24px;color:#7f1d1d">
            ${(cp.riskFlags || []).map((s) => `<li style="margin:6px 0;font-size:14px">${s}</li>`).join("")}
          </ul>
        </div>
        ` : ''}

        <!-- Tags -->
        ${ms.topicsCovered && ms.topicsCovered.length > 0 ? `
        <div style="margin:24px 0">
          <h3 style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:#1f2937">Topics Covered</h3>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            ${ms.topicsCovered.map((t) => `<span style="background:#e0e7ff;color:#3730a3;padding:6px 12px;border-radius:20px;font-size:13px;font-weight:500">${t}</span>`).join("")}
          </div>
        </div>
        ` : ''}
      </div>

      <!-- Footer -->
      <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px;text-align:center">
        <p style="margin:0 0 8px 0;font-size:12px;color:#6b7280">This detailed report is intended exclusively for interviewer use.</p>
        <p style="margin:0;font-size:12px;color:#9ca3af">© 2026 Standor. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>`;
}

export function buildCandidateGenericEmailHtml({ candidateName }) {
  return `
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#f5f5f5">
    <div style="background:#ffffff;max-width:600px;margin:0 auto;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
      <!-- Header -->
      <div style="background:linear-gradient(135deg, #1f2937 0%, #374151 100%);padding:40px 32px;text-align:center">
        <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700">Thank You!</h1>
        <p style="margin:8px 0 0 0;color:#e5e7eb;font-size:14px">Thank you for interviewing with Standor</p>
      </div>

      <!-- Content -->
      <div style="padding:40px 32px;color:#1f2937">
        <p style="margin:0 0 20px 0;font-size:16px;line-height:1.6">Hello ${candidateName || "Candidate"},</p>

        <div style="background:#f0f9ff;border-left:4px solid #3b82f6;padding:20px;border-radius:4px;margin:24px 0">
          <p style="margin:0;font-size:15px;line-height:1.6;color:#1e40af">
            <strong>We truly appreciate the time and effort you dedicated to interviewing with us today.</strong>
          </p>
          <p style="margin:12px 0 0 0;font-size:14px;line-height:1.6;color:#1e40af">
            Your responses and approach to problem-solving provided us with valuable insights. We're impressed by your enthusiasm and contributions to our discussion.
          </p>
        </div>

        <p style="margin:24px 0 12px 0;font-size:15px;line-height:1.6;color:#4b5563">
          <strong>What Happens Next?</strong>
        </p>
        <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#6b7280">
          Our team is now reviewing all interview materials carefully. We will assess your performance and evaluate the fit for the role. You can expect to hear from us with the results or next steps within <strong>3-4 working days</strong>.
        </p>

        <!-- Timeline -->
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:24px 0">
          <h3 style="margin:0 0 16px 0;font-size:14px;font-weight:600;color:#1f2937;text-align:center">Expected Timeline</h3>
          <table style="width:100%;text-align:center;font-size:13px">
            <tr>
              <td style="padding:8px;color:#6b7280">Interview Today</td>
              <td style="color:#3b82f6;font-weight:600">→</td>
              <td style="padding:8px;color:#6b7280">Review Period</td>
              <td style="color:#3b82f6;font-weight:600">→</td>
              <td style="padding:8px;color:#10b981;font-weight:600">Results (3-4 days)</td>
            </tr>
          </table>
        </div>

        <p style="margin:24px 0 12px 0;font-size:15px;line-height:1.6;color:#4b5563">
          <strong>In the Meantime</strong>
        </p>
        <ul style="margin:0;padding-left:20px;color:#6b7280;font-size:14px;line-height:1.8">
          <li>Feel free to reach out if you have any questions</li>
          <li>Explore our website to learn more about our company culture and projects</li>
          <li>Connect with us on LinkedIn for updates and insights</li>
        </ul>

        <p style="margin:24px 0 0 0;font-size:15px;line-height:1.6;color:#4b5563">
          Thank you again for your interest and participation. We're excited about the possibility of working together!
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px;text-align:center">
        <p style="margin:0 0 16px 0;font-size:14px;color:#1f2937;font-weight:500">Standor Hiring Team</p>
        <p style="margin:0 0 8px 0;font-size:12px;color:#6b7280">Standor — AI-Powered Technical Interviews</p>
        <p style="margin:0;font-size:12px;color:#9ca3af">© 2026 Standor. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>`;
}
