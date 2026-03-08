import { Server, Socket } from 'socket.io'
import InterviewRoom from '../models/InterviewRoom.js'

export const registerChatHandlers = (io: Server, socket: Socket) => {
    const userId = (socket as any).userId

    socket.on('chat-message', async (data: { roomId: string; sender: string; text: string; ts: number }) => {
        const sanitized = data.text.replace(/</g, '&lt;').replace(/>/g, '&gt;').slice(0, 500)
        io.to(data.roomId).emit('chat-message', { sender: data.sender, text: sanitized, ts: data.ts })

        try {
            await InterviewRoom.findOneAndUpdate(
                { roomId: data.roomId },
                {
                    $push: {
                        messages: {
                            sender: data.sender,
                            senderId: userId,
                            text: sanitized,
                            timestamp: new Date(data.ts)
                        }
                    }
                }
            )
        } catch (e) {
            console.error('[Socket/Chat]', e)
        }
    })
}
