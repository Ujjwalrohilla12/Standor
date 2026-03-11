import type { ExecutionResult } from '../types';

export interface CodeExecutor {
  readonly language: string;
  isReady(): Promise<boolean>;
  initialize(): Promise<void>;
  execute(code: string, timeout?: number): Promise<ExecutionResult>;
}

export const DEFAULT_TIMEOUT = 5000;

export function createTimeoutPromise(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Execution timed out')), ms);
  });
}
