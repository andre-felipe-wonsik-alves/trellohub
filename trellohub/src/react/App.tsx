import React, { useState } from "react";
import Board from "./components/Board";
import Button from "./components/ui/button";

const App: React.FC = () => {
  const [github, setGithub] = useState<{ token: string; owner: string; repo: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const result = await window.electronAPI.make_login();
    if (result.success) {
      const token = result.token;

      const user = await window.electronAPI.getAuthenticatedUser(token);
      const owner = user.login;

      const repos = await window.electronAPI.getUserRepositories(token);
      const repo = repos[0]?.name; // Seleciona o primeiro repositório como exemplo
      setGithub({ token, owner, repo });
    } else {
      console.error("Login failed:", result.error);
    }
    setLoading(false);
  };

  if (loading) return <div>Carregando informações do GitHub...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center">
      {github ? (
        <Board github={github} />
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