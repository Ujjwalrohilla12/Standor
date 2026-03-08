import { Router } from 'express'
import { z } from 'zod'
import axios from 'axios'
import { rateLimit } from 'express-rate-limit'
import { requireAuth } from '../middleware/auth.js'
import { env } from '../config/env.js'

export const codeRouter = Router()
codeRouter.use(requireAuth)

// Stricter rate limit for code execution: 20 req / 5 min
const execLimit = rateLimit({ windowMs: 5 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false })

// GET /api/code/languages
codeRouter.get('/languages', async (_req, res) => {
    try {
        const { data } = await axios.get<any[]>(`${env.PISTON_URL}/runtimes`, { timeout: 5000 })
        res.json(data)
    } catch {
        // Fallback list if Piston is unreachable
        res.json([
            { language: 'javascript', version: '18.15.0' },
            { language: 'python', version: '3.12.0' },
            { language: 'java', version: '15.0.2' },
            { language: 'cpp', version: '10.2.0' },
            { language: 'go', version: '1.16.2' },
            { language: 'rust', version: '1.50.0' },
            { language: 'typescript', version: '5.0.3' },
        ])
    }
})

// POST /api/code/execute
codeRouter.post('/execute', execLimit, async (req, res) => {
    const schema = z.object({
        language: z.string().min(1).max(50),
        code: z.string().min(1).max(50_000),
        stdin: z.string().max(4096).optional().default(''),
    })

    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
        res.status(400).json({ error: 'Invalid request' })
        return
    }

    const { language, code, stdin } = parsed.data

    try {
        const { data } = await axios.post(
            `${env.PISTON_URL}/execute`,
            {
                language,
                version: '*',
                files: [{ content: code }],
                stdin,
                run_timeout: 2000,
                compile_timeout: 10_000,
                run_memory_limit: 65536,
            },
            { timeout: 15_000 },
        )
        res.json(data)
    } catch (e) {
        console.error('[code/execute]', e)
        res.status(502).json({ error: 'Code execution failed' })
    }
})
