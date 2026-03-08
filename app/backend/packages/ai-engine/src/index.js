import { OpenRouterAdapter } from './adapters/openrouter.js';
import { FallbackAdapter } from './adapters/fallback.js';
export function createAdapter(config) {
    switch (config.provider) {
        case 'openrouter':
            if (!config.apiKey)
                throw new Error('OPENROUTER_API_KEY is required');
            return new OpenRouterAdapter(config.apiKey, config.model ?? 'deepseek/deepseek-coder');
        case 'fallback':
        default:
            return new FallbackAdapter();
    }
}
