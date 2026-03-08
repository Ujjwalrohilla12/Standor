import axios from 'axios'
import { z } from 'zod'
import type { AIAdapter, AnalysisResult } from '../types.js'

const SYSTEM_PROMPT = `You are an expert code reviewer for technical interviews.
Analyze the provided code and respond ONLY with a valid JSON object matching this schema:
{
  "summary": "string — 1-2 sentence overall assessment",
  "complexity": { "time": "Big-O string", "space": "Big-O string" },
  "bugs": ["string", ...],
  "suggestions": ["string", ...],
  "style": number (1-10),
  "tests": ["string — test case description", ...],
  "overallScore": number (1-10)
}
Do not include markdown, code fences, or any text outside the JSON object.`

const resultSchema = z.object({
    summary: z.string(),
    complexity: z.object({ time: z.string(), space: z.string() }),
    bugs: z.array(z.string()),
    suggestions: z.array(z.string()),
    style: z.number().min(1).max(10),
    tests: z.array(z.string()),
    overallScore: z.number().min(1).max(10),
})

export class OpenRouterAdapter implements AIAdapter {
    constructor(
        private readonly apiKey: string,
        private readonly model: string,
    ) { }

    async analyze(code: string, language: string): Promise<AnalysisResult> {
        const userMessage = `Language: ${language}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\``

        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: this.model,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: userMessage },
                ],
                temperature: 0.2,
                max_tokens: 1024,
                response_format: { type: 'json_object' },
            },
            {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://standor.dev',
                    'X-Title': 'Standor',
                },
                timeout: 30_000,
            },
        )

        const content = response.data?.choices?.[0]?.message?.content as string | undefined
        if (!content) throw new Error('Empty AI response')

        const parsed = JSON.parse(content) as unknown
        return resultSchema.parse(parsed)
    }
}
