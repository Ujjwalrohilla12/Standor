import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { env } from '../config/env.js'
import User from '../models/User.js'

export interface TokenPayload {
    userId: string
    role: string
}

export class TokenService {
    /**
     * Generates a short-lived access token (JWT).
     */
    static generateAccessToken(payload: TokenPayload): string {
        return jwt.sign(payload, env.JWT_SECRET, {
            expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']
        })
    }

    /**
     * Generates a long-lived refresh token.
     */
    static generateRefreshToken(): string {
        return crypto.randomBytes(40).toString('hex')
    }

    /**
     * Hashes a refresh token for secure database storage.
     */
    static hashToken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex')
    }

    /**
     * Handles refresh token rotation and reuse detection.
     */
    static async rotateRefreshToken(userId: string, oldToken: string, deviceId: string) {
        const user = await User.findById(userId)
        if (!user) throw new Error('User not found')

        const oldHash = this.hashToken(oldToken)
        const tokenIndex = user.refreshTokens.findIndex(t => t.tokenHash === oldHash)

        if (tokenIndex === -1) {
            // Potential reuse - Revoke ALL tokens for this user for safety
            user.refreshTokens = []
            await user.save()
            throw new Error('Refresh token reuse detected. All sessions revoked.')
        }

        const tokenData = user.refreshTokens[tokenIndex]

        if (tokenData.revokedAt || tokenData.expiresAt < new Date()) {
            user.refreshTokens.splice(tokenIndex, 1)
            await user.save()
            throw new Error('Refresh token expired or revoked')
        }

        // Generate new token
        const newToken = this.generateRefreshToken()
        const newHash = this.hashToken(newToken)

        // Mark old token as replaced
        tokenData.replacedByToken = newHash
        tokenData.revokedAt = new Date()

        // Add new token
        user.refreshTokens.push({
            tokenHash: newHash,
            deviceId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        })

        await user.save()
        return newToken
    }
}
