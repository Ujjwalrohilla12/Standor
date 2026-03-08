import mongoose from 'mongoose'
import { env } from './env.js'

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(env.MONGO_URI)
        console.log(`[db] MongoDB connected: ${conn.connection.host}`)
    } catch (error) {
        console.error(`[db] Error: ${error instanceof Error ? error.message : error}`)
        process.exit(1)
    }
}
