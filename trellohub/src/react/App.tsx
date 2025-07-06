import React, { useEffect, useState } from "react";
import Board from "./components/Board";
import RepositoriesList from "./components/RepositoriesList";

const App: React.FC = () => {
  const [repositories, setRepositories] = useState<any[]>([]);
  const [selectedRepository, setSelectedRepository] = useState<any | null>(null);
  const [auth, setAuth] = useState<boolean>(false);

  const handleLogin = async () => {
    console.log(1)
    const token = await window.electronAPI.make_login();
    console.log(token)
    // const repos = await window.electronAPI.getUserRepositories(token.token);
    // setRepositories(repos);
    // setAuth(true);
  };

  const handleRepositoryClick = (repo: any) => {
    setSelectedRepository(repo);
  };

  useEffect(() => {
    handleLogin();
  });
  
  return (
    <div className="min-h-screen">
      {!auth ? (
        <div></div>
      ) : (
        <div>
          {!selectedRepository && (
            <RepositoriesList user_repositories={repositories} onRepositoryClick={handleRepositoryClick} />
          )}

          {selectedRepository && <Board />}
        </div>
      )}
    </div>
  );
};

export default App;
