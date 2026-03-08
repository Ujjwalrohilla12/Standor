import type { AIAdapter, AnalysisResult } from '../types.js';
export declare class FallbackAdapter implements AIAdapter {
    analyze(code: string, _language: string): Promise<AnalysisResult>;
}
