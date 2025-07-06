import React from "react"

const RepositoriesList: React.FC<any> = ({ user_repositories, onRepositoryClick }) => {
    return (
        <div>
            <h1> Seus repositórios </h1>
            <ul>
                {user_repositories.map((repo: any) => {
                    return (
                    <li>
                        <button onClick={() => onRepositoryClick(repo)}>
                            {repo.name};
                        </button>
                    </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default RepositoriesList;