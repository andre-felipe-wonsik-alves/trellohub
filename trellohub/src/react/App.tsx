import React, { useEffect, useState } from "react";
import Board from "./components/Board";

const App: React.FC = () => {
  const [github, setGithub] = useState<{ token: string; owner: string; repo: string } | null>(null);
  const [loadingGithub, setLoadingGithub] = useState(true);

  useEffect(() => {
  const fetchGithubData = async () => {
    try {
      const loginResult = await window.electronAPI.make_login();
      console.log("loginResult:", loginResult);
      if (!loginResult.success) throw new Error(loginResult.error);

      const token = loginResult.token;
      console.log("Token recebido:", token);

      const user = await window.electronAPI.getAuthenticatedUser(token);
      console.log("Usuário:", user);

      const owner = user.login;
      const repos = await window.electronAPI.getUserRepositories(token);
      const repo = repos[0]?.name;
      if (!repo) throw new Error("Nenhum repositório encontrado!");

      setGithub({ token, owner, repo });
    } catch (err) {
      setGithub(null);
      console.error("Erro ao autenticar no GitHub:", err);
    } finally {
      setLoadingGithub(false);
    }
  };
  fetchGithubData();
}, []);

  if (loadingGithub) return <div>Carregando informações do GitHub...</div>;
  if (!github) return <div>Erro ao autenticar no GitHub.</div>;

  return (
    <div className="min-h-screen">
      <Board github={github} />
    </div>
  );
};

export default App;