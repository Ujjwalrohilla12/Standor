import Anthropic from "@anthropic-ai/sdk";
import Session from "../models/Session.js";
import { ENV } from "../lib/env.js";

const anthropic = new Anthropic({ apiKey: ENV.ANTHROPIC_API_KEY });

export async function analyzeCode(req, res) {
  try {
    const { id } = req.params;
    const { code, language, problem } = req.body;

    if (!code || !language) {
      return res.status(400).json({ message: "code and language are required" });
    }

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const stream = anthropic.messages.stream({
      model: "claude-opus-4-6",
      max_tokens: 2048,
      thinking: { type: "adaptive" },
      system: `You are an expert software engineer and code reviewer. 
Analyze the provided code solution for a coding interview problem.
Return a JSON object with exactly these fields:
{
  "timeComplexity": "e.g. O(n log n)",
  "spaceComplexity": "e.g. O(n)",
  "correctness": "Correct / Partially Correct / Incorrect - with brief reason",
  "bugs": ["list of specific bugs found, empty array if none"],
  "suggestions": ["list of 2-4 specific improvement suggestions"],
  "codeStyle": "Brief comment on naming, readability, structure",
  "overallScore": <integer 0-10>,
  "summary": "2-3 sentence overall evaluation"
}
Return ONLY valid JSON, no markdown, no extra text.`,
      messages: [
        {
          role: "user",
          content: `Problem: ${problem || session.problem}
Language: ${language}
Difficulty: ${session.difficulty}

Code Solution:
\`\`\`${language}
${code}
\`\`\``,
        },
      ],
    });

    const message = await stream.finalMessage();
    const textBlock = message.content.find((b) => b.type === "text");
    const rawText = textBlock?.text?.trim() || "{}";

    let analysis;
    try {
      analysis = JSON.parse(rawText);
    } catch {
      // fallback if Claude wraps in markdown
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    }

    analysis.analyzedAt = new Date();

    // persist analysis to session
    await Session.findByIdAndUpdate(id, { aiAnalysis: analysis });

    res.status(200).json({ analysis });
  } catch (error) {
    console.error("Error in analyzeCode controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getAnalysis(req, res) {
  try {
    const { id } = req.params;
    const session = await Session.findById(id).select("aiAnalysis");
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.status(200).json({ analysis: session.aiAnalysis });
  } catch (error) {
    console.error("Error in getAnalysis controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
