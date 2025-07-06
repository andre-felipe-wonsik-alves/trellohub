import React, { useState } from "react";
import Board from "./components/Board";
import Button from "./components/ui/button";

const App: React.FC = () => {
  const [github, setGithub] = useState<{
    token: string;
    owner: string;
    repo: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      console.log("Iniciando login...");
      const result = await window.electronAPI.make_login();
      console.log("Resultado do make_login:", result);

      if (result.success) {
        const token = result.token;
        console.log("Token recebido:", token);

        const user = await window.electronAPI.getAuthenticatedUser(token);
        console.log("Usuário autenticado:", user);

        const owner = user.login;

        const repos = await window.electronAPI.getUserRepositories(token);
        console.log("Repositórios recebidos:", repos);

        const repo = repos[0]?.name;
        if (!repo) {
          throw new Error("Nenhum repositório encontrado para este usuário.");
        }

        setGithub({ token, owner, repo });
        console.log("Login e dados do GitHub salvos com sucesso!");
      } else {
        console.error("Login failed:", result.error);
        alert("Falha no login: " + result.error);
      }
    } catch (err) {
      console.error("Erro durante o login:", err);
      alert("Erro durante o login: " + err);
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
