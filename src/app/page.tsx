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
  const [inputPrompt, setInputPrompt] = useState<string>("");
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let websocket: WebSocket;
    let reconnectAttempts = 0;

    const connect = () => {
      websocket = new WebSocket("ws://localhost:8010");
      setWs(websocket);

      websocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log("Received message:", message);

        switch (message.type) {
          case "output":
            setOutput((prevOutput) => prevOutput + message.data + "\n");
            break;
            
          case "inputRequired":
            // New message type from backend that indicates input is needed
            setIsWaitingForInput(true);
            setInputPrompt(message.prompt);
            // Focus the input field when it appears
            setTimeout(() => {
              if (inputRef.current) {
                inputRef.current.focus();
              }
            }, 0);
            break;
            
          case "status":
            if (message.status === "finished") {
              setIsRunning(false);
              setIsWaitingForInput(false);
            }
            break;
            
          case "error":
            setError(message.error);
            setIsRunning(false);
            setIsWaitingForInput(false);
            setOutput((prevOutput) => prevOutput + `Error: ${message.error}\n`);
            break;
            
          default:
            console.log("Unknown message type:", message.type);
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
      
      websocket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("WebSocket connection error. Please try again.");
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

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setLanguage(event.target.value);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setError(null);
    setOutput("");
    setIsWaitingForInput(false);

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "execute", code, language }));
    } else {
      setError("WebSocket not connected. Please refresh the page.");
      setIsRunning(false);
    }
  };

  const handleInputSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (inputRef.current && ws && isWaitingForInput) {
      const inputValue = inputRef.current.value;
      // Send the input to the server
      ws.send(JSON.stringify({ type: "input", data: inputValue }));
      
      // Add the input to the output display for the user to see
      setOutput((prevOutput) => prevOutput + `${inputValue}\n`);
      
      // Clear the input field
      inputRef.current.value = "";
      
      // Reset waiting state (backend will send another inputRequired if needed)
      setIsWaitingForInput(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      // The form's onSubmit handler will take care of this
      event.preventDefault();
    }
  };

  const handleDebug = () => {
    alert(`Debug button clicked!\nCode:\n${code}`);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left Sidebar */}
      <div
        style={{
          width: "200px",
          backgroundColor: "#2d2d2d",
          padding: "20px",
          color: "#ffffff",
        }}
      >
        <ul style={{ listStyle: "none", padding: 0 }}>
          {[
            "IDE",
            "My projects",
            "Course",
            "Game",
            "Quiz",
            "Materials",
            "Login/Signup",
          ].map((item) => (
            <li key={item} style={{ margin: "10px 0" }}>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "#ffffff",
                  cursor: "pointer",
                }}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px",
            backgroundColor: "#1e1e1e",
          }}
        >
          <div>
            <button
              onClick={handleRun}
              disabled={isRunning}
              style={{
                padding: "8px 16px",
                marginRight: "10px",
                backgroundColor: "#ffffff",
                color: "#000000",
                border: "none",
                borderRadius: "4px",
                cursor: isRunning ? "not-allowed" : "pointer",
                opacity: isRunning ? 0.7 : 1,
              }}
            >
              {isRunning ? "Running..." : "Run"}
            </button>
            <button
              onClick={handleDebug}
              style={{
                padding: "8px 16px",
                marginRight: "10px",
                backgroundColor: "#ffffff",
                color: "#000000",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Debug
            </button>
            <button
              style={{
                padding: "8px 16px",
                marginRight: "10px",
                backgroundColor: "#ffffff",
                color: "#000000",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Share
            </button>
          </div>

          {/* Language Dropdown */}
          <select
            value={language}
            onChange={handleLanguageChange}
            style={{
              padding: "5px",
              backgroundColor: "#333",
              color: "#ffffff",
              border: "none",
              borderRadius: "4px",
            }}
          >
            {programmingLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        {/* Monaco Editor */}
        <CodeEditor
          code={code}
          onChange={handleCodeChange}
          language={language}
        />

        {/* Output Section */}
        <div style={{ margin: "20px" }}>
          <h2>Output</h2>
          <div
            ref={outputRef}
            style={{
              backgroundColor: "#2d2d2d",
              padding: "10px",
              color: error ? "#ff6b6b" : "#ffffff",
              minHeight: "150px",
              maxHeight: "200px",
              overflow: "auto",
              borderRadius: "4px",
              fontFamily: "monospace",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            <pre>{output}</pre>
          </div>
          
          {/* Input Section - Only shown when waiting for input */}
          {isWaitingForInput && (
            <form 
              onSubmit={handleInputSubmit}
              style={{ 
                marginTop: "10px", 
                display: "flex",
                alignItems: "center" 
              }}
            >
              <label
                style={{
                  color: "#ffffff",
                  marginRight: "10px",
                  fontFamily: "monospace"
                }}
              >
                Input:
              </label>
              <input
                ref={inputRef}
                type="text"
                onKeyDown={handleKeyDown}
                autoFocus
                style={{
                  backgroundColor: "#3d3d3d",
                  border: "1px solid #555",
                  color: "#ffffff",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  flex: 1,
                  fontFamily: "monospace"
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "8px 16px",
                  marginLeft: "10px",
                  backgroundColor: "#4CAF50",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Submit
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}