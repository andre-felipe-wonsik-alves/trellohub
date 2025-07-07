import React, { useState } from "react";
import Board from "./components/Board";
import RepositoriesList from "./components/RepositoriesList";
import Button from "./components/ui/button";

const App: React.FC = () => {
  const [github_user_info, set_github_user_info] = useState<any>({});
  const [repositories, set_repositories] = useState<any[]>([]);
  const [selected_repository, set_selected_repository] = useState<any | null>(
    null
  );
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = async () => {
    const result = await window.electronAPI.make_login();
    if (result.success) {
      setIsLoggedIn(true);
      const token = result.token.access_token;
      const user = await window.electronAPI.getAuthenticatedUser(token);
      set_github_user_info({
        token,
        user,
      });

      const repos = await window.electronAPI.getUserRepositories(token);
      set_repositories(repos);
    } else {
      console.error("Login failed:", result.error);
    }
  };

  const handleRepositoryClick = async (repo: any) => {
    set_selected_repository(repo);
  };

  const handleGoBackToRepos = () => {
    set_selected_repository(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {isLoggedIn ? (
        !selected_repository ? (
          repositories.length === 0 ? (
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">
                  Carregando repositórios...
                </h1>
                <p>Por favor, aguarde.</p>
              </div>
            </div>
          ) : (
            <RepositoriesList
              user_repositories={repositories}
              onRepositoryClick={handleRepositoryClick}
            />
          )
        ) : (
          <Board
            github={{
              token: github_user_info.token,
              user: github_user_info.user,
              repo: selected_repository,
            }}
            onGoBack={handleGoBackToRepos}
          />
        )
      ) : (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">Bem-vindo ao TrelloHub</h1>
            <p className="text-lg text-gray-400 mb-8">
              Faça login com sua conta do GitHub para começar!
            </p>
            <div className="flex justify-center">
              <Button
                onClick={handleLogin}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105"
              >
                Login with GitHub
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
