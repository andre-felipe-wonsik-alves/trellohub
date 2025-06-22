/// <reference path="../../public/types/electron-api.d.ts" />

class GitHubTestSuite {
  token: any;
  user: any;
  repositories: any;

  constructor() {
    this.token = null;
    this.user = null;
    this.repositories = [];
  }
}