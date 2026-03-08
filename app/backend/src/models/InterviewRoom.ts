import mongoose, { Schema, Document } from 'mongoose'
import { nanoid } from 'nanoid'

interface CodeSnapshot {
    content: string
    language: string
    timestamp: Date
    cursorLine?: number
    cursorColumn?: number
}

interface AIAnalysis {
    timeComplexity: string
    spaceComplexity: string
    correctness: string
    bugs: string[]
    suggestions: string[]
    testCases: string[]
    codeStyle: string
    overallScore: number
    summary: string
    analyzedAt: Date
}

export interface IInterviewRoom extends Document {
    roomId: string
    problem: string
    problemId?: mongoose.Types.ObjectId
    difficulty: 'EASY' | 'MEDIUM' | 'HARD'
    language: string
    status: 'ACTIVE' | 'COMPLETED'
    hostId: mongoose.Types.ObjectId
    participantId?: mongoose.Types.ObjectId
    organizationId?: mongoose.Types.ObjectId
    messages: {
        sender: string
        senderId: string
        text: string
        timestamp: Date
        pinned?: boolean
    }[]
    transcript: {
        speaker: string
        text: string
        timestamp: Date
    }[]
    codeSnapshots: CodeSnapshot[]
    analyses: AIAnalysis[]
    startedAt: Date
    endedAt?: Date
    lastActivityAt?: Date
}

const CodeSnapshotSchema = new Schema<CodeSnapshot>({
    content: { type: String, required: true },
    language: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    cursorLine: Number,
    cursorColumn: Number,
}, { _id: false })

const AIAnalysisSchema = new Schema<AIAnalysis>({
    timeComplexity: { type: String, default: '' },
    spaceComplexity: { type: String, default: '' },
    correctness: { type: String, default: '' },
    bugs: [String],
    suggestions: [String],
    testCases: [String],
    codeStyle: { type: String, default: '' },
    overallScore: { type: Number, default: 0 },
    summary: { type: String, default: '' },
    analyzedAt: { type: Date, default: Date.now },
}, { _id: false })

const InterviewRoomSchema = new Schema<IInterviewRoom>({
    roomId: { type: String, unique: true, default: () => nanoid(10) },
    problem: { type: String, required: true },
    problemId: { type: Schema.Types.ObjectId, ref: 'Problem' },
    difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], default: 'MEDIUM' },
    language: { type: String, default: 'javascript' },
    status: { type: String, enum: ['ACTIVE', 'COMPLETED'], default: 'ACTIVE' },
    hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    participantId: { type: Schema.Types.ObjectId, ref: 'User' },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    messages: [{
        sender: String,
        senderId: String,
        text: String,
        timestamp: { type: Date, default: Date.now },
        pinned: { type: Boolean, default: false },
    }],
    codeSnapshots: [CodeSnapshotSchema],
    analyses: [AIAnalysisSchema],
    startedAt: { type: Date, default: Date.now },
    endedAt: Date,
    lastActivityAt: Date,
}, { timestamps: true })

InterviewRoomSchema.index({ hostId: 1, startedAt: -1 })
InterviewRoomSchema.index({ participantId: 1, startedAt: -1 })
InterviewRoomSchema.index({ status: 1 })

export default mongoose.model<IInterviewRoom>('InterviewRoom', InterviewRoomSchema)
