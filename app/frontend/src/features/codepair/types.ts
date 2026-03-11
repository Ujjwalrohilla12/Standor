/**
 * Shared TypeScript interfaces for CodePair.
 * Ported from coding-interview-platform.
 */

export interface Participant {
  id: string;
  name: string;
  color: string;
  cursorPosition?: CursorPosition;
}

export interface CursorPosition {
  line: number;
  column: number;
}

export interface CodePairSession {
  id: string;
  code: string;
  language: string;
  participantCount: number;
  shareUrl: string;
}

export type MessageType =
  | 'code_update'
  | 'cursor_position'
  | 'user_joined'
  | 'user_left'
  | 'language_change'
  | 'name_change'
  | 'sync_request'
  | 'sync_response';

export interface WebSocketMessage {
  type: MessageType;
  payload: Record<string, unknown>;
  senderId?: string;
  timestamp: string;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  success: boolean;
  executionTime?: number;
  error?: string;
}

export const SUPPORTED_LANGUAGES = [
  { id: 'python', name: 'Python', extension: '.py' },
  { id: 'javascript', name: 'JavaScript', extension: '.js' },
  { id: 'typescript', name: 'TypeScript', extension: '.ts' },
  { id: 'java', name: 'Java', extension: '.java' },
  { id: 'cpp', name: 'C++', extension: '.cpp' },
  { id: 'go', name: 'Go', extension: '.go' },
  { id: 'rust', name: 'Rust', extension: '.rs' },
] as const;

export const EXECUTABLE_LANGUAGES = ['python', 'javascript', 'typescript', 'java', 'cpp', 'go', 'rust'] as const;
