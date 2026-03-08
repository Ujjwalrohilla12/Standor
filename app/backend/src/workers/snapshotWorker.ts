import { Queue, Worker, Job } from 'bullmq'
import { redis } from '../utils/redis.js'
import InterviewRoom from '../models/InterviewRoom.js'
import Snapshot from '../models/Snapshot.js'

export const snapshotQueue = new Queue('snapshot-queue', { connection: redis as any })

export const snapshotWorker = new Worker(
    'snapshot-queue',
    async (job: Job) => {
        const { roomId, content, language } = job.data
        console.log(`[Worker] Processing snapshot for room: ${roomId}`)

        try {
            await Snapshot.create({
                roomId,
                content,
                language,
                timestamp: new Date()
            })

            await InterviewRoom.findOneAndUpdate(
                { roomId },
                { lastActivityAt: new Date() }
            )
        } catch (err) {
            console.error('[Worker] Snapshot error:', err)
            throw err
        }
    },
    { connection: redis as any }
)
