import axios from 'axios'
import { env } from '../config/env.js'

export const executionService = {
    async execute(language: string, source: string) {
        const RUNNER_URL = process.env.RUNNER_URL || 'http://localhost:4001'
        try {
            const response = await axios.post(`${RUNNER_URL}/execute`, {
                language,
                source
            })
            return response.data
        } catch (err) {
            console.error('[ExecutionService] Runner error:', err)
            throw new Error('Code execution engine unreachable')
        }
    }
}
