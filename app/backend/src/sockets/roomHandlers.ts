import { Server, Socket } from 'socket.io'

const rooms = new Map<string, Set<string>>()

export const registerRoomHandlers = (io: Server, socket: Socket) => {
    const userId = (socket as any).userId

    socket.on('join-room', (roomId: string) => {
        socket.join(roomId)
        if (!rooms.has(roomId)) rooms.set(roomId, new Set())
        rooms.get(roomId)!.add(socket.id)

        socket.to(roomId).emit('user-joined', { userId, socketId: socket.id })
        socket.emit('room-info', { participants: rooms.get(roomId)!.size })
    })

    socket.on('disconnecting', () => {
        socket.rooms.forEach(roomId => {
            const members = rooms.get(roomId)
            if (members) {
                members.delete(socket.id)
                socket.to(roomId).emit('user-left', { userId, socketId: socket.id })
                if (members.size === 0) rooms.delete(roomId)
            }
        })
    })
}
