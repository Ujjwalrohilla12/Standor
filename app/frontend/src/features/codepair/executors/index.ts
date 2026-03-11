import type { ExecutionResult } from '../types';
import type { CodeExecutor } from './base';
import { JavaScriptExecutor } from './javascript';
import { PythonExecutor } from './python';

const executors: Map<string, CodeExecutor> = new Map();

export function getExecutor(language: string): CodeExecutor | null {
  if (executors.has(language)) {
    return executors.get(language)!;
  }

  let executor: CodeExecutor | null = null;

  switch (language) {
    case 'python':
      executor = new PythonExecutor();
      break;
    case 'javascript':
      executor = new JavaScriptExecutor();
      break;
    default:
      return null;
  }

  executors.set(language, executor);
  return executor;
}

export function isExecutable(language: string): boolean {
  return language === 'python' || language === 'javascript';
}

export async function executeCode(
  language: string,
  code: string,
  timeout?: number
): Promise<ExecutionResult> {
  const executor = getExecutor(language);

  if (!executor) {
    return {
      stdout: '',
      stderr: `Execution not supported for ${language}. Only Python and JavaScript are supported.`,
      success: false,
      error: 'Unsupported language',
    };
  }

  if (!(await executor.isReady())) {
    await executor.initialize();
  }

  return executor.execute(code, timeout);
}

export type { CodeExecutor } from './base';
export { JavaScriptExecutor } from './javascript';
export { PythonExecutor } from './python';
