import axios, { AxiosInstance, isAxiosError } from "axios";
import type {
  github_repository,
  github_issue,
  github_pull_request,
  github_commit,
  github_label,
  repository_data,
  github_api_error,
} from "../../types/github.js";
import { observer } from "../../utils/http/http-observer.js";
import "../../utils/http/setup-observer.js";

export interface GithubApiService_interface {
  get_user_repositories(token: string): Promise<github_repository[]>;
  get_repository_data(
    token: string,
    owner: string,
    repo: string
  ): Promise<repository_data>;
}

export class GithubApiService implements GithubApiService_interface {
  private readonly base_url: string;
  private readonly user_agent: string;
  private readonly axios_instance: AxiosInstance;

  constructor() {
    this.base_url = "https://api.github.com";
    this.user_agent = "TrelloHub";

    this.axios_instance = axios.create({
      baseURL: this.base_url,
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": this.user_agent,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });
  }

  private handle_api_error(error: unknown, contextMessage: string): never {
    if (isAxiosError(error)) {
      console.log("HANDLE_API\n\n")
      observer.notify({
        type: "offline",
        message: error.message,
        config: error.config,
        response: error.response?.data,
      });
    } else {
      observer.notify({
        type: "unknown_error",
        message:
          error instanceof Error
            ? error.message
            : "o bagulho ficou louco",
        error,
      });
    }
    throw new Error(
      `${contextMessage}: ${error instanceof Error ? error.message : "unknown error"
      }`
    );
  }

  async get_user_repositories(token: string): Promise<github_repository[]> {
    try {
      const repositories: github_repository[] = [];
      let page = 1;
      const per_page = 100;

      while (true) {
        const response = await this.axios_instance.get<github_repository[]>(
          "/user/repos",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              page,
              per_page,
              sort: "updated",
              type: "all",
            },
          }
        );

        const data = response.data;

        if (data.length === 0) break;

        repositories.push(...data);

        if (data.length < per_page) break;

        page++;
      }

      return repositories;
    } catch (error: unknown) {
      this.handle_api_error(error, "Failed to get user repositories");
    }
  }

  async get_repository_data(
    token: string,
    owner: string,
    repo: string
  ): Promise<repository_data> {
    try {
      const [repository, issues, pull_requests, commits, labels] =
        await Promise.all([
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
    } catch (error: unknown) {
      this.handle_api_error(error, "Failed to get repository data");
    }
  }

  private async get_repository(
    token: string,
    owner: string,
    repo: string
  ): Promise<github_repository> {
    try {
      const response = await this.axios_instance.get<github_repository>(
        `/repos/${owner}/${repo}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: unknown) {
      this.handle_api_error(error, "Failed to get repository");
    }
  }

  async get_authenticated_user(token: string): Promise<{ login: string }> {
    try {
      const response = await this.axios_instance.get("/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: unknown) {
      this.handle_api_error(error, "Failed to get authenticated user");
    }
  }

  public async get_repository_issues(
    token: string,
    owner: string,
    repo: string
  ): Promise<github_issue[]> {
    try {
      const issues: github_issue[] = [];
      let page = 1;
      const per_page = 100;

      while (true) {
        const response = await this.axios_instance.get<github_issue[]>(
          `/repos/${owner}/${repo}/issues`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              page,
              per_page,
              state: "all",
            },
          }
        );

        const data = response.data;

        if (data.length === 0) break;

        const actual_issues = data.filter((issue: any) => !issue.pull_request);
        issues.push(...actual_issues);

        if (data.length < per_page) break;

        page++;
      }

      return issues;
    } catch (error: unknown) {
      this.handle_api_error(error, "Failed to get repository issues");
    }
  }

  async create_issue(
    token: string,
    owner: string,
    repo: string,
    title: string,
    body: string = "",
    labels?: string[]
  ): Promise<github_issue> {
    try {
      const response = await this.axios_instance.post<github_issue>(
        `/repos/${owner}/${repo}/issues`,
        {
          title,
          body,
          labels,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      this.handle_api_error(error, "Failed to create issue");
    }
  }

  async update_issue(
    token: string,
    owner: string,
    repo: string,
    issue_number: number,
    fields: Partial<{
      title: string;
      body: string;
      labels: string[];
      state: "open" | "closed";
    }>
  ): Promise<github_issue> {
    try {
      const response = await this.axios_instance.patch<github_issue>(
        `/repos/${owner}/${repo}/issues/${issue_number}`,
        fields,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      this.handle_api_error(error, "Failed to update issue");
    }
  }

  async close_issue(
    token: string,
    owner: string,
    repo: string,
    issue_number: number
  ): Promise<github_issue> {
    return this.update_issue(token, owner, repo, issue_number, {
      state: "closed",
    });
  }

  private async get_repository_pull_requests(
    token: string,
    owner: string,
    repo: string
  ): Promise<github_pull_request[]> {
    try {
      const pull_requests: github_pull_request[] = [];
      let page = 1;
      const per_page = 100;

      while (true) {
        const response = await this.axios_instance.get<github_pull_request[]>(
          `/repos/${owner}/${repo}/pulls`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              page,
              per_page,
              state: "all",
            },
          }
        );

        const data = response.data;

        if (data.length === 0) break;

        pull_requests.push(...data);

        if (data.length < per_page) break;

        page++;
      }

      return pull_requests;
    } catch (error: unknown) {
      this.handle_api_error(error, "Failed to get repository pull requests");
    }
  }

  private async get_repository_commits(
    token: string,
    owner: string,
    repo: string
  ): Promise<github_commit[]> {
    try {
      const response = await this.axios_instance.get<github_commit[]>(
        `/repos/${owner}/${repo}/commits`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            per_page: 50,
          },
        }
      );

      return response.data;
    } catch (error: unknown) {
      this.handle_api_error(error, "Failed to get repository commits");
    }
  }

  private async get_repository_labels(
    token: string,
    owner: string,
    repo: string
  ): Promise<github_label[]> {
    try {
      const response = await this.axios_instance.get<github_label[]>(
        `/repos/${owner}/${repo}/labels`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error: unknown) {
      this.handle_api_error(error, "Failed to get repository labels");
    }
  }

  async get_repository_rate_limit(token: string): Promise<any> {
    try {
      const response = await this.axios_instance.get("/rate_limit", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: unknown) {
      this.handle_api_error(error, "Failed to get rate limit");
    }
  }
}
