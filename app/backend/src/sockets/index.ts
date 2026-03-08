import { Server, Socket } from 'socket.io'
import { Server as HttpServer } from 'node:http'
import { WebSocketServer } from 'ws'
import { setupWSConnection } from 'y-websocket/bin/utils'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { registerRoomHandlers } from './roomHandlers.js'
import { registerEditorHandlers } from './editorEvents.js'
import { registerChatHandlers } from './chatEvents.js'
import { registerMediaHandlers } from './mediaEvents.js'

interface TokenPayload {
    userId: string
}

export const initSocket = (httpServer: HttpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: env.CLIENT_URL,
            methods: ['GET', 'POST'],
            credentials: true
        },
        transports: ['websocket', 'polling']
    })

    // Auth middleware
    io.use((socket, next) => {
        const token = (socket.handshake.auth as { token?: string }).token
        if (!token) return next(new Error('No token'))
        try {
            const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload
            (socket as any).userId = payload.userId
            next()
        } catch {
            next(new Error('Invalid token'))
        }
    })

    io.on('connection', (socket: Socket) => {
        const userId = (socket as any).userId
        console.log(`[Socket] Connected: ${socket.id} (User: ${userId})`)

        registerRoomHandlers(io, socket)
        registerEditorHandlers(io, socket)
        registerChatHandlers(io, socket)
        registerMediaHandlers(io, socket)

        socket.on('disconnect', () => {
            console.log(`[Socket] Disconnected: ${socket.id}`)
        })
    })

    // Yjs WebSocket Server (Monaco direct sync)
    const wss = new WebSocketServer({ noServer: true })
    wss.on('connection', (ws, req) => {
        setupWSConnection(ws, req)
    })

    httpServer.on('upgrade', (req, socket, head) => {
        if (req.url?.startsWith('/yjs')) {
            wss.handleUpgrade(req, socket, head, (ws) => {
                wss.emit('connection', ws, req)
            })
        }
    })

    console.log('[socket] Socket.IO & Yjs initialization complete')
    return io
}
