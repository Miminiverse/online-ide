"use client";
import React, { useRef } from "react";
import Editor, { Monaco, OnMount } from "@monaco-editor/react";
import getMonacoLanguage from "@/utils/getMonacoLanguage";

interface EditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  language?: string; // Optional language prop
}

const CodeEditor: React.FC<EditorProps> = ({ code, onChange, language = "python" }) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const monacoLanguage = getMonacoLanguage(language);

  return (
    <Editor
      height="90vh"
      language={monacoLanguage}
      value={code}
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