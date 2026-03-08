import mongoose, { Schema, Document } from 'mongoose'

export interface ISnapshot extends Document {
    roomId: string
    content: string
    language: string
    timestamp: Date
}

const SnapshotSchema = new Schema<ISnapshot>({
    roomId: { type: String, required: true, index: true },
    content: { type: String, required: true },
    language: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true })

export default mongoose.model<ISnapshot>('Snapshot', SnapshotSchema)
