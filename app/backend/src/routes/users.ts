import { Router } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import InterviewRoom from '../models/InterviewRoom.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

export const usersRouter = Router()
usersRouter.use(requireAuth)

// PATCH /api/users/me
usersRouter.patch('/me', async (req, res) => {
    const authReq = req as AuthRequest
    const schema = z.object({
        name: z.string().min(2).max(80).optional(),
        avatar: z.string().url().max(500).optional(),
    })

    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() })
        return
    }

    const { name, avatar } = parsed.data
    if (!name && !avatar) {
        res.status(400).json({ error: 'Provide at least one field to update' })
        return
    }

    try {
        const user = await User.findByIdAndUpdate(
            authReq.userId,
            { ...(name ? { name } : {}), ...(avatar ? { avatar } : {}) },
            { new: true }
        )

        if (!user) {
            res.status(404).json({ error: 'User not found' })
            return
        }

        res.json({
            _id: user._id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            role: user.role
        })
    } catch {
        res.status(500).json({ error: 'Failed to update profile' })
    }
})

// POST /api/users/me/password
usersRouter.post('/me/password', async (req, res) => {
    const authReq = req as AuthRequest
    const schema = z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8).max(128),
    })

    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() })
        return
    }

    const { currentPassword, newPassword } = parsed.data

    try {
        const user = await User.findById(authReq.userId)
        if (!user) {
            res.status(404).json({ error: 'User not found' })
            return
        }

        if (!user.password) {
            res.status(400).json({ error: 'This account uses Google login' })
            return
        }

        const valid = await bcrypt.compare(currentPassword, user.password)
        if (!valid) {
            res.status(400).json({ error: 'Current password is incorrect' })
            return
        }

        const hashed = await bcrypt.hash(newPassword, 12)
        user.password = hashed
        await user.save()

        res.json({ ok: true })
    } catch {
        res.status(500).json({ error: 'Failed to change password' })
    }
})

// GET /api/users/stats
usersRouter.get('/stats', async (req, res) => {
    const authReq = req as AuthRequest
    try {
        const sessions = await InterviewRoom.find({
            $or: [{ hostId: authReq.userId }, { participantId: authReq.userId }]
        })

        const completed = sessions.filter((s) => s.status === 'COMPLETED')
        const analyzed = sessions.filter((s) => s.analyses && s.analyses.length > 0)

        const scores = analyzed
            .map((s) => s.analyses[s.analyses.length - 1]?.overallScore ?? 0)
            .filter((n) => n > 0)

        const avgScore = scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10
            : 0

        const durations = completed
            .filter((s) => !!s.endedAt)
            .map((s) => Math.round((s.endedAt!.getTime() - s.startedAt.getTime()) / 60_000))

        const avgDuration = durations.length > 0
            ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
            : 0

        const distribution = {
            poor: scores.filter((s) => s <= 3).length,
            fair: scores.filter((s) => s >= 4 && s <= 6).length,
            good: scores.filter((s) => s >= 7 && s <= 8).length,
            great: scores.filter((s) => s >= 9).length,
        }

        const byDifficulty = {
            easy: sessions.filter((s) => s.difficulty === 'EASY').length,
            medium: sessions.filter((s) => s.difficulty === 'MEDIUM').length,
            hard: sessions.filter((s) => s.difficulty === 'HARD').length,
        }

        const recent = sessions
            .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
            .slice(0, 12)
            .map((s) => ({
                roomId: s.roomId,
                problem: s.problem,
                difficulty: s.difficulty,
                status: s.status,
                score: s.analyses[s.analyses.length - 1]?.overallScore ?? null,
                startedAt: s.startedAt,
                endedAt: s.endedAt,
            }))

        res.json({
            total: sessions.length,
            completed: completed.length,
            analyzed: analyzed.length,
            avgScore,
            avgDuration,
            distribution,
            byDifficulty,
            recent,
        })
    } catch (e) {
        console.error('[users/stats]', e)
        res.status(500).json({ error: 'Failed to fetch stats' })
    }
})
