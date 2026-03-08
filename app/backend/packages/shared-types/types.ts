// ─── Core user & auth ──────────────────────────────────────────────────────

export interface User {
    _id: string
    name: string
    email: string
    avatar?: string
    role?: 'recruiter' | 'candidate' | 'interviewer' | 'admin'
    createdAt?: string
}

// ─── Problems ──────────────────────────────────────────────────────────────

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'

export interface TestCase {
    input: string
    expectedOutput: string
    hidden?: boolean
}

export interface StarterCode {
    language: string
    code: string
}

export interface ProblemExample {
    input: string
    output: string
    explanation?: string
}

export interface Problem {
    _id?: string
    title: string
    slug?: string
    description: string
    difficulty: Difficulty
    category: string
    tags: string[]
    constraints: string[]
    examples: ProblemExample[]
    testCases?: TestCase[]
    starterCode?: StarterCode[]
    languageSupport?: string[]
}

// ─── Interview Room ────────────────────────────────────────────────────────

export type RoomStatus = 'ACTIVE' | 'COMPLETED'

export interface CodeSnapshot {
    content: string
    language: string
    timestamp: string
    cursorLine?: number
    cursorColumn?: number
}

export interface ChatMessage {
    sender: string
    senderId?: string
    text: string
    timestamp: string
    pinned?: boolean
}

export interface AIAnalysis {
    timeComplexity: string
    spaceComplexity: string
    correctness: string
    bugs: string[]
    suggestions: string[]
    testCases?: string[]
    codeStyle?: string
    overallScore: number
    summary: string
    analyzedAt: string
}

export interface InterviewRoom {
    _id: string
    roomId: string
    hostId: string
    participantId?: string
    problem: string
    difficulty: Difficulty
    status: RoomStatus
    language: string
    startedAt: string
    endedAt?: string
    aiAnalysis?: AIAnalysis
    codeSnapshots?: CodeSnapshot[]
    messages?: ChatMessage[]
}

// ─── Code execution ────────────────────────────────────────────────────────

export interface RunResult {
    stdout: string
    stderr: string
    exitCode: number
    wall_time?: number
    memory?: number
    signal?: string
}

export interface TestRunResult {
    passed: number
    total: number
    results: Array<{
        index: number
        passed: boolean
        hidden: boolean
        input?: string
        expected?: string
        actual?: string
        stderr?: string
        error?: string
    }>
}

// ─── Analytics ─────────────────────────────────────────────────────────────

export interface UserStats {
    total: number
    completed: number
    analyzed: number
    avgScore: number | null
    avgDuration: number | null
    distribution: {
        poor: number
        fair: number
        good: number
        great: number
    }
    byDifficulty: {
        easy: number
        medium: number
        hard: number
    }
    recent: Array<{
        roomId: string
        problem: string
        difficulty: string
        status: RoomStatus
        score: number | null
        startedAt: string
    }>
}

// ─── Session report ────────────────────────────────────────────────────────

export interface SessionReport {
    roomId: string
    problem: string
    difficulty: Difficulty
    status: RoomStatus
    startedAt: string
    endedAt?: string
    duration?: number
    host: { name: string; email: string; avatar?: string }
    participant?: { name: string; email: string; avatar?: string }
    aiAnalysis?: AIAnalysis
    codeSnapshots: CodeSnapshot[]
    chatLog: ChatMessage[]
}

// ─── Socket events ─────────────────────────────────────────────────────────

export interface SocketEvents {
    // Room
    'join-room': (roomId: string) => void
    'room-info': (data: { participants: number }) => void
    'user-joined': (data: { userId: string; socketId: string }) => void
    'user-left': (data: { userId: string; socketId: string }) => void
    // Editor
    'code-change': (data: { roomId: string; code: string; language: string }) => void
    'code-update': (data: { code: string; language: string }) => void
    'code-snapshot': (data: { roomId: string; code: string; language: string; cursorLine?: number; cursorColumn?: number }) => void
    // Chat
    'chat-message': (data: { roomId: string; sender: string; text: string; ts: number }) => void
    // Cursor
    'cursor-move': (data: { roomId: string; line: number; column: number }) => void
    'cursor-update': (data: { userId: string; line: number; column: number }) => void
}

// ─── AI output ─────────────────────────────────────────────────────────────

export interface AICodeAnalysisInput {
    code: string
    language: string
    problemDescription?: string
    roomId?: string
}

export interface AICodeAnalysisOutput {
    timeComplexity: string
    spaceComplexity: string
    correctness: 'correct' | 'partially correct' | 'incorrect'
    bugs: string[]
    suggestions: string[]
    testCases: string[]
    codeStyle: string
    overallScore: number
    summary: string
}
