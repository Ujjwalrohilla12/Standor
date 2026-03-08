import axios from 'axios'
import { env } from '../config/env.js'

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'
const DEEPSEEK_BASE = 'https://api.deepseek.com/v1'
const OLLAMA_BASE = 'http://localhost:11434/api'

type AIProvider = 'openrouter' | 'deepseek' | 'ollama'
const DEFAULT_PROVIDER: AIProvider = (process.env.AI_PROVIDER as AIProvider) || 'openrouter'
const MODEL_MAPPING = {
    openrouter: 'google/gemini-2.0-flash-001',
    deepseek: 'deepseek-coder',
    ollama: 'deepseek-coder:6.7b'
}

function buildPrompt(code: string, language: string): string {
    return `You are an expert FAANG-level code reviewer. Analyze the following ${language} code and respond ONLY with a valid JSON object. No markdown, no explanation outside JSON.

Code:
\`\`\`${language}
${code}
\`\`\`

Respond with exactly this JSON shape:
{
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(1)",
  "correctness": "string describing correctness",
  "bugs": ["bug description 1", "bug description 2"],
  "suggestions": ["suggestion 1", "suggestion 2"],
  "testCases": [
    { "input": "example input", "expectedOutput": "expected", "description": "edge case description" }
  ],
  "codeStyle": "string describing code style and readability",
  "overallScore": 8,
  "summary": "one paragraph summary of the solution"
}`
}

export class AIService {
    static async analyzeCode(code: string, language: string) {
        console.log(`[AI] Analyzing ${language} code via ${DEFAULT_PROVIDER}...`)

        const apiKey = DEFAULT_PROVIDER === 'openrouter' ? env.OPENROUTER_API_KEY : env.DEEPSEEK_API_KEY
        if (!apiKey && DEFAULT_PROVIDER !== 'ollama') {
            console.warn(`[AI] API Key missing for ${DEFAULT_PROVIDER} — returning stub`)
            return stubAnalysis(code, language)
        }

        try {
            let rawResult = ''

            if (DEFAULT_PROVIDER === 'ollama') {
                const { data } = await axios.post(`${OLLAMA_BASE}/generate`, {
                    model: MODEL_MAPPING.ollama,
                    prompt: buildPrompt(code, language),
                    stream: false,
                    format: 'json'
                })
                rawResult = data.response
            } else {
                const endpoint = DEFAULT_PROVIDER === 'deepseek' ? DEEPSEEK_BASE : OPENROUTER_BASE
                const model = MODEL_MAPPING[DEFAULT_PROVIDER]

                const { data } = await axios.post(
                    `${endpoint}/chat/completions`,
                    {
                        model,
                        messages: [{ role: 'user', content: buildPrompt(code, language) }],
                        temperature: 0.15,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${apiKey}`,
                            'Content-Type': 'application/json'
                        },
                        timeout: 45_000
                    }
                )
                rawResult = data?.choices?.[0]?.message?.content ?? ''
            }

            const jsonText = rawResult.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
            const parsed = JSON.parse(jsonText)

            return {
                timeComplexity: String(parsed.timeComplexity ?? 'Unknown'),
                spaceComplexity: String(parsed.spaceComplexity ?? 'Unknown'),
                correctness: String(parsed.correctness ?? 'Unknown'),
                bugs: Array.isArray(parsed.bugs) ? parsed.bugs.map(String) : [],
                suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.map(String) : [],
                testCases: Array.isArray(parsed.testCases) ? parsed.testCases.map((tc: any) => `${tc.input} -> ${tc.expectedOutput}`) : [],
                codeStyle: String(parsed.codeStyle ?? ''),
                overallScore: Math.min(10, Math.max(0, Number(parsed.overallScore) || 5)),
                summary: String(parsed.summary ?? ''),
            }
        } catch (err) {
            console.error(`[AI] ${DEFAULT_PROVIDER} provider error:`, err)
            return stubAnalysis(code, language)
        }
    }
}

function stubAnalysis(code: string, language: string) {
    const lines = code.split('\n').length
    return {
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        correctness: 'Analysis unavailable — configure OPENROUTER_API_KEY for real analysis',
        bugs: [],
        suggestions: [
            'Add input validation for edge cases',
            'Consider adding inline comments for complex logic',
        ],
        testCases: [
            { input: 'example', expectedOutput: 'result', description: 'Basic test case' },
        ],
        codeStyle: `${lines}-line ${language} solution with standard conventions`,
        overallScore: 7,
        summary: `This ${language} solution has been submitted for review. Enable AI analysis by setting OPENROUTER_API_KEY in your backend environment.`,
    }
}
