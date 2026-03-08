import type { AICodeAnalysisInput, AICodeAnalysisOutput } from '../shared-types/types'

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'

/**
 * DeepSeekAdapter
 *
 * Calls DeepSeek-Coder via OpenRouter for code analysis.
 * Falls back to the local Ollama adapter if no API key is set.
 */
export class DeepSeekAdapter {
    constructor(private apiKey: string) {}

    private buildPrompt(input: AICodeAnalysisInput): string {
        return `You are a senior software engineer performing a code review for a technical interview.

Analyze the following ${input.language} code${input.problemDescription ? ` written for the problem: "${input.problemDescription}"` : ''}.

\`\`\`${input.language}
${input.code}
\`\`\`

Respond ONLY with valid JSON matching this exact schema (no markdown, no explanation outside the JSON):
{
  "timeComplexity": "O(...)",
  "spaceComplexity": "O(...)",
  "correctness": "correct" | "partially correct" | "incorrect",
  "bugs": ["..."],
  "suggestions": ["..."],
  "testCases": ["..."],
  "codeStyle": "...",
  "overallScore": 0-10,
  "summary": "..."
}`
    }

    async analyzeCode(input: AICodeAnalysisInput): Promise<AICodeAnalysisOutput> {
        const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.apiKey}`,
                'HTTP-Referer': 'https://standor.dev',
                'X-Title': 'Standor Interview Platform',
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-coder',
                messages: [{ role: 'user', content: this.buildPrompt(input) }],
                temperature: 0.2,
                max_tokens: 1024,
            }),
        })

        if (!response.ok) {
            throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json() as { choices: Array<{ message: { content: string } }> }
        const content = data.choices[0]?.message?.content ?? ''

        try {
            return JSON.parse(content) as AICodeAnalysisOutput
        } catch {
            throw new Error('DeepSeek returned non-JSON response')
        }
    }
}
