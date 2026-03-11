import mongoose from "mongoose";
import crypto from "crypto";

const aiAnalysisSchema = new mongoose.Schema(
  {
    timeComplexity: { type: String, default: "" },
    spaceComplexity: { type: String, default: "" },
    correctness: { type: String, default: "" },
    bugs: [String],
    suggestions: [String],
    testCases: [String],
    codeStyle: { type: String, default: "" },
    overallScore: { type: Number, default: 0 },
    summary: { type: String, default: "" },
    analyzedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const codeSnapshotSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    language: { type: String, default: "javascript" },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    sender: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

// Generate a Google Meet-style code like "abc-defg-hij"
function generateMeetCode() {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const pick = (n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${pick(3)}-${pick(4)}-${pick(3)}`;
}

const sessionSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      unique: true,
      default: generateMeetCode,
    },
    callId: {
      type: String,
      unique: true,
      default: generateMeetCode,
    },
    problem: {
      type: String,
      default: "Meeting",
    },
    difficulty: {
      type: String,
      enum: ["EASY", "MEDIUM", "HARD"],
      default: "MEDIUM",
    },
    maxParticipants: {
      type: Number,
      default: 50,
    },
    type: {
      type: String,
      enum: ["INTERVIEW", "MEETING"],
      default: "INTERVIEW",
    },
    language: {
      type: String,
      default: "javascript",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED"],
      default: "ACTIVE",
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    code: {
      type: String,
      default: "",
    },
    messages: [messageSchema],
    analyses: [aiAnalysisSchema],
    codeSnapshots: [codeSnapshotSchema],
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;
