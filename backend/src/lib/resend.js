import { Resend } from "resend";
import { ENV } from "./env.js";

export const resend = new Resend(ENV.RESEND_API_KEY);

function scoreColor(score) {
  if (score >= 8) return "#22c55e";
  if (score >= 5) return "#f59e0b";
  return "#ef4444";
}

function bugsHTML(bugs) {
  if (!bugs || bugs.length === 0) {
    return `<span style="color:#22c55e;font-weight:600;">✅ No bugs found</span>`;
  }
  return bugs
    .map((b) => `<li style="color:#ef4444;margin-bottom:4px;">• ${b}</li>`)
    .join("");
}

function suggestionsHTML(suggestions) {
  if (!suggestions || suggestions.length === 0) return "<li>None</li>";
  return suggestions
    .map((s) => `<li style="margin-bottom:4px;">💡 ${s}</li>`)
    .join("");
}

export function generateFeedbackEmail({ recipientName, sessionProblem, sessionDifficulty, analysis, role }) {
  const score = analysis?.overallScore ?? "N/A";
  const color = typeof score === "number" ? scoreColor(score) : "#6b7280";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Standor - Session Feedback</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-size:28px;font-weight:900;color:#fff;letter-spacing:2px;font-family:monospace;">Standor</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Code Together · Interview Smarter</p>
            </td>
          </tr>

          <!-- GREETING -->
          <tr>
            <td style="padding:32px 40px 0;">
              <h2 style="margin:0 0 8px;font-size:22px;color:#f1f5f9;">Hey ${recipientName} 👋</h2>
              <p style="margin:0;color:#94a3b8;font-size:15px;line-height:1.6;">
                Your <strong style="color:#a78bfa;">${role === "host" ? "interview session" : "coding session"}</strong> has ended.
                Here's the AI-powered analysis of the code solution for <strong style="color:#f1f5f9;">${sessionProblem}</strong>
                <span style="background:#334155;padding:2px 8px;border-radius:4px;font-size:12px;color:#94a3b8;margin-left:4px;">${sessionDifficulty}</span>
              </p>
            </td>
          </tr>

          <!-- SCORE CARD -->
          <tr>
            <td style="padding:24px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="48%" style="background:#0f172a;border-radius:12px;padding:20px;text-align:center;border:1px solid #334155;">
                    <p style="margin:0 0 4px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Overall Score</p>
                    <p style="margin:0;font-size:40px;font-weight:900;color:${color};">${score}<span style="font-size:20px;color:#64748b;">/10</span></p>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="background:#0f172a;border-radius:12px;padding:20px;text-align:center;border:1px solid #334155;">
                    <p style="margin:0 0 4px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Correctness</p>
                    <p style="margin:0;font-size:16px;font-weight:700;color:#f1f5f9;">${analysis?.correctness || "N/A"}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- COMPLEXITY -->
          <tr>
            <td style="padding:16px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="48%" style="background:#0f172a;border-radius:12px;padding:16px 20px;border:1px solid #334155;">
                    <p style="margin:0 0 4px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Time Complexity</p>
                    <p style="margin:0;font-size:20px;font-weight:700;color:#6366f1;font-family:monospace;">${analysis?.timeComplexity || "—"}</p>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="background:#0f172a;border-radius:12px;padding:16px 20px;border:1px solid #334155;">
                    <p style="margin:0 0 4px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Space Complexity</p>
                    <p style="margin:0;font-size:20px;font-weight:700;color:#8b5cf6;font-family:monospace;">${analysis?.spaceComplexity || "—"}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BUGS -->
          <tr>
            <td style="padding:16px 40px 0;">
              <div style="background:#0f172a;border-radius:12px;padding:20px;border:1px solid #334155;">
                <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">🐛 Bugs Found</p>
                <ul style="margin:0;padding:0;list-style:none;">
                  ${bugsHTML(analysis?.bugs)}
                </ul>
              </div>
            </td>
          </tr>

          <!-- SUGGESTIONS -->
          ${analysis?.suggestions?.length > 0 ? `
          <tr>
            <td style="padding:16px 40px 0;">
              <div style="background:#0f172a;border-radius:12px;padding:20px;border:1px solid #334155;">
                <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">✨ Suggestions</p>
                <ul style="margin:0;padding:0 0 0 4px;list-style:none;color:#cbd5e1;font-size:14px;line-height:1.6;">
                  ${suggestionsHTML(analysis?.suggestions)}
                </ul>
              </div>
            </td>
          </tr>` : ""}

          <!-- CODE STYLE -->
          ${analysis?.codeStyle ? `
          <tr>
            <td style="padding:16px 40px 0;">
              <div style="background:#0f172a;border-radius:12px;padding:20px;border:1px solid #334155;">
                <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">🎨 Code Style</p>
                <p style="margin:0;color:#cbd5e1;font-size:14px;line-height:1.6;">${analysis.codeStyle}</p>
              </div>
            </td>
          </tr>` : ""}

          <!-- SUMMARY -->
          ${analysis?.summary ? `
          <tr>
            <td style="padding:16px 40px 0;">
              <div style="background:linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.1));border-radius:12px;padding:20px;border:1px solid rgba(99,102,241,0.3);">
                <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#a78bfa;text-transform:uppercase;letter-spacing:1px;">📋 Summary</p>
                <p style="margin:0;color:#e2e8f0;font-size:15px;line-height:1.7;">${analysis.summary}</p>
              </div>
            </td>
          </tr>` : ""}

          <!-- FOOTER -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0;font-size:13px;color:#475569;text-align:center;border-top:1px solid #334155;padding-top:24px;">
                This report was generated by <strong style="color:#6366f1;">Standor</strong> AI Code Analyzer · Powered by Claude Opus 4.6
                <br/>
                <span style="font-size:11px;color:#334155;">${new Date().toUTCString()}</span>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendFeedbackEmail({ to, name, sessionProblem, sessionDifficulty, analysis, role }) {
  if (!ENV.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping email");
    return;
  }

  const html = generateFeedbackEmail({ recipientName: name, sessionProblem, sessionDifficulty, analysis, role });

  await resend.emails.send({
    from: "Standor <feedback@resend.dev>",
    to: [to],
    subject: `Standor - Session Feedback: ${sessionProblem}`,
    html,
  });
}
