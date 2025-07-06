import React, { useEffect, useState } from "react";
import Board from "./components/Board";
import RepositoriesList from "./components/RepositoriesList";

const App: React.FC = () => {
  const [github_user_info, set_github_user_info] = useState<any>({});
  const [repositories, set_repositories] = useState<any[]>([]);
  const [selected_repository, set_selected_repository] = useState<any | null>(null);
  const [issues, set_issues] = useState<any[]>([]);

  const handleLogin = async () => {
    const token = await window.electronAPI.make_login();
  
    const user = await window.electronAPI.getAuthenticatedUser(token);
    set_github_user_info({
      token,
      user
    });

    const repos = await window.electronAPI.getUserRepositories(token);
    set_repositories(repos);
  };

  const handleRepositoryClick = async (repo: any) => {
    set_selected_repository(repo);

    const repository_data = await window.electronAPI.getRepositoryData(github_user_info.token, github_user_info.user, selected_repository);
    set_issues(repository_data["issues"]);
  };

  useEffect(() => {
    handleLogin();
  });
  
  return (
    <div className="min-h-screen">
      {!github_user_info ? (
        <div></div>
      ) : (
        <div>
          {!selected_repository && (
            <RepositoriesList user_repositories={repositories} onRepositoryClick={handleRepositoryClick} />
          )}

          {selected_repository && <Board user_issues={issues}/>}
        </div>
      )}
    </div>
  );
};

export default App;
