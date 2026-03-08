import { Server, Socket } from 'socket.io'
import InterviewRoom from '../models/InterviewRoom.js'

export const registerEditorHandlers = (io: Server, socket: Socket) => {
    // Throttled code change for live overlay (non-Yjs path)
    let codeEventCount = 0
    const codeWindow = setInterval(() => { codeEventCount = 0 }, 1000)

    socket.on('code-change', (data: { roomId: string; code: string; language: string }) => {
        if (codeEventCount > 60) return
        codeEventCount++
        socket.to(data.roomId).emit('code-update', { code: data.code, language: data.language })
    })

    // Manual snapshots
    socket.on('code-snapshot', async (data: { roomId: string; code: string; language: string; cursorLine?: number; cursorColumn?: number }) => {
        try {
            await InterviewRoom.findOneAndUpdate(
                { roomId: data.roomId },
                {
                    $push: {
                        codeSnapshots: {
                            content: data.code,
                            language: data.language,
                            cursorLine: data.cursorLine,
                            cursorColumn: data.cursorColumn,
                            timestamp: new Date()
                        }
                    }
                }
            )
        } catch (e) {
            console.error('[Socket/Snapshot]', e)
        }
    })

    socket.on('disconnect', () => {
        clearInterval(codeWindow)
    })
}
