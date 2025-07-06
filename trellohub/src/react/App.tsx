import React, { useState } from "react";
import Board from "./components/Board";
import RepositoriesList from "./components/RepositoriesList";
import Button from "./components/ui/button";

const App: React.FC = () => {
  const [repositories, setRepositories] = useState<any[]>([]);
  const [selectedRepository, setSelectedRepository] = useState<any | null>(null);
  const [auth, setAuth] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = async () => {
    const result = await window.electronAPI.make_login();
    if (result.success) {
      setIsLoggedIn(true);
      console.log(result.token);
       // const repos = await window.electronAPI.getUserRepositories(token.token);
       // setRepositories(repos);
       // setAuth(true);
    } else {
      console.error("Login failed:", result.error);
    }
  };

  return (
    <div className="min-h-screen">
      {!auth ? (
        <div></div>
      ) : (
        <div>

    <div className="min-h-screen flex items-center justify-center">
      {isLoggedIn ? (
         {!selectedRepository && (
            <RepositoriesList user_repositories={repositories} onRepositoryClick={handleRepositoryClick} />
         )}

          {selectedRepository && <Board />}
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
