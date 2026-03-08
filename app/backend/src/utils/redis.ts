import { Redis } from 'ioredis'
import { env } from '../config/env.js'

export const redis = new Redis(env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
})

redis.on('error', (err) => console.error('[Redis] Error:', err))
redis.on('connect', () => console.log('[Redis] Connected'))
