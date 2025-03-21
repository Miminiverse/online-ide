"use client";
import React, { useEffect, useState, useRef } from "react";
import CodeEditor from "../app/components/Editor";
import programmingLanguages from "@/constants/programmingLanguage";

export default function Home() {
  const [code, setCode] = useState<string>("// Write your code here");
  const [language, setLanguage] = useState<string>("python");
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isWaitingForInput, setIsWaitingForInput] = useState<boolean>(false);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let websocket: WebSocket;
    let reconnectAttempts = 0;

    const connect = () => {
      websocket = new WebSocket('ws://localhost:8010');
      setWs(websocket);

      websocket.onmessage = (event) => {
        const { type, data, error } = JSON.parse(event.data);

        if (type === 'output') {
          console.log('data',data);
          
          setOutput((prevOutput) => prevOutput + data);
          if (data.includes("Enter input:")) { // Example: Detect when the program is waiting for input
            setIsWaitingForInput(true);
          }
        } else if (type === 'exit') {
          setIsRunning(false);
          setIsWaitingForInput(false);
        } else if (type === 'error') {
          setError(error);
          setIsRunning(false);
          setIsWaitingForInput(false);
        }
      };

      websocket.onclose = () => {
        console.log("WebSocket connection closed. Reconnecting...");
        setTimeout(() => {
          if (reconnectAttempts < 5) {
            reconnectAttempts++;
            connect();
          }
        }, 3000); // Reconnect after 3 seconds
      };
    };

    connect();

    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, []);

  useEffect(() => {
    // Scroll to the bottom of the output whenever it updates
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleCodeChange = (value: string | undefined) => {
    if (value) {
      setCode(value);
    }
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setError(null);
    setOutput("");

    if (ws) {
      ws.send(JSON.stringify({ type: "execute", code, language }));
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && isWaitingForInput && ws) {
      const input = event.currentTarget.value;
      ws.send(JSON.stringify({ type: "input", data: input }));
      setOutput((prevOutput) => prevOutput + `\n${input}`); // Append the input to the output
      event.currentTarget.value = ""; // Clear the input field
      setIsWaitingForInput(false); // Reset the input waiting state
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

        {/* Combined Input/Output Section */}
        <div style={{ margin: "20px" }}>
          <h2>Output</h2>
          <div
            ref={outputRef}
            style={{ backgroundColor: "#2d2d2d", padding: "10px", color: error ? "#ff6b6b" : "#ffffff", maxHeight: "200px", overflow: "auto", borderRadius: "4px" }}
          >
            <pre>{output}</pre>
            {isWaitingForInput && (
              <input
                type="text"
                autoFocus
                onKeyDown={handleKeyDown}
                style={{ backgroundColor: "transparent", border: "none", color: "#ffffff", outline: "none" }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}