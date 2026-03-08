import 'dotenv/config'
import express from 'express'
import { createServer } from 'node:http'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import { configurePassport } from './config/passport.js'
import cron from 'node-cron'
import { connectDB } from './config/db.js'
import { env } from './config/env.js'
import { requestLogger } from './middleware/logger.js'
import { apiRateLimiter } from './middleware/rateLimiter.js'
import { errorHandler } from './middleware/errorHandler.js'
import { initSocket } from './sockets/index.js'

// Import routes
import { authRouter } from './routes/auth.js'
import { sessionRouter as roomRouter } from './routes/rooms.js'
import { problemsRouter } from './routes/problems.js'
import { usersRouter } from './routes/users.js'
import { reportsRouter as analysisRouter } from './routes/analysis.js'
import { codeRouter as executionRouter } from './routes/execution.js'
import adminRouter from './routes/admin.js'
import InterviewRoom from './models/InterviewRoom.js'

const app = express()
const httpServer = createServer(app)

// Connect to Database
connectDB()

// Middleware
app.use(helmet())
app.use(cookieParser())
app.use(passport.initialize())
configurePassport()
app.use(cors({ origin: env.CLIENT_URL, credentials: true }))
app.use(morgan('dev'))
app.use(requestLogger)
app.use(apiRateLimiter)
app.use(express.json({ limit: '1mb' }))

// Routes
app.get('/api/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }))
app.use('/api/auth', authRouter)
app.use('/api/rooms', roomRouter)
app.use('/api/sessions', roomRouter)      // alias — frontend calls /api/sessions/*
app.use('/api/problems', problemsRouter)
app.use('/api/users', usersRouter)
app.use('/api/analysis', analysisRouter)
app.use('/api/reports', analysisRouter)   // alias — frontend calls /api/reports/:roomId
app.use('/api/execution', executionRouter)
app.use('/api/admin', adminRouter)

// Socket.IO
initSocket(httpServer)

// Error Handler
app.use(errorHandler)

// Cron Jobs for Maintenance
cron.schedule('0 * * * *', async () => {
    console.log('[cron] Cleaning up stale active rooms...')
    try {
        const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000)
        const result = await InterviewRoom.updateMany(
            { status: 'ACTIVE', lastActivityAt: { $lt: fourHoursAgo } },
            { $set: { status: 'COMPLETED', endedAt: new Date() } }
        )
        if (result.modifiedCount > 0) {
            console.log(`[cron] Successfully closed ${result.modifiedCount} abandoned rooms.`)
        }
    } catch (err) {
        console.error('[cron] Error during maintenance:', err)
    }
})

// Start Server
httpServer.listen(env.PORT, () => {
    console.log(`[server] Standor Backend running on http://localhost:${env.PORT}`)
})

export { app }
