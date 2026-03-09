import Session from "../models/Session.js";
import jwt from "jsonwebtoken";
import { ENV } from "../lib/env.js";

export const getMeetingByCode = async (req, res) => {
    try {
        const { code } = req.params;
        // Search by callId or code. In this implementation, we use callId as the meeting code.
        const session = await Session.findOne({ callId: code, status: "active" });

        if (!session) {
            return res.status(404).json({ error: "Meeting not found" });
        }

        res.status(200).json(session);
    } catch (error) {
        console.error("Error in getMeetingByCode:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const joinMeeting = async (req, res) => {
    try {
        const { code } = req.params;
        const userId = req.user._id;

        const session = await Session.findOne({ callId: code });

        if (!session) {
            return res.status(404).json({ error: "Meeting not found" });
        }

        // If user is host, they join immediately
        if (session.host.toString() === userId.toString()) {
            return res.status(200).json({ status: "JOINED", session });
        }

        // Otherwise, they go to the waiting room
        res.status(200).json({ status: "WAITING_ROOM", session });
    } catch (error) {
        console.error("Error in joinMeeting:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const guestJoinMeeting = async (req, res) => {
    try {
        const { code } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Name is required" });
        }

        const session = await Session.findOne({ callId: code });

        if (!session) {
            return res.status(404).json({ error: "Meeting not found" });
        }

        // Create a temporary guest user/token
        const guestId = `guest_${Math.random().toString(36).substring(7)}`;
        const token = jwt.sign({ id: guestId, name, role: "guest" }, ENV.JWT_SECRET, { expiresIn: "2h" });

        res.status(200).json({
            status: "WAITING_ROOM",
            user: { id: guestId, name, role: "guest" },
            token,
            session
        });
    } catch (error) {
        console.error("Error in guestJoinMeeting:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
