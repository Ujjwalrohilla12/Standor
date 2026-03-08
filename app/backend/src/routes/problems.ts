import { Router } from 'express'
import { z } from 'zod'
import axios from 'axios'
import { DEMO_PROBLEMS } from '../data/problems.js'
import { requireAuth } from '../middleware/auth.js'
import { env } from '../config/env.js'

export const problemsRouter = Router()
problemsRouter.use(requireAuth)

// GET /api/problems?q=&difficulty=&category=&tag=
problemsRouter.get('/', (req, res) => {
    const { q, difficulty, category, tag } = req.query as Record<string, string | undefined>

    let results = [...DEMO_PROBLEMS]

    if (q) {
        const lq = q.toLowerCase()
        results = results.filter(
            (p) =>
                p.title.toLowerCase().includes(lq) ||
                p.description.toLowerCase().includes(lq) ||
                p.tags.some((t) => t.toLowerCase().includes(lq)),
        )
    }

    if (difficulty) {
        results = results.filter((p) => p.difficulty === difficulty.toUpperCase())
    }

    if (category) {
        results = results.filter((p) => p.category.toLowerCase() === category.toLowerCase())
    }

    if (tag) {
        results = results.filter((p) =>
            p.tags.some((t) => t.toLowerCase() === tag.toLowerCase()),
        )
    }

    res.json(
        results.map(({ testCases, starterCode, ...meta }) => ({
            ...meta,
            testCaseCount: testCases.length,
            examples: meta.examples,
        })),
    )
})

// GET /api/problems/categories
problemsRouter.get('/categories', (_req, res) => {
    const cats = [...new Set(DEMO_PROBLEMS.map((p) => p.category))].sort()
    res.json(cats)
})

// GET /api/problems/tags
problemsRouter.get('/tags', (_req, res) => {
    const tags = [...new Set(DEMO_PROBLEMS.flatMap((p) => p.tags))].sort()
    res.json(tags)
})

// GET /api/problems/:slug
problemsRouter.get('/:slug', (req, res) => {
    const slug = decodeURIComponent(req.params.slug ?? '')
    const problem = DEMO_PROBLEMS.find(
        (p) => p.title.toLowerCase() === slug.toLowerCase(),
    )

    if (!problem) {
        res.status(404).json({ error: 'Problem not found' })
        return
    }

    res.json({
        ...problem,
        testCases: problem.testCases.filter((tc) => !tc.hidden),
    })
})

// POST /api/problems/:slug/run — run code via Piston
problemsRouter.post('/:slug/run', async (req, res) => {
    const schema = z.object({
        language: z.string().min(1).max(50),
        code: z.string().min(1).max(50_000),
    })

    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
        res.status(400).json({ error: 'Invalid request' })
        return
    }

    const slug = decodeURIComponent(req.params.slug ?? '')
    const problem = DEMO_PROBLEMS.find((p) => p.title.toLowerCase() === slug.toLowerCase())

    if (!problem) {
        res.status(404).json({ error: 'Problem not found' })
        return
    }

    const { language, code } = parsed.data

    const results = await Promise.all(
        problem.testCases.map(async (tc, i) => {
            try {
                const { data } = await axios.post(
                    `${env.PISTON_API_URL}/execute`,
                    {
                        language,
                        version: '*',
                        files: [{ content: code }],
                        stdin: tc.input,
                        run_timeout: 2000,
                    },
                    { timeout: 15_000 },
                )

                const actual = (String((data as any).run?.stdout ?? '')).trim()
                const expected = tc.expected.trim()
                const passed = actual === expected

                return {
                    index: i + 1,
                    passed,
                    hidden: tc.hidden,
                    input: tc.hidden ? null : tc.input,
                    expected: tc.hidden ? null : tc.expected,
                    actual: tc.hidden ? (passed ? 'Passed' : 'Failed') : actual,
                    stderr: tc.hidden ? null : ((data as any).run?.stderr ?? ''),
                }
            } catch {
                return { index: i + 1, passed: false, hidden: tc.hidden, input: null, expected: null, actual: 'Execution error', stderr: null }
            }
        }),
    )

    const total = results.length
    const passed = results.filter((r) => r.passed).length

    res.json({ passed, total, results })
})
