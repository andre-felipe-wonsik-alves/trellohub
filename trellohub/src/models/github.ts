export interface github_user {
    id: number;
    login: string;
    name: string | null;
    email: string | null;
    avatar_url: string;
    html_url: string;
}

export interface github_repository {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    html_url: string;
    clone_url: string;
    default_branch: string;
    language: string | null;
    stargazers_count: number;
    forks_count: number;
    open_issues_count: number;
    created_at: string;
    updated_at: string;
    owner: github_user;
    private: boolean;
}

export interface github_issue {
    id: number;
    number: number;
    title: string;
    body: string | null;
    state: 'open' | 'closed';
    html_url: string;
    created_at: string;
    updated_at: string;
    closed_at: string | null;
    assignee: github_user | null;
    assignees: github_user[];
    labels: github_label[];
    milestone: github_milestone | null;
    user: github_user;
}

export interface github_pull_request {
    id: number;
    number: number;
    title: string;
    body: string | null;
    state: 'open' | 'closed';
    html_url: string;
    created_at: string;
    updated_at: string;
    closed_at: string | null;
    merged_at: string | null;
    merge_commit_sha: string | null;
    assignee: github_user | null;
    assignees: github_user[];
    requested_reviewers: github_user[];
    labels: github_label[];
    milestone: github_milestone | null;
    user: github_user;
    head: {
        ref: string;
        sha: string;
    };
    base: {
        ref: string;
        sha: string;
    };
    draft: boolean;
    merged: boolean;
}

export interface github_label {
    id: number;
    name: string;
    color: string;
    description: string | null;
}

export interface github_milestone {
    id: number;
    number: number;
    title: string;
    description: string | null;
    state: 'open' | 'closed';
    created_at: string;
    updated_at: string;
    due_on: string | null;
    closed_at: string | null;
}

export interface github_commit {
    sha: string;
    html_url: string;
    commit: {
        message: string;
        author: {
            name: string;
            email: string;
            date: string;
        };
        committer: {
            name: string;
            email: string;
            date: string;
        };
    };
    author: github_user | null;
    committer: github_user | null;
}

export interface github_auth_token {
    access_token: string;
    token_type: string;
    scope: string;
}

export interface repository_data {
    repository: github_repository;
    issues: github_issue[];
    pull_requests: github_pull_request[];
    commits: github_commit[];
    labels: github_label[];
    milestones: github_milestone[];
}

export interface github_api_error {
    message: string;
    status: number;
    documentation_url?: string;
}