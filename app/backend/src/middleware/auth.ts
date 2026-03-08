import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export interface AuthRequest extends Request {
    userId?: string
    role?: string
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void =>
    requireAuth(req, res, next)

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
    const token = extractToken(req)
    if (!token) {
        res.status(401).json({ error: 'No token provided' })
        return
    }

    try {
        const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string, role: string }
        req.userId = payload.userId
        req.role = payload.role
        next()
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' })
    }
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void {
    const token = extractToken(req)
    if (!token) return next()

    try {
        const payload = jwt.verify(token, env.JWT_SECRET) as { userId: string, role: string }
        req.userId = payload.userId
        req.role = payload.role
    } catch {
        // Silently fail for optional auth
    }
    next()
}

function extractToken(req: Request): string | null {
    const header = req.headers.authorization
    if (header?.startsWith('Bearer ')) {
        return header.slice(7)
    }
    return null
}
