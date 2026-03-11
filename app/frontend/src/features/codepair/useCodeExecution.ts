import { useCallback, useState } from 'react';
import type { ExecutionResult } from './types';
import { EXECUTABLE_LANGUAGES } from './types';

const API_BASE =
  (import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_URL ||
    'http://localhost:4000') + '/api';

export interface UseCodeExecutionReturn {
  isExecuting: boolean;
  result: ExecutionResult | null;
  isSupported: boolean;
  isLoading: boolean;
  execute: (code: string) => Promise<ExecutionResult>;
  clearResult: () => void;
}

export function useCodeExecution(language: string): UseCodeExecutionReturn {
  const [isExecuting, setIsExecuting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);

  const isSupported = (EXECUTABLE_LANGUAGES as readonly string[]).includes(language);

  const execute = useCallback(
    async (code: string): Promise<ExecutionResult> => {
      if (!isSupported) {
        const unsupportedResult: ExecutionResult = {
          stdout: '',
          stderr: `Execution not supported for ${language}`,
          success: false,
          error: 'Unsupported language',
        };
        setResult(unsupportedResult);
        return unsupportedResult;
      }

      setIsExecuting(true);
      setIsLoading(true);

      try {
        const startTime = performance.now();
        const response = await fetch(`${API_BASE}/execution/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ language, code }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || `Execution failed (${response.status})`);
        }

        const data = await response.json();
        const elapsed = performance.now() - startTime;

        const compileError = data.compile?.stderr;
        const executionResult: ExecutionResult = {
          stdout: data.run?.stdout || '',
          stderr: compileError || data.run?.stderr || '',
          success:
            (data.run?.code === 0 || data.run?.code === undefined) &&
            (!data.compile || data.compile.code === 0),
          executionTime: elapsed,
        };
        setResult(executionResult);
        return executionResult;
      } catch (err) {
        const errorResult: ExecutionResult = {
          stdout: '',
          stderr: err instanceof Error ? err.message : 'Execution failed',
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        };
        setResult(errorResult);
        return errorResult;
      } finally {
        setIsExecuting(false);
        setIsLoading(false);
      }
    },
    [language, isSupported]
  );

  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  return {
    isExecuting,
    result,
    isSupported,
    isLoading,
    execute,
    clearResult,
  };
}
