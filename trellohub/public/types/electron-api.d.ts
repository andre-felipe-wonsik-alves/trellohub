interface GitHubAPI {
    getOAuthUrl: () => Promise<string>;
    exchangeCodeForToken: (code: string) => Promise<string>;
    getAuthenticatedUser: (token: string) => Promise<any>;
    isTokenValid: (token: string) => Promise<boolean>;
    revokeToken: (token: string) => Promise<boolean>;
    getUserRepositories: (token: string) => Promise<any[]>;
    getRepositoryData: (token: string, owner: string, repo: string) => Promise<any>;
    sendAuthorizationCode: (code: string) => void;
}

interface SystemAPI {
    openExternal: (url: string) => Promise<{ success: boolean }>;
    getAppVersion: () => Promise<string>;
    getPlatform: () => Promise<string>;
}

interface redisAPI {
    getMock: (key: string) => Promise<string>;
}

interface ElectronAPI {
    github: GitHubAPI;
    system: SystemAPI;
    redis: redisAPI;
    getOAuthUrl: () => Promise<string>;
    exchangeCodeForToken: (code: string) => Promise<string>;
    getAuthenticatedUser: (token: string) => Promise<any>;
    isTokenValid: (token: string) => Promise<boolean>;
    revokeToken: (token: string) => Promise<boolean>;
    getUserRepositories: (token: string) => Promise<any[]>;
    getRepositoryData: (token: string, owner: string, repo: string) => Promise<any>;
    openExternal: (url: string) => Promise<{ success: boolean }>;
    getMock: (key: string) => Promise<string>;
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}

export { };