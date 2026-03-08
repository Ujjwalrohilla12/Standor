import { Router } from 'express'
import InterviewRoom from '../models/InterviewRoom.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

export const reportsRouter = Router()
reportsRouter.use(requireAuth)

// GET /api/analysis/:roomId  (also mounted at /api/reports/:roomId)
reportsRouter.get('/:roomId', async (req, res) => {
    const authReq = req as AuthRequest
    try {
        const room = await InterviewRoom.findOne({ roomId: req.params.roomId })
            .populate('hostId', 'name email avatar')
            .populate('participantId', 'name email avatar')

        if (!room) {
            res.status(404).json({ error: 'Session not found' })
            return
        }

        // Only host or participant can view report
        const hostId = (room.hostId as any)?._id?.toString() ?? room.hostId?.toString()
        const participantId = (room.participantId as any)?._id?.toString() ?? room.participantId?.toString()

        if (hostId !== authReq.userId && participantId !== authReq.userId) {
            res.status(403).json({ error: 'Access denied' })
            return
        }

        const duration = room.endedAt
            ? Math.round((room.endedAt.getTime() - room.startedAt.getTime()) / 60_000)
            : null

        const host = room.hostId as any
        const participant = room.participantId as any

        res.json({
            roomId: room.roomId,
            problem: room.problem,
            difficulty: room.difficulty,
            language: room.codeSnapshots[0]?.language ?? room.language ?? 'javascript',
            status: room.status,
            startedAt: room.startedAt,
            endedAt: room.endedAt,
            duration,
            host: host
                ? { id: host._id, name: host.name, email: host.email, avatar: host.avatar }
                : null,
            participant: participant
                ? { id: participant._id, name: participant.name, email: participant.email, avatar: participant.avatar }
                : null,
            analyses: room.analyses,
            codeSnapshots: room.codeSnapshots,
            chatLog: room.messages.map((m: any) => ({
                sender: m.sender,
                text: m.text,
                timestamp: m.timestamp,
            })),
        })
    } catch (e) {
        console.error('[analysis/:roomId]', e)
        res.status(500).json({ error: 'Failed to fetch report' })
    }
})
