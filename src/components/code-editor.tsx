"use client";

import CodeMirror from "@uiw/react-codemirror";
import { html as htmlLanguage } from "@codemirror/lang-html";
import { oneDark } from "@codemirror/theme-one-dark";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const EDITOR_EXTENSIONS = [htmlLanguage()];

export function CodeEditor({ value, onChange }: CodeEditorProps) {
  return (
    <CodeMirror
      value={value}
      height="556px"
      theme={oneDark}
      extensions={EDITOR_EXTENSIONS}
      onChange={onChange}
      basicSetup={{
        bracketMatching: true,
        closeBrackets: true,
        foldGutter: true,
        highlightActiveLine: true,
        highlightActiveLineGutter: true,
        lineNumbers: true,
      }}
      aria-label="HTML document editor"
      className="overflow-hidden rounded-b-xl text-[13px] [&_.cm-editor]:bg-transparent [&_.cm-editor]:outline-none [&_.cm-gutters]:border-r [&_.cm-gutters]:border-border [&_.cm-gutters]:bg-card/70 [&_.cm-scroller]:font-mono"
    />
  );
}
