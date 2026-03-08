import InterviewRoom from '../models/InterviewRoom.js'
import { nanoid } from 'nanoid'

export const roomService = {
    async createRoom(data: any) {
        const roomId = nanoid(10)
        const room = await InterviewRoom.create({
            ...data,
            roomId,
            status: 'active'
        })
        return room
    },

    async getRoom(roomId: string) {
        return await InterviewRoom.findOne({ roomId }).populate('hostId participantId problemId')
    },

    async closeRoom(roomId: string) {
        return await InterviewRoom.findOneAndUpdate(
            { roomId },
            { status: 'completed', endedAt: new Date() },
            { new: true }
        )
    }
}
