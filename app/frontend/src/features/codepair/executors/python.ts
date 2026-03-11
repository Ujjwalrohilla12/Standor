import type { ExecutionResult } from '../types';
import type { CodeExecutor } from './base';
import { DEFAULT_TIMEOUT, createTimeoutPromise } from './base';

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<PyodideInterface>;
  }
}

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
  runPython: (code: string) => unknown;
  setStdout: (config: { batched: (text: string) => void }) => void;
  setStderr: (config: { batched: (text: string) => void }) => void;
}

const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/';

export class PythonExecutor implements CodeExecutor {
  readonly language = 'python';
  private pyodide: PyodideInterface | null = null;
  private loadPromise: Promise<void> | null = null;

  async isReady(): Promise<boolean> {
    return this.pyodide !== null;
  }

  async initialize(): Promise<void> {
    if (this.pyodide) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = this.loadPyodide();

    try {
      await this.loadPromise;
    } finally {
      // loadPromise is reset on success via pyodide assignment
    }
  }

  private async loadPyodide(): Promise<void> {
    // Temporarily hide AMD loader (Monaco) to prevent conflicts
    // @ts-expect-error - AMD loader workaround for Monaco/Pyodide conflict
    const _define = window.define;
    // @ts-expect-error - AMD loader workaround for Monaco/Pyodide conflict
    const _require = window.require;
    // @ts-expect-error - AMD loader workaround for Monaco/Pyodide conflict
    window.define = undefined;
    // @ts-expect-error - AMD loader workaround for Monaco/Pyodide conflict
    window.require = undefined;

    try {
      if (!window.loadPyodide) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = `${PYODIDE_CDN}pyodide.js`;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Pyodide'));
          document.head.appendChild(script);
        });
      }

      this.pyodide = await window.loadPyodide!({
        indexURL: PYODIDE_CDN,
      });
    } finally {
      // @ts-expect-error - AMD loader workaround for Monaco/Pyodide conflict
      window.define = _define;
      // @ts-expect-error - AMD loader workaround for Monaco/Pyodide conflict
      window.require = _require;
    }
  }

  async execute(
    code: string,
    timeout: number = DEFAULT_TIMEOUT
  ): Promise<ExecutionResult> {
    if (!this.pyodide) {
      await this.initialize();
    }

    if (!this.pyodide) {
      return {
        stdout: '',
        stderr: 'Failed to initialize Python runtime',
        success: false,
        error: 'Pyodide not loaded',
      };
    }

    const startTime = performance.now();
    const stdout: string[] = [];
    const stderr: string[] = [];

    this.pyodide.setStdout({
      batched: (text: string) => stdout.push(text + '\n'),
    });
    this.pyodide.setStderr({
      batched: (text: string) => stderr.push(text + '\n'),
    });

    try {
      const executePromise = this.pyodide.runPythonAsync(code);
      await Promise.race([executePromise, createTimeoutPromise(timeout)]);

      const executionTime = performance.now() - startTime;

      return {
        stdout: stdout.join(''),
        stderr: stderr.join(''),
        success: true,
        executionTime,
      };
    } catch (err) {
      const executionTime = performance.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : String(err);

      return {
        stdout: stdout.join(''),
        stderr: stderr.join('') + '\n' + errorMessage,
        success: false,
        executionTime,
        error: errorMessage,
      };
    }
  }
}
