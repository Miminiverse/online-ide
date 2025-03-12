"use client";
import React, { useRef } from "react";
import Editor, { Monaco, OnMount } from "@monaco-editor/react";

interface EditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  language?: string; // Optional language prop
}

const CodeEditor: React.FC<EditorProps> = ({ code, onChange, language = "javascript" }) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  return (
    <Editor
      height="90vh"
      language={language} // Dynamically set language
      value={code} // Use `value` instead of `defaultValue` to stay reactive
      onChange={onChange}
      onMount={handleEditorDidMount}
      theme="vs-dark"
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        wordWrap: "on",
      }}
    />
  );
};

export default CodeEditor;
