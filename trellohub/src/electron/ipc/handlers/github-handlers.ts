import { ipcMain } from 'electron';
import { GithubAuthService } from '../../github/github-auth-service.js';
import { GithubApiService } from '../../github/github-api-service.js';

const authService = new GithubAuthService();
const apiService = new GithubApiService();

const GITHUB_CHANNELS = {
    GET_OAUTH_URL: 'github:get-oauth-url',
    EXCHANGE_CODE_FOR_TOKEN: 'github:exchange-code-for-token',
    IS_TOKEN_VALID: 'github:is-token-valid',
    REVOKE_TOKEN: 'github:revoke-token',
    GET_USER_REPOSITORIES: 'github:get-user-repositories',
    GET_REPOSITORY_DATA: 'github:get-repository-data',
    AUTHORIZATION_CODE_RECEIVED: 'github:authorization-code-received',
} as const;

export const githubHandlers = {
    register(): void {
        console.log('Registrando handlers do GitHub...');

        ipcMain.handle(GITHUB_CHANNELS.GET_OAUTH_URL, async () => {
            try {
                return await authService.get_oauth_url();
            } catch (error) {
                console.error('Erro ao obter URL OAuth:', error);
                throw error;
            }
        });

        ipcMain.handle(GITHUB_CHANNELS.EXCHANGE_CODE_FOR_TOKEN, async (event, code: string) => {
            try {
                return await authService.exchange_code_for_token(code);
            } catch (error) {
                console.error('Erro ao trocar código por token:', error);
                throw error;
            }
        });

        ipcMain.handle(GITHUB_CHANNELS.IS_TOKEN_VALID, async (event, token: string) => {
            try {
                return await authService.is_token_valid(token);
            } catch (error) {
                console.error('Erro ao validar token:', error);
                throw error;
            }
        });

        ipcMain.handle(GITHUB_CHANNELS.REVOKE_TOKEN, async (event, token: string) => {
            try {
                return await authService.revoke_token(token);
            } catch (error) {
                console.error('Erro ao revogar token:', error);
                throw error;
            }
        });

        ipcMain.handle(GITHUB_CHANNELS.GET_USER_REPOSITORIES, async (event, token: string) => {
            try {
                return await apiService.get_user_repositories(token);
            } catch (error) {
                console.error('Erro ao obter repositórios:', error);
                throw error;
            }
        });

        ipcMain.handle(GITHUB_CHANNELS.GET_REPOSITORY_DATA, async (event, token: string, owner: string, repo: string) => {
            try {
                return await apiService.get_repository_data(token, owner, repo);
            } catch (error) {
                console.error('Erro ao obter dados do repositório:', error);
                throw error;
            }
        });

        ipcMain.on(GITHUB_CHANNELS.AUTHORIZATION_CODE_RECEIVED, (event, code: string) => {
            console.log('Código de autorização recebido:', code);
        });

        console.log('Handlers do GitHub registrados');
    },

    unregister(): void {
        console.log('Removendo handlers do GitHub...');

        Object.values(GITHUB_CHANNELS).forEach(channel => {
            ipcMain.removeAllListeners(channel);
        });

        console.log('Handlers do GitHub removidos');
    }
};