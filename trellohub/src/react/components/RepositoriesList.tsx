import React from "react";

const RepositoriesList: React.FC<any> = ({
  user_repositories,
  onRepositoryClick,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-10">
          Selecione um Repositório
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user_repositories.map((repo: any) => (
            <div
              key={repo.id}
              onClick={() => onRepositoryClick(repo)}
              className="bg-gray-800 bg-opacity-50 rounded-lg p-6 cursor-pointer hover:bg-opacity-75 transition-all duration-300 transform hover:-translate-y-1 border border-gray-700 hover:border-purple-500"
            >
              <h2 className="text-xl font-semibold text-white mb-2">
                {repo.name}
              </h2>
              <p className="text-gray-400 text-sm">
                {repo.description || "Sem descrição."}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RepositoriesList;
