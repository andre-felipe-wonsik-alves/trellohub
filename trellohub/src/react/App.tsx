import React, { useState, useEffect } from "react";
import Board from "./components/Board";
import RepositoriesList from "./components/RepositoriesList";
import Button from "./components/ui/button";

const App: React.FC = () => {
  const [repositories, setRepositories] = useState<any[]>([]);
  const [selectedRepository, setSelectedRepository] = useState<any | null>(
    null
  );
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = async () => {
    const result = await window.electronAPI.make_login();
    if (result.success) {
      window.electronAPI.saveToken(result.token);
      const token = await window.electronAPI.getToken();
      console.log(token);
      setIsLoggedIn(true);
      const repos = await window.electronAPI.getUserRepositories(
        result.token.access_token
      );
      setRepositories(repos);
    } else {
      console.error("Login failed:", result.error);
    }
  };

  const handleRepositoryClick = (repo: any) => {
    setSelectedRepository(repo);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      {isLoggedIn ? (
        selectedRepository ? (
          <Board />
        ) : (
          <RepositoriesList
            user_repositories={repositories}
            onRepositoryClick={handleRepositoryClick}
          />
        )
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
