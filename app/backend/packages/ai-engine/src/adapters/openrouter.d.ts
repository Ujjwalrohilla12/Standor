import type { AIAdapter, AnalysisResult } from '../types.js';
export declare class OpenRouterAdapter implements AIAdapter {
    private readonly apiKey;
    private readonly model;
    constructor(apiKey: string, model: string);
    analyze(code: string, language: string): Promise<AnalysisResult>;
}
