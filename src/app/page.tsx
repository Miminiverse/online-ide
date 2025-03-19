"use client";
import React, { useEffect, useState } from "react";
import CodeEditor from "../app/components/Editor";
import programmingLanguages from "@/constants/programmingLanguage";
import endpoints from "@/constants/endpoints";

export default function Home() {
  const [code, setCode] = useState<string>("// Write your code here");
  const [language, setLanguage] = useState<string>("python");
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Code changed:", code);
  }, [code]);

  const handleCodeChange = (value: string | undefined) => {
    if (value) {
      setCode(value);
    }
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value);
  };

  interface ApiResponse {
    output?: string;
    error?: string;
  }

  const handleRun = async () => {
    setIsRunning(true);
    setError(null);

    try {
      const response = await fetch(endpoints.server, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, language }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to execute code");
      }

      setOutput(data.output || "Code executed successfully, but no output was returned.");
    } catch (err) {
      setError((err as Error).message);
      setOutput(`Error: ${(err as Error).message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleDebug = () => {
    alert(`Debug button clicked!\nCode:\n${code}`);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left Sidebar */}
      <div style={{ width: "200px", backgroundColor: "#2d2d2d", padding: "20px", color: "#ffffff" }}>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {["IDE", "My projects", "Course", "Game", "Quiz", "Materials", "Login/Signup"].map((item) => (
            <li key={item} style={{ margin: "10px 0" }}>
              <button style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer" }}>
                {item}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", backgroundColor: "#1e1e1e" }}>
          <div>
            <button
              onClick={handleRun}
              disabled={isRunning}
              style={{ padding: "8px 16px", marginRight: "10px", backgroundColor: "#ffffff", color: "#000000", border: "none", borderRadius: "4px", cursor: isRunning ? "not-allowed" : "pointer", opacity: isRunning ? 0.7 : 1 }}
            >
              {isRunning ? "Running..." : "Run"}
            </button>
            <button
              onClick={handleDebug}
              style={{ padding: "8px 16px", marginRight: "10px", backgroundColor: "#ffffff", color: "#000000", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              Debug
            </button>
            <button
              // onClick={handleDebug}
              style={{ padding: "8px 16px", marginRight: "10px", backgroundColor: "#ffffff", color: "#000000", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              Share
            </button>
          </div>

          {/* Language Dropdown */}
          <select value={language} onChange={handleLanguageChange} style={{ padding: "5px", backgroundColor: "#333", color: "#ffffff", border: "none", borderRadius: "4px" }}>
            {programmingLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        {/* Monaco Editor */}
        <CodeEditor code={code} onChange={handleCodeChange} language={language} />

        {/* Output Section */}
        <div style={{ margin: "20px" }}>
          <h2>Output</h2>
          <pre style={{ backgroundColor: "#2d2d2d", padding: "10px", color: error ? "#ff6b6b" : "#ffffff", maxHeight: "200px", overflow: "auto", borderRadius: "4px" }}>
            {output || "Run your code to see output here"}
          </pre>
        </div>
      </div>
    </div>
  );
}
