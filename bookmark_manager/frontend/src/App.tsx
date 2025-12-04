import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [apiStatus, setApiStatus] = useState<string>("Checking...");

  useEffect(() => {
    fetch("http://localhost:5000/")
      .then((res) => res.json())
      .then((data) => setApiStatus(data.message))
      .catch(() => setApiStatus("Backend not connected"));
  }, []);

  return (
    <div className="app">
      <h1>📚 Bookmark Manager</h1>
      <p>API Status: {apiStatus}</p>

      <div className="info">
        <h2>Project Structure Ready!</h2>
        <p>Frontend: React + Vite + TypeScript ✅</p>
        <p>Backend: Express + TypeScript ✅</p>
      </div>
    </div>
  );
}

export default App;
