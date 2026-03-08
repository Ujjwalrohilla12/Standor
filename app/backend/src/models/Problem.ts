import mongoose, { Schema, Document } from 'mongoose'

export interface IProblem extends Document {
    title: string
    description: string
    difficulty: 'EASY' | 'MEDIUM' | 'HARD'
    tags: string[]
    category: string
    constraints: string[]
    examples: { input: string; output: string }[]
    testCases: { input: string; expected: string; hidden: boolean }[]
    starterCode: { language: string; code: string }[]
    isCustom: boolean
    createdBy?: mongoose.Types.ObjectId
    createdAt: Date
}

const ProblemSchema: Schema = new Schema({
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], default: 'MEDIUM' },
    tags: [{ type: String }],
    category: { type: String, default: 'Algorithms' },
    constraints: [{ type: String }],
    examples: [{
        input: { type: String, required: true },
        output: { type: String, required: true }
    }],
    testCases: [{
        input: { type: String, required: true },
        expected: { type: String, required: true },
        hidden: { type: Boolean, default: false }
    }],
    starterCode: [{
        language: { type: String, required: true },
        code: { type: String, required: true }
    }],
    isCustom: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
})

export default mongoose.model<IProblem>('Problem', ProblemSchema)
