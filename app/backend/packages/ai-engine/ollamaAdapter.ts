import type { AICodeAnalysisInput, AICodeAnalysisOutput } from '../shared-types/types'

/**
 * OllamaAdapter
 *
 * Local Ollama adapter for offline / self-hosted AI analysis.
 * Default model: deepseek-coder:6.7b.
 *
 * Requires Ollama running: `ollama serve && ollama pull deepseek-coder:6.7b`
 */
export class OllamaAdapter {
    constructor(
        private baseUrl = 'http://localhost:11434',
        private model = 'deepseek-coder:6.7b'
    ) {}

    private buildPrompt(input: AICodeAnalysisInput): string {
        return `[INST] You are a code reviewer. Analyze this ${input.language} code${input.problemDescription ? ` for the problem: "${input.problemDescription}"` : ''} and respond ONLY with valid JSON:

\`\`\`${input.language}
${input.code}
\`\`\`

JSON schema:
{
  "timeComplexity": string,
  "spaceComplexity": string,
  "correctness": "correct"|"partially correct"|"incorrect",
  "bugs": string[],
  "suggestions": string[],
  "testCases": string[],
  "codeStyle": string,
  "overallScore": number,
  "summary": string
}
[/INST]`
    }

    async analyzeCode(input: AICodeAnalysisInput): Promise<AICodeAnalysisOutput> {
        const response = await fetch(`${this.baseUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: this.model,
                prompt: this.buildPrompt(input),
                stream: false,
                options: { temperature: 0.1, num_predict: 1024 },
            }),
        })

        if (!response.ok) {
            throw new Error(`Ollama error: ${response.status} — is Ollama running?`)
        }

        const data = await response.json() as { response: string }
        const raw = data.response ?? ''

        const match = raw.match(/\{[\s\S]*\}/)
        if (!match) throw new Error('Ollama did not return a JSON object')

        try {
            return JSON.parse(match[0]) as AICodeAnalysisOutput
        } catch {
            throw new Error(`Ollama JSON parse failed: ${raw.slice(0, 120)}`)
        }
    }

    /** Check if Ollama is reachable */
    async isAvailable(): Promise<boolean> {
        try {
            const r = await fetch(`${this.baseUrl}/api/tags`, { signal: AbortSignal.timeout(2000) })
            return r.ok
        } catch {
            return false
        }
    }
}
