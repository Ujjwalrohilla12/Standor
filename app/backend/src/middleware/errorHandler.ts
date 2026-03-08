import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger.js'

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(`[Error] ${req.method} ${req.url}`, {
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    })

    const status = err.status || 500
    res.status(status).json({
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    })
}
