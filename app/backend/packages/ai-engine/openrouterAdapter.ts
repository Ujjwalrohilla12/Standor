import type { AICodeAnalysisInput, AICodeAnalysisOutput } from '../shared-types/types'

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'

/**
 * OpenRouterAdapter
 *
 * Generic OpenRouter adapter — supports any model available on OpenRouter.
 * Defaults to gemini-flash for fast, cheap analysis. Switch model via ctor.
 */
export class OpenRouterAdapter {
    constructor(
        private apiKey: string,
        private model = 'google/gemini-2.0-flash-001'
    ) { }

    private buildPrompt(input: AICodeAnalysisInput): string {
        return `You are a FAANG-level code reviewer assessing a candidate's solution during a live technical interview.

Language: ${input.language}
${input.problemDescription ? `Problem: ${input.problemDescription}` : ''}

Code:
\`\`\`${input.language}
${input.code}
\`\`\`

Return ONLY a JSON object with this shape (no markdown wrapper):
{
  "timeComplexity": "O(...)",
  "spaceComplexity": "O(...)",
  "correctness": "correct" | "partially correct" | "incorrect",
  "bugs": [],
  "suggestions": [],
  "testCases": [],
  "codeStyle": "brief style notes",
  "overallScore": <integer 0-10>,
  "summary": "2-3 sentence evaluation"
}`
    }

    async analyzeCode(input: AICodeAnalysisInput): Promise<AICodeAnalysisOutput> {
        const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.apiKey}`,
                'HTTP-Referer': 'https://standor.dev',
                'X-Title': 'Standor',
            },
            body: JSON.stringify({
                model: this.model,
                messages: [{ role: 'user', content: this.buildPrompt(input) }],
                temperature: 0.15,
                max_tokens: 1024,
            }),
        })

        if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.status}`)
        }

        const data = await response.json() as { choices: Array<{ message: { content: string } }> }
        const content = data.choices[0]?.message?.content ?? ''

        // strip ```json ... ``` if model wraps it anyway
        const stripped = content.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim()

        try {
            return JSON.parse(stripped) as AICodeAnalysisOutput
        } catch {
            throw new Error(`OpenRouter returned unparseable response: ${content.slice(0, 120)}`)
        }
    }
}
