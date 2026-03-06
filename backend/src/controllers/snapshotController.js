import Session from "../models/Session.js";

export async function saveSnapshot(req, res) {
  try {
    const { id } = req.params;
    const { content, language } = req.body;

    if (!content || !language) {
      return res.status(400).json({ message: "content and language are required" });
    }

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });
    if (session.status !== "active") {
      return res.status(400).json({ message: "Cannot snapshot a completed session" });
    }

    const snapshot = { content, language, timestamp: new Date() };

    // keep only latest 20 snapshots to limit storage
    const updatedSession = await Session.findByIdAndUpdate(
      id,
      {
        $push: {
          codeSnapshots: {
            $each: [snapshot],
            $slice: -20,
          },
        },
      },
      { new: true }
    );

    const saved = updatedSession.codeSnapshots[updatedSession.codeSnapshots.length - 1];
    res.status(201).json({ snapshot: saved });
  } catch (error) {
    console.error("Error in saveSnapshot controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getSnapshots(req, res) {
  try {
    const { id } = req.params;
    const session = await Session.findById(id).select("codeSnapshots");
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.status(200).json({ snapshots: session.codeSnapshots });
  } catch (error) {
    console.error("Error in getSnapshots controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
