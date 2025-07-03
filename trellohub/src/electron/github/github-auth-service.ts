import axios, { AxiosInstance } from 'axios';
import type { github_user, github_auth_token } from '../types/github';
import { openGithubAuthWindow } from "../windows/github-window.js";
import { observer } from "../utils/http/http-observer.js";

export interface GithubAuthService_interface {
    get_oauth_url(): string;
    get_authenticated_user(token: string): Promise<github_user>;
    exchange_code_for_token(code: string): Promise<github_auth_token>;
    is_token_valid(token: string): Promise<boolean>;
    revoke_token(token: string): Promise<void>;
    login_on_github(): Promise<void>;
}

export class GithubAuthService implements GithubAuthService_interface {
    private readonly client_id: string;
    private readonly client_secret: string;
    private readonly redirect_uri: string;
    private readonly scopes: string[];
    private readonly axios_instance: AxiosInstance;

    constructor(
        client_id: string,
        client_secret: string,
        redirect_uri: string,
        scopes: string[] = ['repo', 'user:email']
    ) {
        this.client_id = client_id;
        this.client_secret = client_secret;
        this.redirect_uri = redirect_uri;
        this.scopes = scopes;

        this.axios_instance = axios.create({
            baseURL: 'https://api.github.com',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'TrelloHub',
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });
    }

    get_oauth_url(): string {
        const base_url = 'https://github.com/login/oauth/authorize';
        const params = new URLSearchParams({
            client_id: this.client_id,
            redirect_uri: this.redirect_uri,
            scope: this.scopes.join(' '),
            state: this.generate_state(),
        });

        return `${base_url}?${params.toString()}`;
    }

    async login_on_github(): Promise<void> {
        try {
            const url = this.get_oauth_url();
            const res = await openGithubAuthWindow(url, this.redirect_uri);
            console.log("LOGIN RES: ", res);
        } catch (error) {
            throw new Error("error:" + error);
        }
    }

    async exchange_code_for_token(code: string): Promise<github_auth_token> {
        try {
            const response = await axios.post(
                'https://github.com/login/oauth/access_token',
                {
                    client_id: this.client_id,
                    client_secret: this.client_secret,
                    code: code,
                    redirect_uri: this.redirect_uri,
                },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                }
            );

            const data = response.data;

            return {
                access_token: data.access_token,
                token_type: data.token_type || 'bearer',
                scope: data.scope || this.scopes.join(' '),
            };
        } catch (error) {
            observer.notify(error);
            throw new Error("Erro no exchange_code_for_token:\n " + error);
        }
    }

    async get_authenticated_user(token: string): Promise<github_user> {
        try {
            const response = await this.axios_instance.get<github_user>('/user', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            return response.data;
        } catch (error: any) {
            observer.notify(error);
            throw new Error(`Failed to get authenticated user: ${error.message}`);
        }
    }

    async is_token_valid(token: string): Promise<boolean> {
        try {
            await this.get_authenticated_user(token);
            return true;
        } catch (error) {
            return false;
        }
    }

    async revoke_token(token: string): Promise<void> {
        try {
            const auth_string = Buffer.from(`${this.client_id}:${this.client_secret}`).toString('base64');
            
            const response = await axios.delete(
                `https://api.github.com/applications/${this.client_id}/token`,
                {
                    headers: {
                        'Authorization': `Basic ${auth_string}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json',
                    },
                    data: {
                        access_token: token,
                    },
                }
            );

            console.log("Token revogado!\n", response.status);
        } catch (error: any) {
            observer.notify(error);
            if (error.name === 'TypeError') {
                throw new Error(`Failed to revoke token: ${error.message}`);
            }
            throw error;
        }
    }

    private generate_state(): string {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }

    async get_token_info(token: string): Promise<any> {
        try {
            const response = await this.axios_instance.get('/user', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const headers = response.headers;

            return {
                rate_limit: {
                    limit: parseInt(headers['x-ratelimit-limit'] || '0'),
                    remaining: parseInt(headers['x-ratelimit-remaining'] || '0'),
                    reset: parseInt(headers['x-ratelimit-reset'] || '0'),
                },
                scopes: String(headers['x-oauth-scopes'] || '').split(',').map(scope => scope.trim()).filter(Boolean),
                accepted_scopes: String(headers['x-accepted-oauth-scopes'] || '').split(',').map(scope => scope.trim()).filter(Boolean),
            };
        } catch (error: any) {
            observer.notify(error);
            throw new Error(`Failed to get token info: ${error.message}`);
        }
    }

    async has_required_scopes(token: string, required_scopes: string[]): Promise<boolean> {
        try {
            const token_info = await this.get_token_info(token);
            const token_scopes = token_info.scopes;

            return required_scopes.every(scope => token_scopes.includes(scope));
        } catch (error) {
            return false;
        }
    }
}