import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { UAParser } from "ua-parser-js";
import { ENV } from "../lib/env.js";
import User from "../models/User.js";
import AuthSession from "../models/AuthSession.js";
import { verifyGoogleToken, getGoogleAuthUrl, verifyGoogleCode } from "../lib/googleAuth.js";
import { logAuditEvent } from "../lib/auditLogger.js";

export const googleAuthRedirect = async (req, res) => {
    const url = getGoogleAuthUrl();
    res.redirect(url);
};

export const googleAuthCallback = async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send("Code not provided");
    }

    try {
        const payload = await verifyGoogleCode(code);

        if (!payload) {
            return res.status(401).send("Invalid Google code");
        }

        const { sub: googleId, email, name, picture: profileImage } = payload;
            //todo : Fix the timeout issue with google auth, currently it is throwing buffering the timeout error, need to fix it
        let user = await User.findOne({ $or: [{ googleId }, { email }] });
        if (!user) {
            user = await User.create({
                googleId,
                email,
                name,
                profileImage: profileImage || "",
            });
        } else if (!user.googleId) {
            user.googleId = googleId;
            if (!user.profileImage) user.profileImage = profileImage;
            await user.save();
        }

        const token = jwt.sign({ userId: user._id }, ENV.JWT_SECRET, {
            expiresIn: "1h",
        });

        // Track active session
        const parser = new UAParser(req.headers['user-agent']);
        const agent = parser.getBrowser().name ? `${parser.getBrowser().name} on ${parser.getOS().name}` : req.headers['user-agent'];
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown IP';
        
        await AuthSession.create({
            userId: user._id,
            userAgent: agent,
            ip: ip,
        });

        await logAuditEvent({ req, userId: user._id, action: "login", metadata: { method: "google_oauth" }});

        res.redirect(`${ENV.CLIENT_URL}/login?token=${token}`);
    } catch (error) {
        console.error("Error in googleAuthCallback controller:", error);
        res.status(500).send("Internal Server Error");
    }
};

export const googleAuth = async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        return res.status(400).json({ message: "ID Token is required" });
    }

    const payload = await verifyGoogleToken(idToken);

    if (!payload) {
        return res.status(401).json({ message: "Invalid Google token" });
    }

    const { sub: googleId, email, name, picture: profileImage } = payload;

    try {
        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (!user) {
            user = await User.create({
                googleId,
                email,
                name,
                profileImage,
            });
        } else if (!user.googleId) {
            user.googleId = googleId;
            if (!user.profileImage) user.profileImage = profileImage;
            await user.save();
        }

        const token = jwt.sign({ userId: user._id }, ENV.JWT_SECRET, {
            expiresIn: "1h",
        });

        // Track active session
        const parser = new UAParser(req.headers['user-agent']);
        const agent = parser.getBrowser().name ? `${parser.getBrowser().name} on ${parser.getOS().name}` : req.headers['user-agent'];
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown IP';
        
        await AuthSession.create({
            userId: user._id,
            userAgent: agent,
            ip: ip,
        });

        await logAuditEvent({ req, userId: user._id, action: "login", metadata: { method: "google_id_token" }});

        res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage,
            },
            accessToken: token,
        });
    } catch (error) {
        console.error("Error in googleAuth controller:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-clerkId");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ user });
    } catch (error) {
        console.error("Error in getMe controller:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (email && email !== user.email) {
            const existing = await User.findOne({ email });
            if (existing) return res.status(400).json({ detail: "Email already in use" });
            user.email = email;
            user.emailVerified = false;
        }
        if (name) user.name = name;
        
        await user.save();
        res.status(200).json({ user });
    } catch (error) {
        console.error("Error in updateProfile:", error);
        res.status(500).json({ detail: "Internal Server Error" });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id).select("+password");
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.password) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) return res.status(400).json({ detail: "Incorrect current password" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        await logAuditEvent({ req, userId: user._id, action: "password_change" });

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Error in changePassword:", error);
        res.status(500).json({ detail: "Internal Server Error" });
    }
};

export const unlinkProvider = async (req, res) => {
    try {
        const { provider } = req.params;
        const user = await User.findById(req.user._id).select("+password");
        
        if (!user.password && provider === 'google') {
            return res.status(400).json({ detail: "Cannot unlink Google account without setting a password first." });
        }

        if (provider === 'google') user.googleId = undefined;
        await user.save();
        res.status(200).json({ message: "Provider unlinked successfully" });
    } catch (error) {
        res.status(500).json({ detail: "Internal Server Error" });
    }
};

