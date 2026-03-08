import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

export class EmailService {
    private static transporter = nodemailer.createTransport({
        host: env.SMTP_HOST || 'smtp.mailtrap.io',
        port: parseInt(env.SMTP_PORT || '587'),
        auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
        },
    })

    static async sendEmail(to: string, subject: string, body: string) {
        if (!env.SMTP_USER || !env.SMTP_PASS) {
            console.log(`[EmailService] SMTP not configured — skipping email to ${to}: ${subject}`)
            return
        }
        await this.transporter.sendMail({
            from: '"Standor Interviews" <no-reply@standor.dev>',
            to,
            subject,
            html: body,
        })
    }

    static async sendVerificationEmail(to: string, token: string) {
        const link = `${env.CLIENT_URL}/verify-email?token=${token}`
        await this.sendEmail(to, 'Verify your Standor account', `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
                <h1 style="color: #000; margin-bottom: 24px;">Verify your email</h1>
                <p>Welcome to Standor. Please click the button below to verify your account and get started.</p>
                <div style="margin: 32px 0;">
                    <a href="${link}" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Account</a>
                </div>
                <p style="font-size: 12px; color: #666; border-top: 1px solid #eee; pt: 20px;">
                    If you didn't create an account, you can safely ignore this email.
                </p>
            </div>
        `)
    }

    static async sendPasswordResetEmail(to: string, token: string) {
        const link = `${env.CLIENT_URL}/reset-password?token=${token}`
        await this.sendEmail(to, 'Reset your Standor password', `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
                <h1 style="color: #000; margin-bottom: 24px;">Reset your password</h1>
                <p>We received a request to reset your password. Click the button below to proceed.</p>
                <div style="margin: 32px 0;">
                    <a href="${link}" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
                </div>
                <p style="font-size: 12px; color: #666; border-top: 1px solid #eee; pt: 20px;">
                    This link will expire in 1 hour. If you didn't request this, please secure your account.
                </p>
            </div>
        `)
    }
}
