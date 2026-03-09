import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { verifyGoogleToken, getGoogleAuthUrl, verifyGoogleCode } from "../lib/googleAuth.js";
import { ENV } from "../lib/env.js";
import { upsertStreamUser } from "../lib/stream.js";

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

        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (!user) {
            user = await User.create({
                googleId,
                email,
                name,
                profileImage: profileImage || "",
            });

            await upsertStreamUser({
                id: user._id.toString(),
                name: user.name,
                image: user.profileImage,
            });
        } else if (!user.googleId) {
            user.googleId = googleId;
            if (!user.profileImage) user.profileImage = profileImage;
            await user.save();
        }

        const token = jwt.sign({ userId: user._id }, ENV.JWT_SECRET, {
            expiresIn: "7d",
        });

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

            await upsertStreamUser({
                id: user._id.toString(),
                name: user.name,
                image: user.profileImage,
            });
        } else if (!user.googleId) {
            user.googleId = googleId;
            if (!user.profileImage) user.profileImage = profileImage;
            await user.save();
        }

        const token = jwt.sign({ userId: user._id }, ENV.JWT_SECRET, {
            expiresIn: "7d",
        });

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
