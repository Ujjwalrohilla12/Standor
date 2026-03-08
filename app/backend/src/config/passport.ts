import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { env } from './env.js'
import User from '../models/User.js'

export const configurePassport = () => {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
        console.warn('Google OAuth credentials missing. OAuth disabled.')
        return
    }

    passport.use(new GoogleStrategy({
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${env.CLIENT_URL}/api/auth/google/callback`,
        passReqToCallback: true
    }, async (_req: any, _accessToken: string, _refreshToken: string, profile: any, done: any) => {
        try {
            const email = profile.emails?.[0].value
            if (!email) return done(new Error('No email found in Google profile'))

            let user = await User.findOne({ email })

            if (!user) {
                user = await User.create({
                    email,
                    name: profile.displayName,
                    avatar: profile.photos?.[0]?.value,
                    emailVerified: true,
                    role: 'USER',
                    socialProviders: [{ provider: 'google', subjectId: profile.id, linkedAt: new Date() }]
                })
            } else {
                // Link provider if not already linked and update avatar
                const hasProvider = user.socialProviders?.some(p => p.provider === 'google')
                let updated = false
                if (!hasProvider) {
                    user.socialProviders = user.socialProviders || []
                    user.socialProviders.push({ provider: 'google', subjectId: profile.id, linkedAt: new Date() })
                    updated = true
                }
                if (!user.avatar && profile.photos?.[0]?.value) {
                    user.avatar = profile.photos[0].value
                    updated = true
                }
                if (updated) await user.save()
            }

            return done(null, user)
        } catch (err) {
            return done(err)
        }
    }))
}
