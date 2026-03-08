import { Queue, Worker, Job } from 'bullmq'
import { redis } from '../utils/redis.js'
import { EmailService } from '../services/emailService.js'

export const emailQueue = new Queue('email-queue', { connection: redis as any })

export const emailWorker = new Worker(
    'email-queue',
    async (job: Job) => {
        const { to, subject, body } = job.data
        console.log(`[Worker] Sending email to: ${to}`)

        try {
            await EmailService.sendEmail(to, subject, body)
        } catch (err) {
            console.error('[Worker] Email error:', err)
            throw err
        }
    },
    { connection: redis as any }
)
