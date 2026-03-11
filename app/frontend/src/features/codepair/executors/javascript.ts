import type { ExecutionResult } from '../types';
import type { CodeExecutor } from './base';
import { DEFAULT_TIMEOUT, createTimeoutPromise } from './base';

export class JavaScriptExecutor implements CodeExecutor {
  readonly language = 'javascript';
  private ready = true;

  async isReady(): Promise<boolean> {
    return this.ready;
  }

  async initialize(): Promise<void> {}

  async execute(
    code: string,
    timeout: number = DEFAULT_TIMEOUT
  ): Promise<ExecutionResult> {
    const startTime = performance.now();
    const logs: string[] = [];
    const errors: string[] = [];

    const sandboxConsole = {
      log: (...args: unknown[]) => logs.push(args.map(String).join(' ')),
      error: (...args: unknown[]) => errors.push(args.map(String).join(' ')),
      warn: (...args: unknown[]) => logs.push(`[warn] ${args.map(String).join(' ')}`),
      info: (...args: unknown[]) => logs.push(`[info] ${args.map(String).join(' ')}`),
    };

    try {
      const sandboxedCode = `
        'use strict';
        ${code}
      `;

      const executePromise = new Promise<void>((resolve, reject) => {
        try {
          const fn = new Function('console', sandboxedCode);
          fn(sandboxConsole);
          resolve();
        } catch (err) {
          reject(err);
        }
      });

      await Promise.race([executePromise, createTimeoutPromise(timeout)]);

      const executionTime = performance.now() - startTime;

      return {
        stdout: logs.join('\n'),
        stderr: errors.join('\n'),
        success: true,
        executionTime,
      };
    } catch (err) {
      const executionTime = performance.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : String(err);

      return {
        stdout: logs.join('\n'),
        stderr: errors.join('\n') + '\n' + errorMessage,
        success: false,
        executionTime,
        error: errorMessage,
      };
    }
  }
}
