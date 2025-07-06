import React, { useState } from "react";
import Board from "./components/Board";
import Button from "./components/ui/button";

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = async () => {
    const result = await window.electronAPI.make_login();
    if (result.success) {
      setIsLoggedIn(true);
      console.log(result.token);
    } else {
      console.error("Login failed:", result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      {isLoggedIn ? (
        <Board />
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">TrelloHub</h1>
          <p className="mb-6">Faça login</p>
          <Button onClick={handleLogin}>Login with GitHub</Button>
        </div>
      )}
    </div>
  );
};

export default App;
