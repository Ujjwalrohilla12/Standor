// @ts-ignore
import { authenticator } from 'otplib'
import qrcode from 'qrcode'
import { env } from '../config/env.js'

export class MFAService {
    /**
     * Generates a new TOTP secret for a user.
     */
    static generateSecret(email: string) {
        return authenticator.generateSecret()
    }

    /**
     * Generates an OTPAuth URL for QR code generation.
     */
    static getOtpAuthUrl(email: string, secret: string) {
        return authenticator.keyuri(email, 'Standor', secret)
    }

    /**
     * Generates a Data URL (base64) for a QR code.
     */
    static async generateQRCode(otpAuthUrl: string): Promise<string> {
        return qrcode.toDataURL(otpAuthUrl)
    }

    /**
     * Verifies a TOTP token against a secret.
     */
    static verifyToken(token: string, secret: string): boolean {
        return authenticator.verify({ token, secret })
    }

    /**
     * Generates a set of backup codes.
     */
    static generateBackupCodes(count: number = 10): string[] {
        const codes: string[] = []
        for (let i = 0; i < count; i++) {
            codes.push(Math.random().toString(36).substring(2, 10).toUpperCase())
        }
        return codes
    }
}
