import { Octokit } from '@octokit/rest';
// import { createOAuthAppAuth } from '@octokit/auth-oauth-app';
import type { github_user, github_auth_token } from '../types/github'; //* o type é maneiro para interfaces
import { openGithubAuthWindow } from "../windows/github-window.js"

import axios from 'axios';

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
    // private readonly oauth_app: Octokit;

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
            await openGithubAuthWindow(url, this.redirect_uri);
        } catch (error) {
            throw new Error("error:" + error);
        }
    }

    async exchange_code_for_token(code: string): Promise<github_auth_token> {
        try {
            const response = await axios.post('https://github.com/login/oauth/access_token', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                data: JSON.stringify({
                    client_id: this.client_id,
                    client_secret: this.client_secret,
                    code: code,
                    redirect_uri: this.redirect_uri,
                }),
            });

            const data = response.data;

            return {
                access_token: data.access_token,
                token_type: data.token_type || 'bearer',
                scope: data.scope || this.scopes.join(' '),
            };
        } catch (error) {
            throw new Error("Erro no get_oauth_url:\n " + error)
        }
    }

    async get_authenticated_user(token: string): Promise<github_user> {
        try {
            const user_octokit = new Octokit({
                auth: token,
                userAgent: 'TrelloHub',
            });

            const { data } = await user_octokit.rest.users.getAuthenticated();

            return data as github_user;
        } catch (error: any) {
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
            const response = await axios.delete(`https://api.github.com/applications/${this.client_id}/token`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Basic ${(`${this.client_id}:${this.client_secret}`)
                        }`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                data: JSON.stringify({
                    access_token: token,
                }),
            });

            console.log("Token revogado!\n" + response);
        } catch (error: any) {
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
            const user_octokit = new Octokit({
                auth: token,
                userAgent: 'TrelloHub',
            });

            const { headers } = await user_octokit.rest.users.getAuthenticated();

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