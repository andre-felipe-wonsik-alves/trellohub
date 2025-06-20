import {
    github_user,
    github_repository,
    repository_data,
    github_auth_token
} from '../types/github';

interface ElectronAPI {
    // GitHub OAuth APIs
    getOAuthUrl: () => Promise<string>;
    exchangeCodeForToken: (code: string) => Promise<github_auth_token>;
    getAuthenticatedUser: (token: string) => Promise<github_user>;
    isTokenValid: (token: string) => Promise<boolean>;
    revokeToken: (token: string) => Promise<void>;
    getUserRepositories: (token: string) => Promise<github_repository[]>;
    getRepositoryData: (token: string, owner: string, repo: string) => Promise<repository_data>;
    
    // Redis APIs
    getRedisMock: (req: string) => Promise<string | null>;

    // System APIs
    openExternal: (url: string) => Promise<void>;
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}

export { };