export const exportData = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ detail: "Internal Server Error" });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user._id);
        res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        res.status(500).json({ detail: "Internal Server Error" });
    }
};

export const updateGovernance = async (req, res) => {
    try {
        const { storeFullPayload, analyticsConsent } = req.body;
        const user = await User.findById(req.user._id);
        if (storeFullPayload !== undefined) user.dataGovernance.storeFullPayload = storeFullPayload;
        if (analyticsConsent !== undefined) user.dataGovernance.analyticsConsent = analyticsConsent;
        await user.save();
        res.status(200).json({ message: "Governance updated" });
    } catch (error) {
        res.status(500).json({ detail: "Internal Server Error" });
    }
};

export const verifyPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.user._id).select("+password");
        if (!user || !user.password) return res.status(400).json({ detail: "No password set for this account" });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ detail: "Incorrect password" });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ detail: "Server error" });
    }
};

// --- Mock Email Transporter ---
const createTransporter = async () => {
    // In production, use real SMTP like SendGrid, AWS SES, or custom ENV config.
    // Here we use Ethereal for local dev testing.
    let testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    });
};

export const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        // if email passed in body, or default to the user's email if logged in
        const userEmail = email || (req.user && req.user.email);
        
        let user;
        if (req.user) user = await User.findById(req.user._id);
        else user = await User.findOne({ email: userEmail });

        if (!user) return res.status(404).json({ detail: "User not found" });
        if (user.emailVerified) return res.status(400).json({ detail: "Email already verified" });

        const token = crypto.randomBytes(32).toString("hex");
        user.verificationToken = token;
        user.verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
        await user.save();

        const verificationLink = `${ENV.CLIENT_URL}/verify-email?token=${token}&email=${encodeURIComponent(user.email)}`;
        
        const transporter = await createTransporter();
        const info = await transporter.sendMail({
            from: '"Standor Security" <security@standor.com>',
            to: user.email,
            subject: "Verify your email address",
            html: `<p>Please click the link below to verify your email address:</p><a href="${verificationLink}">${verificationLink}</a>`,
        });

        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        res.status(200).json({ message: "Verification email sent", preview: nodemailer.getTestMessageUrl(info) });
    } catch (error) {
        console.error("Error in resendVerification:", error);
        res.status(500).json({ detail: "Server error" });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { token, email } = req.body;
        const user = await User.findOne({ email, verificationToken: token });

        if (!user || !user.verificationTokenExpiresAt) {
            return res.status(400).json({ detail: "Invalid or expired token" });
        }

        if (new Date() > user.verificationTokenExpiresAt) {
            return res.status(400).json({ detail: "Token expired" });
        }

        user.emailVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();

        res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
        console.error("Error in verifyEmail:", error);
        res.status(500).json({ detail: "Server error" });
    }
};

export const getSessions = async (req, res) => {
    try {
        const sessions = await AuthSession.find({ userId: req.user._id }).sort({ createdAt: -1 });
        
        // Identify 'current' session heuristically (e.g., matching User-Agent and IP, or roughly latest if not precise without token tracking)
        const parser = new UAParser(req.headers['user-agent']);
        const currentAgent = parser.getBrowser().name ? `${parser.getBrowser().name} on ${parser.getOS().name}` : req.headers['user-agent'];
        
        const mapped = sessions.map(s => ({
            userAgent: s.userAgent,
            ip: s.ip,
            lastUsed: s.lastUsed,
            createdAt: s.createdAt,
            isCurrent: s.userAgent === currentAgent, // Simplified heuristic
        }));
        
        res.status(200).json(mapped);
    } catch (error) {
        res.status(500).json({ detail: "Server error" });
    }
};

export const revokeSession = async (req, res) => {
    try {
        const { createdAt } = req.params;
        await AuthSession.findOneAndDelete({ userId: req.user._id, createdAt: decodeURIComponent(createdAt) });
        await logAuditEvent({ req, userId: req.user._id, action: "session_revoked" });
        res.status(200).json({ message: "Session revoked" });
    } catch (error) {
        res.status(500).json({ detail: "Server error" });
    }
};

export const logoutEverywhere = async (req, res) => {
    try {
        await AuthSession.deleteMany({ userId: req.user._id });
        res.status(200).json({ message: "All sessions revoked" });
    } catch (error) {
        res.status(500).json({ detail: "Server error" });
    }
};
