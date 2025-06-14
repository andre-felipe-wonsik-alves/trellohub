import type {
    github_repository,
    github_issue,
    github_pull_request,
    github_commit,
    github_label,
    repository_data,
    github_api_error
} from '../../models/github';

export interface github_api_service_interface {
    get_user_repositories(token: string): Promise<github_repository[]>;
    get_repository_data(token: string, owner: string, repo: string): Promise<repository_data>;
}

export class github_api_service implements github_api_service_interface {
    private readonly base_url = 'https://api.github.com';
    private readonly user_agent = 'TrelloHub';

    async get_user_repositories(token: string): Promise<github_repository[]> {
        const repositories: github_repository[] = [];
        let page = 1;
        const per_page = 100;

        while (true) {
            const url = `${this.base_url}/user/repos?page=${page}&per_page=${per_page}&sort=updated&type=all`;
            const response = await this.make_authenticated_request(url, token);

            const data = await response.json();

            if (data.length === 0) break;

            repositories.push(...data);

            if (data.length < per_page) break;

            page++;
        }

        return repositories;
    }

    async get_repository_data(token: string, owner: string, repo: string): Promise<repository_data> {
        const [
            repository,
            issues,
            pull_requests,
            commits,
            labels,
        ] = await Promise.all([
            this.get_repository(token, owner, repo),
            this.get_repository_issues(token, owner, repo),
            this.get_repository_pull_requests(token, owner, repo),
            this.get_repository_commits(token, owner, repo),
            this.get_repository_labels(token, owner, repo),
        ]);

        return {
            repository,
            issues,
            pull_requests,
            commits,
            labels,
        };
    }

    private async get_repository(token: string, owner: string, repo: string): Promise<github_repository> {
        const url = `${this.base_url}/repos/${owner}/${repo}`;
        const response = await this.make_authenticated_request(url, token);
        return await response.json();
    }

    private async get_repository_issues(token: string, owner: string, repo: string): Promise<github_issue[]> {
        const issues: github_issue[] = [];
        let page = 1;
        const per_page = 100;

        while (true) {
            const url = `${this.base_url}/repos/${owner}/${repo}/issues?page=${page}&per_page=${per_page}&state=all`;
            const response = await this.make_authenticated_request(url, token);

            const data = await response.json();

            if (data.length === 0) break;

            const actual_issues = data.filter((issue: any) => !issue.pull_request);
            issues.push(...actual_issues);

            if (data.length < per_page) break;

            page++;
        }

        return issues;
    }

    private async get_repository_pull_requests(token: string, owner: string, repo: string): Promise<github_pull_request[]> {
        const pull_requests: github_pull_request[] = [];
        let page = 1;
        const per_page = 100;

        while (true) {
            const url = `${this.base_url}/repos/${owner}/${repo}/pulls?page=${page}&per_page=${per_page}&state=all`;
            const response = await this.make_authenticated_request(url, token);

            const data = await response.json();

            if (data.length === 0) break;

            pull_requests.push(...data);

            if (data.length < per_page) break;

            page++;
        }

        return pull_requests;
    }

    private async get_repository_commits(token: string, owner: string, repo: string): Promise<github_commit[]> {
        const url = `${this.base_url}/repos/${owner}/${repo}/commits?per_page=50`;
        const response = await this.make_authenticated_request(url, token);
        return await response.json();
    }

    private async get_repository_labels(token: string, owner: string, repo: string): Promise<github_label[]> {
        const url = `${this.base_url}/repos/${owner}/${repo}/labels`;
        const response = await this.make_authenticated_request(url, token);
        return await response.json();
    }

    private async make_authenticated_request(url: string, token: string): Promise<Response> {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': this.user_agent,
            },
        });

        if (!response.ok) {
            const error_data = await response.json();
            throw this.create_api_error(error_data, response.status);
        }

        return response;
    }

    private create_api_error(error_data: any, status: number): github_api_error {
        return {
            message: error_data.message || 'Unknown API error',
            status: status,
            documentation_url: error_data.documentation_url,
        };
    }
}