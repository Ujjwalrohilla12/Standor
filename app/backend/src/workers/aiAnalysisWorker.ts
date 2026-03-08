import { Queue, Worker, Job } from 'bullmq'
import { redis } from '../utils/redis.js'
import { AIService } from '../services/aiService.js'
import InterviewRoom from '../models/InterviewRoom.js'

export const aiAnalysisQueue = new Queue('ai-analysis-queue', { connection: redis as any })

export const aiAnalysisWorker = new Worker(
    'ai-analysis-queue',
    async (job: Job) => {
        const { roomId, code, language } = job.data
        console.log(`[Worker] Running AI Analysis for room: ${roomId}`)

        try {
            const analysis = await AIService.analyzeCode(code, language)

            await InterviewRoom.findOneAndUpdate(
                { roomId },
                {
                    $push: {
                        analyses: {
                            ...analysis,
                            analyzedAt: new Date()
                        }
                    }
                }
            )
        } catch (err) {
            console.error('[Worker] AI Analysis error:', err)
            throw err
        }
    },
    { connection: redis as any }
)
