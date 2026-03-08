export interface AnalysisResult {
    summary: string;
    complexity: {
        time: string;
        space: string;
    };
    bugs: string[];
    suggestions: string[];
    style: number;
    tests: string[];
    overallScore: number;
}
export interface AIAdapter {
    analyze(code: string, language: string): Promise<AnalysisResult>;
}
export interface AdapterConfig {
    provider: 'openrouter' | 'ollama' | 'fallback';
    apiKey?: string;
    model?: string;
    baseUrl?: string;
}
