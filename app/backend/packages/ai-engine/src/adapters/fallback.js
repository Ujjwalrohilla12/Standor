export class FallbackAdapter {
    async analyze(code, _language) {
        const lineCount = code.split('\n').length;
        const hasLoop = /for|while/.test(code);
        const hasNested = /for[\s\S]*for|while[\s\S]*while/.test(code);
        return {
            summary: 'AI analysis is not configured. Add OPENROUTER_API_KEY to enable full code analysis.',
            complexity: {
                time: hasNested ? 'O(n²) — estimated' : hasLoop ? 'O(n) — estimated' : 'O(1) — estimated',
                space: 'O(n) — estimated',
            },
            bugs: lineCount < 3 ? ['Code is very short — ensure all edge cases are handled'] : [],
            suggestions: [
                'Configure OPENROUTER_API_KEY for detailed AI-powered suggestions',
                'Add input validation and error handling',
                'Consider edge cases: empty input, null values, large inputs',
            ],
            style: 5,
            tests: ['Test with empty input', 'Test with single element', 'Test with large dataset'],
            overallScore: 5,
        };
    }
}
