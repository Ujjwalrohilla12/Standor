// Shared types for Standor platform

export interface User {
    _id: string
    name: string
    email: string
    avatar?: string
    role: 'USER' | 'ADMIN'
}

export interface AIAnalysis {
    timeComplexity: string
    spaceComplexity: string
    correctness: number
    bugs: string[]
    suggestions: string[]
    codeStyle: number
    overallScore: number
    summary: string
    tests: string[]
    analyzedAt: string
}

export interface CodeSnapshot {
    content: string
    language: string
    cursorLine?: number
    cursorColumn?: number
    timestamp: string
}

export interface SessionEvent {
    type: string
    userId: string
    timestamp: string
    details?: string
}

export interface InterviewRoom {
    _id: string
    roomId: string
    title?: string
    problem: string
    difficulty: 'EASY' | 'MEDIUM' | 'HARD'
    language: string
    status: 'ACTIVE' | 'COMPLETED'
    host: User | string
    participant?: User | string | null
    codeSnapshots: CodeSnapshot[]
    events?: SessionEvent[]
    aiAnalysis?: AIAnalysis | null
    startedAt: string
    endedAt?: string | null
}

export interface Message {
    sender: string
    text: string
    ts: number
}

export interface TestRunResult {
    passed: number
    total: number
    results: {
        index: number
        passed: boolean
        hidden: boolean
        input: string | null
        expected: string | null
        actual: string
        stderr: string | null
    }[]
}

export interface SessionReport {
    roomId: string
    problem: string
    difficulty: 'EASY' | 'MEDIUM' | 'HARD'
    language: string
    status: 'ACTIVE' | 'COMPLETED'
    startedAt: string
    endedAt?: string | null
    duration?: number | null
    host: { id: string; name: string; email: string; avatar?: string | null }
    participant?: { id: string; name: string; email: string; avatar?: string | null } | null
    aiAnalysis?: AIAnalysis | null
    codeSnapshots: CodeSnapshot[]
    events?: SessionEvent[]
    chatMessages: { sender: string; text: string; ts: string }[]
    snapshotCount: number
}

export interface Problem {
    title: string
    description: string
    difficulty: 'EASY' | 'MEDIUM' | 'HARD'
    category: string
    tags: string[]
    constraints: string[]
    examples: { input: string; output: string }[]
    testCases?: { input: string; expected: string; hidden: boolean }[]
    starterCode?: { language: string; code: string }[]
    testCaseCount?: number
}

export interface UserStats {
    total: number
    completed: number
    analyzed: number
    avgScore: number
    avgDuration: number
    distribution: { poor: number; fair: number; good: number; great: number }
    byDifficulty: { easy: number; medium: number; hard: number }
    recent: {
        roomId: string
        problem: string
        difficulty: string
        status: string
        score: number | null
        startedAt: string
        endedAt: string | null
    }[]
}
