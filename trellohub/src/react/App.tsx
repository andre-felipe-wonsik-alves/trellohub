import React, { useEffect, useState } from "react";
import Board from "./components/Board";

const App: React.FC = () => {
  const [result] = useState(0);
  const handleLogin = async () => {
    const oauth_url = await window.electronAPI.getOAuthUrl();
    console.log("OAUTH_URL -> ", oauth_url);
    await window.electronAPI.openOAuthWindow();
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
