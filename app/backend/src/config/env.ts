import { z } from 'zod'

const envSchema = z.object({
    PORT: z.string().default('5000'),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    MONGO_URI: z.string().url(),
    JWT_SECRET: z.string().min(32).default('super-secret-standor-key-change-in-prod'),
    JWT_EXPIRES_IN: z.string().default('15m'),
    REFRESH_TOKEN_SECRET: z.string().min(32).default('refresh-secret-standor-key-change-in-prod'),
    REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
    CLIENT_URL: z.string().url().default('http://localhost:5173'),
    REDIS_URL: z.string().optional().default('redis://localhost:6379'),
    // Accept both spellings for the Piston executor URL
    PISTON_URL: z.string().url().optional().default('https://emkc.org/api/v2/piston'),
    PISTON_API_URL: z.string().url().optional(),
    // AI providers (OpenRouter covers DeepSeek + AI Models)
    DEEPSEEK_API_KEY: z.string().optional(),
    OPENROUTER_API_KEY: z.string().optional(),
    // SMTP (degrades gracefully when not configured)
    SMTP_HOST: z.string().optional().default('smtp.mailtrap.io'),
    SMTP_PORT: z.string().optional().default('587'),
    SMTP_USER: z.string().optional().default(''),
    SMTP_PASS: z.string().optional().default(''),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
})

const _parsed = envSchema.parse(process.env)

// PISTON_API_URL falls back to PISTON_URL so both env spellings work
export const env = {
    ..._parsed,
    PISTON_API_URL: _parsed.PISTON_API_URL ?? _parsed.PISTON_URL!,
}
