import { useCallback, useRef } from "react";
import Editor from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { cn } from "../../lib/utils";

type EditorInstance = editor.IStandaloneCodeEditor;

export interface CodeEditorProps {
  value: string;
  language: string;
  onChange?: (value: string) => void;
  onCursorChange?: (line: number, column: number) => void;
  readOnly?: boolean;
  className?: string;
}

export function CodeEditor({
  value,
  language,
  onChange,
  onCursorChange,
  readOnly = false,
  className,
}: CodeEditorProps) {
  const editorRef = useRef<EditorInstance | null>(null);

  const handleEditorDidMount = useCallback(
    (editor: EditorInstance) => {
      editorRef.current = editor;

      editor.onDidChangeCursorPosition((e) => {
        onCursorChange?.(e.position.lineNumber, e.position.column);
      });

      editor.focus();
    },
    [onCursorChange],
  );

  const handleChange = useCallback(
    (value: string | undefined) => {
      onChange?.(value ?? "");
    },
    [onChange],
  );

  return (
    <div
      className={cn(
        "h-full w-full overflow-hidden rounded-lg border border-zinc-700",
        className,
      )}
    >
      <Editor
        height="100%"
        language={language}
        value={value}
        theme="vs-dark"
        onChange={handleChange}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'Fira Code', 'Consolas', monospace",
          lineNumbers: "on",
          renderLineHighlight: "all",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: "on",
          padding: { top: 16, bottom: 16 },
          cursorBlinking: "smooth",
          smoothScrolling: true,
          bracketPairColorization: { enabled: true },
        }}
      />
    </div>
  );
}
