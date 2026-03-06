import mongoose from "mongoose";

const codeSnapshotSchema = new mongoose.Schema({
  content: { type: String, required: true },
  language: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const aiAnalysisSchema = new mongoose.Schema({
  timeComplexity: String,
  spaceComplexity: String,
  correctness: String,
  bugs: [String],
  suggestions: [String],
  codeStyle: String,
  overallScore: Number,
  summary: String,
  analyzedAt: { type: Date, default: Date.now },
});

const sessionSchema = new mongoose.Schema(
  {
    problem: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    callId: {
      type: String,
      default: "",
    },
    codeSnapshots: [codeSnapshotSchema],
    aiAnalysis: {
      type: aiAnalysisSchema,
      default: null,
    },
  },
  { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;
