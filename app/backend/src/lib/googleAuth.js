import { OAuth2Client } from "google-auth-library";
import { ENV } from "./env.js";

const client = new OAuth2Client({
    clientId: ENV.GOOGLE_CLIENT_ID,
    clientSecret: ENV.GOOGLE_CLIENT_SECRET,
    redirectUri: ENV.GOOGLE_CALLBACK_URL
});

// We'll use a simpler approach: the frontend should use GIS to get an idToken
// But since the user wants to keep the existing frontend (mostly), I'll implement both.

export const getGoogleAuthUrl = () => {
    const url = client.generateAuthUrl({
        access_type: "offline",
        scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"],
        redirect_uri: ENV.GOOGLE_CALLBACK_URL,
    });
    console.log("Generated Google Auth URL:", url);
    return url;
};

export const verifyGoogleCode = async (code) => {
    const { tokens } = await client.getToken(code);
    const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: ENV.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
};

export const verifyGoogleToken = async (idToken) => {
    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: ENV.GOOGLE_CLIENT_ID,
        });
        return ticket.getPayload();
    } catch (error) {
        console.error("Error verifying Google token:", error);
        return null;
    }
};
