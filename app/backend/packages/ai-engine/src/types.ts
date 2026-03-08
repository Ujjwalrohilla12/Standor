export interface AnalysisResult {
    summary: string
    complexity: {
        time: string
        space: string
    }
    bugs: string[]
    suggestions: string[]
    style: number       // 1–10
    tests: string[]     // suggested test case descriptions
    overallScore: number // 1–10
}

export interface AIAdapter {
    analyze(code: string, language: string): Promise<AnalysisResult>
}

export interface AdapterConfig {
    provider: 'openrouter' | 'ollama' | 'fallback'
    apiKey?: string
    model?: string
    baseUrl?: string
}
