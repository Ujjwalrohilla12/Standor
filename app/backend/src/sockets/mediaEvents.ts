import { Server, Socket } from 'socket.io'

export const registerMediaHandlers = (io: Server, socket: Socket) => {
    // Join a specific room for media signaling
    socket.on('media:join', ({ roomId, userId }) => {
        socket.join(`media-${roomId}`)
        socket.to(`media-${roomId}`).emit('media:user-joined', { userId })
        console.log(`[Media] User ${userId} joined room ${roomId} signaling`)
    })

    // Forward WebRTC offer
    socket.on('webrtc:offer', ({ to, offer, from }) => {
        io.to(to).emit('webrtc:offer', { from, offer })
    })

    // Forward WebRTC answer
    socket.on('webrtc:answer', ({ to, answer, from }) => {
        io.to(to).emit('webrtc:answer', { from, answer })
    })

    // Forward ICE candidates
    socket.on('webrtc:ice-candidate', ({ to, candidate, from }) => {
        io.to(to).emit('webrtc:ice-candidate', { from, candidate })
    })

    // Handle media leave
    socket.on('media:leave', ({ roomId, userId }) => {
        socket.leave(`media-${roomId}`)
        socket.to(`media-${roomId}`).emit('media:user-left', { userId })
    })
}
