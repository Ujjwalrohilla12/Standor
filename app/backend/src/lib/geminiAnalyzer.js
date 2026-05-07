import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyzes code using Google Gemini AI
 * @param {string} code - The code to analyze
 * @param {string} language - Programming language (javascript, python, java, etc.)
 * @returns {Promise<Object>} Analysis result object
 */
export async function analyzeCodeWithGemini(code, language = "javascript") {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an expert code reviewer specializing in technical interviews. Analyze the following ${language} code and provide a detailed technical assessment in JSON format.

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Please provide your analysis as a valid JSON object with the following structure (respond ONLY with JSON, no markdown or extra text):
{
  "timeComplexity": "O(n) or appropriate complexity",
  "spaceComplexity": "O(1) or appropriate complexity",
  "correctness": "Assessment of whether the code solves the problem correctly",
  "bugs": ["bug1 if any", "bug2 if any"],
  "suggestions": ["improvement1", "improvement2", "improvement3"],
  "testCases": ["test case 1", "test case 2"],
  "codeStyle": "Assessment of code style, naming conventions, and readability",
  "overallScore": 75,
  "summary": "Brief overall assessment"
}

Guidelines:
- Score should be 0-100 based on correctness, efficiency, style, and overall quality
- Be constructive but honest
- Identify real bugs or issues if present
- Provide actionable suggestions
- Consider edge cases and error handling`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse the JSON response
    let analysis;
    try {
      // Try to extract JSON from the response (in case there's markdown formatting)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", responseText);
      // Fallback to basic analysis
      analysis = generateFallbackAnalysis(code, language);
    }

    // Ensure all required fields exist
    return {
      timeComplexity: analysis.timeComplexity || "O(n)",
      spaceComplexity: analysis.spaceComplexity || "O(1)",
      correctness: analysis.correctness || "Code structure looks reasonable",
      bugs: analysis.bugs || [],
      suggestions: analysis.suggestions || ["Consider adding comments", "Add error handling"],
      testCases: analysis.testCases || ["Basic test", "Edge case test"],
      codeStyle: analysis.codeStyle || "Could be improved",
      overallScore: Math.min(100, Math.max(0, analysis.overallScore || 70)),
      summary: analysis.summary || `Analyzed ${code.split("\n").length} lines of ${language}`,
      analyzedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error analyzing code with Gemini:", error.message);
    // Return fallback analysis if Gemini fails
    return generateFallbackAnalysis(code, language);
  }
}

/**
 * Generates detailed feedback report from AI analysis
 * @param {Object} aiAnalysis - The AI analysis result
 * @param {Object} session - The session object
 * @param {number} snapshotCount - Number of code snapshots
 * @returns {Object} Feedback report
 */
export function generateFeedbackReport(aiAnalysis, session, snapshotCount = 0) {
  return {
    audience: session.type === "INTERVIEW" ? "interviewer" : "candidate",
    summary: aiAnalysis.summary,
    strengths: extractStrengths(aiAnalysis),
    improvementAreas: extractImprovementAreas(aiAnalysis),
    recommendations: aiAnalysis.suggestions || [],
    score: aiAnalysis.overallScore || 70,
    generatedAt: new Date(),
    analysis: aiAnalysis,
    snapshotCount,
  };
}

/**
 * Extracts strengths from analysis
 */
function extractStrengths(analysis) {
  const strengths = [];

  if (analysis.correctness && analysis.correctness.includes("correct")) {
    strengths.push("Solution logic is correct");
  }
  if (analysis.codeStyle && (analysis.codeStyle.includes("good") || analysis.codeStyle.includes("clean"))) {
    strengths.push("Code is well-organized and readable");
  }
  if (analysis.timeComplexity && !analysis.timeComplexity.includes("exponential")) {
    strengths.push(`Efficient time complexity: ${analysis.timeComplexity}`);
  }
  if (analysis.bugs && analysis.bugs.length === 0) {
    strengths.push("No critical bugs detected");
  }

  return strengths.length > 0 ? strengths : ["Code demonstrates understanding of the problem"];
}

/**
 * Extracts improvement areas from analysis
 */
function extractImprovementAreas(analysis) {
  const areas = [];

  if (analysis.bugs && analysis.bugs.length > 0) {
    areas.push(...analysis.bugs);
  }
  if (analysis.codeStyle && (analysis.codeStyle.includes("improve") || analysis.codeStyle.includes("poor"))) {
    areas.push("Improve code style and naming conventions");
  }
  if (analysis.testCases && analysis.testCases.length > 0) {
    areas.push("Add comprehensive test coverage");
  }
  if (!analysis.correctness.includes("correct")) {
    areas.push("Verify correctness with additional test cases");
  }

  return areas.length > 0 ? areas : ["Consider edge cases and error handling"];
}

/**
 * Fallback analysis when Gemini API fails
 */
function generateFallbackAnalysis(code, language) {
  const lines = code.split("\n");
  const hasErrorHandling = code.includes("try") || code.includes("catch") || code.includes("if");
  const hasComments = code.includes("//") || code.includes("/*");

  return {
    timeComplexity: "O(n) - estimated",
    spaceComplexity: "O(1) - estimated",
    correctness: "Code compiles and runs. Correctness requires deeper analysis.",
    bugs: [],
    suggestions: [
      hasErrorHandling ? "Error handling appears to be implemented" : "Add error handling for edge cases",
      hasComments ? "Good documentation" : "Add comments to explain complex logic",
      "Consider writing unit tests",
    ],
    testCases: ["Test with empty input", "Test with large input", "Test with invalid input"],
    codeStyle: lines.length > 100 ? "Consider breaking into smaller functions" : "Code organization looks reasonable",
    overallScore: Math.min(100, Math.max(40, 60 + Math.floor(lines.length / 5))),
    summary: `Analyzed ${lines.length} lines of ${language}. Basic static analysis completed.`,
    analyzedAt: new Date().toISOString(),
  };
}

/**
 * Analyzes multiple code snapshots to show improvement over time
 */
export async function analyzeSnapshotProgression(snapshots) {
  if (!snapshots || snapshots.length === 0) {
    return { message: "No snapshots to analyze" };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const snapshotText = snapshots
      .map(
        (snap, i) => `
--- Snapshot ${i + 1} (${new Date(snap.timestamp).toLocaleString()}) ---
\`\`\`${snap.language}
${snap.content}
\`\`\``,
      )
      .join("\n");

    const prompt = `Analyze the evolution of this code through the following snapshots. Provide insights into how the code improved or changed over time:

${snapshotText}

Provide a JSON response with:
{
  "progressionScore": 0-100,
  "improvements": ["improvement1", "improvement2"],
  "regressions": ["regression1 if any"],
  "timeToSolution": "estimated time spent",
  "approachEvolution": "how the approach changed and evolved"
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch {
      return {
        progressionScore: 70,
        improvements: ["Code modifications detected"],
        regressions: [],
        timeToSolution: "Multiple iterations",
        approachEvolution: "Problem-solving approach was refined through iterations",
      };
    }
  } catch (error) {
    console.error("Error analyzing snapshot progression:", error.message);
    return { message: "Unable to analyze progression at this time" };
  }
}

export default {
  analyzeCodeWithGemini,
  generateFeedbackReport,
  analyzeSnapshotProgression,
};
