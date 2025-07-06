import React, { useEffect, useState } from "react";
import Board from "./components/Board";
import RepositoriesList from "./components/RepositoriesList";

const App: React.FC = () => {
  const [repositories, setRepositories] = useState<any[]>([]);
  const [selectedRepository, setSelectedRepository] = useState<any | null>(null);
  const [issues, setIssues] = useState<any[]>([{}]);
  const [authToken, setAuthToken] = useState<string>("");

  const handleLogin = async () => {
    const token = await window.electronAPI.make_login();
    // const repos = await window.electronAPI.getUserRepositories(token.token);
    // setRepositories(repos);
    // setAuthToken(token);
  };

  const handleRepositoryClick = async (repo: any) => {
    setSelectedRepository(repo);
    const user = await window.electronAPI.getAuthenticatedUser(authToken);
    const repository_data = await window.electronAPI.getRepositoryData(authToken, user, selectedRepository);
    setIssues(repository_data["issues"]);
  };

  useEffect(() => {
    handleLogin();
  });
  
  return (
    <div className="min-h-screen">
      {!authToken ? (
        <Board user_issues={issues}/>
      ) : (
        <div>
          {!selectedRepository && (
            <RepositoriesList user_repositories={repositories} onRepositoryClick={handleRepositoryClick} />
          )}

          {selectedRepository && <Board user_issues={issues}/>}
        </div>
      )}
    </div>
  );
};

export default App;
