import React, { useState } from "react";
import Board from "./components/Board";
import RepositoriesList from "./components/RepositoriesList";
import Button from "./components/ui/button";
import { console } from "inspector";

const App: React.FC = () => {
  const [github_user_info, set_github_user_info] = useState<any>({});
  const [repositories, set_repositories] = useState<any[]>([]);
  const [selected_repository, set_selected_repository] = useState<any | null>(null);
  const [issues, set_issues] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = async () => {
    const result = await window.electronAPI.make_login();
    if (result.success) {
      setIsLoggedIn(true);
      const token = result.token.access_token;
      const user = await window.electronAPI.getAuthenticatedUser(token);
      set_github_user_info({
        token,
        user
      });

      const repos = await window.electronAPI.getUserRepositories(token);
      set_repositories(repos);
    } else {
      console.error("Login failed:", result.error);
    }
  };

  const handleRepositoryClick = async (repo: any) => {
    set_selected_repository(repo);

    const repository_data = await window.electronAPI.getRepositoryData(github_user_info.token, github_user_info.user, selected_repository);
    set_issues(repository_data.issues);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      {isLoggedIn ? (
          !selected_repository ? ( 
            <RepositoriesList user_repositories={repositories} onRepositoryClick={handleRepositoryClick} />
          ) : (
            <Board github={{token: github_user_info.token, user: github_user_info.user, repo: selected_repository}}/>
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
}

export default App;
