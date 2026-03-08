import { Router } from 'express'
import { z } from 'zod'
import InterviewRoom from '../models/InterviewRoom.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { AIService } from '../services/aiService.js'
import { EmailService } from '../services/emailService.js'

export const sessionRouter = Router()
sessionRouter.use(requireAuth)

// POST /api/rooms  (also mounted at /api/sessions)
sessionRouter.post('/', async (req, res) => {
    const authReq = req as AuthRequest
    const schema = z.object({
        problem: z.string().min(2).max(200),
        difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
        language: z.string().min(1).max(50).optional(),
    })

    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() })
        return
    }

    try {
        const room = await InterviewRoom.create({
            problem: parsed.data.problem,
            difficulty: parsed.data.difficulty,
            language: parsed.data.language ?? 'javascript',
            hostId: authReq.userId!,
        })
        res.status(201).json(room)
    } catch (e) {
        console.error('[rooms/create]', e)
        res.status(500).json({ error: 'Failed to create session' })
    }
})

// GET /api/rooms/my-sessions
sessionRouter.get('/my-sessions', async (req, res) => {
    const authReq = req as AuthRequest
    try {
        const rooms = await InterviewRoom.find({
            $or: [{ hostId: authReq.userId }, { participantId: authReq.userId }],
        })
            .sort({ startedAt: -1 })
            .limit(50)
        res.json(rooms)
    } catch {
        res.status(500).json({ error: 'Failed to fetch sessions' })
    }
})

// GET /api/rooms/:roomId
sessionRouter.get('/:roomId', async (req, res) => {
    try {
        const room = await InterviewRoom.findOne({ roomId: req.params.roomId })
        if (!room) {
            res.status(404).json({ error: 'Session not found' })
            return
        }
        res.json(room)
    } catch {
        res.status(500).json({ error: 'Failed to fetch session' })
    }
})

// POST /api/rooms/:roomId/join
sessionRouter.post('/:roomId/join', async (req, res) => {
    const authReq = req as AuthRequest
    try {
        const room = await InterviewRoom.findOne({ roomId: req.params.roomId })
        if (!room) {
            res.status(404).json({ error: 'Session not found' })
            return
        }
        if (room.status !== 'ACTIVE') {
            res.status(400).json({ error: 'Session is not active' })
            return
        }
        if (!room.participantId && room.hostId.toString() !== authReq.userId) {
            room.participantId = authReq.userId as any
            await room.save()
        }
        res.json({ joined: true })
    } catch {
        res.status(500).json({ error: 'Failed to join session' })
    }
})

// POST /api/rooms/:roomId/snapshot
sessionRouter.post('/:roomId/snapshot', async (req, res) => {
    const schema = z.object({
        content: z.string().max(100_000),
        language: z.string().min(1).max(50),
    })

    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
        res.status(400).json({ error: 'Invalid snapshot data' })
        return
    }

    try {
        const room = await InterviewRoom.findOne({ roomId: req.params.roomId })
        if (!room) {
            res.status(404).json({ error: 'Session not found' })
            return
        }

        room.codeSnapshots.push({
            content: parsed.data.content,
            language: parsed.data.language,
            timestamp: new Date(),
        })
        if (room.codeSnapshots.length > 20) {
            room.codeSnapshots.splice(0, room.codeSnapshots.length - 20)
        }

        await room.save()
        res.json({ saved: true })
    } catch {
        res.status(500).json({ error: 'Failed to save snapshot' })
    }
})

// POST /api/rooms/:roomId/analyze
sessionRouter.post('/:roomId/analyze', async (req, res) => {
    const schema = z.object({
        code: z.string().min(1).max(50_000),
        language: z.string().min(1).max(50),
    })

    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
        res.status(400).json({ error: 'Invalid request' })
        return
    }

    try {
        const room = await InterviewRoom.findOne({ roomId: req.params.roomId })
        if (!room) {
            res.status(404).json({ error: 'Session not found' })
            return
        }

        const result = await AIService.analyzeCode(parsed.data.code, parsed.data.language)

        const aiAnalysis = {
            timeComplexity: result.timeComplexity,
            spaceComplexity: result.spaceComplexity,
            correctness: result.correctness,
            bugs: result.bugs,
            suggestions: result.suggestions,
            testCases: result.testCases,
            codeStyle: result.codeStyle,
            overallScore: result.overallScore,
            summary: result.summary,
            analyzedAt: new Date(),
        }

        room.analyses.push(aiAnalysis as any)
        await room.save()

        res.json({ aiAnalysis })
    } catch (e) {
        console.error('[rooms/analyze]', e)
        res.status(500).json({ error: 'AI analysis failed' })
    }
})

// POST /api/rooms/:roomId/end
sessionRouter.post('/:roomId/end', async (req, res) => {
    const authReq = req as AuthRequest
    try {
        const room = await InterviewRoom.findOne({ roomId: req.params.roomId })
            .populate('hostId')
            .populate('participantId')

        if (!room) {
            res.status(404).json({ error: 'Session not found' })
            return
        }
        if ((room.hostId as any)._id.toString() !== authReq.userId) {
            res.status(403).json({ error: 'Only the host can end the session' })
            return
        }

        room.status = 'COMPLETED'
        room.endedAt = new Date()
        await room.save()

        // Send email report asynchronously
        const host = room.hostId as any
        const participant = room.participantId as any
        if (host?.email) {
            void EmailService.sendEmail(
                host.email,
                `Interview Report — ${room.problem}`,
                `<p>Your interview session for <strong>${room.problem}</strong> has ended.</p>` +
                `<p>Overall score: ${room.analyses[room.analyses.length - 1]?.overallScore ?? 'N/A'}/10</p>`,
            ).catch((e) => console.error('[email]', e))
        }
        if (participant?.email) {
            void EmailService.sendEmail(
                participant.email,
                `Interview Report — ${room.problem}`,
                `<p>Your interview session for <strong>${room.problem}</strong> has ended.</p>` +
                `<p>Overall score: ${room.analyses[room.analyses.length - 1]?.overallScore ?? 'N/A'}/10</p>`,
            ).catch((e) => console.error('[email]', e))
        }

        res.json(room)
    } catch {
        res.status(500).json({ error: 'Failed to end session' })
    }
})
