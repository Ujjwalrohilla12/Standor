declare module 'y-websocket/bin/utils' {
    import { WebSocket } from 'ws'
    import { IncomingMessage } from 'node:http'
    export function setupWSConnection(conn: WebSocket, req: IncomingMessage, options?: any): void
}
