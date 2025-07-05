import React, { useEffect, useState } from "react";
import Board from "./components/Board";

const App: React.FC = () => {
  const [connectStatus, setConnectStatus] = useState("Disconnected");

  const [result] = useState(0);
  const handleLogin = async () => {
    const token = await window.electronAPI.make_login();
    console.log(token);
  };

  useEffect(() => {
    handleLogin();
  });

  return (
    <div className="min-h-screen">
      <Board />
    </div>
  );
};

export default App;
