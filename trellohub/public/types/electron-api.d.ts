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

interface ElectronAPI {
    getOAuthUrl: () => Promise<string>;
    exchangeCodeForToken: (code: string) => Promise<string>;
    getAuthenticatedUser: (token: string) => Promise<any>;
    isTokenValid: (token: string) => Promise<boolean>;
    revokeToken: (token: string) => Promise<boolean>;
    getUserRepositories: (token: string) => Promise<any[]>;
    getRepositoryData: (token: string, owner: string, repo: string) => Promise<any>;
    openExternal: (url: string) => Promise<{ success: boolean }>;
    make_login: () => Promise<any>;
    createIssue: (token: string, owner: string, repo: string, title: string, body: string) => Promise<any>;
    updateIssue: (token: string, owner: string, repo: string, issue_number: number, fields: Partial<{ title: string; body: string; labels: string[]; state: "open" | "closed" }>) => Promise<any>;
    closeIssue: (token: string, owner: string, repo: string, issue_number: number) => Promise<any>;
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}

export { };