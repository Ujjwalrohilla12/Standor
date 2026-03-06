import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";
import { upsertStreamUser } from "../lib/stream.js";

const googleClient = new OAuth2Client(ENV.GOOGLE_CLIENT_ID);

export async function googleAuth(req, res) {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    // Verify Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: ENV.GOOGLE_CLIENT_ID,
    });

    const { sub: googleId, email, name, picture } = ticket.getPayload();

    // Find or create user
    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.create({ googleId, email, name, profileImage: picture });

      // Create Stream user for video/chat
      await upsertStreamUser({
        id: user._id.toString(),
        name: user.name,
        image: user.profileImage,
      });
    }

    // Issue JWT
    const token = jwt.sign({ userId: user._id }, ENV.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Error in googleAuth:", error.message);
    res.status(500).json({ message: "Authentication failed" });
  }
}
