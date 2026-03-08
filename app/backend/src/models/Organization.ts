import mongoose, { Schema, Document } from 'mongoose'

export interface IOrganization extends Document {
    name: string
    slug: string
    ownerId: mongoose.Types.ObjectId
    members: mongoose.Types.ObjectId[]
}

const OrganizationSchema = new Schema<IOrganization>({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true })

export default mongoose.model<IOrganization>('Organization', OrganizationSchema)
