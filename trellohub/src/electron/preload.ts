import { contextBridge, IpcRenderer, ipcRenderer, shell } from "electron";

const electronAPI = {
  getOAuthUrl: () => ipcRenderer.invoke("github:get-oauth-url"),
  exchangeCodeForToken: (code: string) => ipcRenderer.invoke("github:exchange-code-for-token", code),
  getAuthenticatedUser: (token: string) => ipcRenderer.invoke("github:get-authenticated-user", token),
  isTokenValid: (token: string) => ipcRenderer.invoke("github:is-token-valid", token),
  revokeToken: (token: string) => ipcRenderer.invoke("github:revoke-token", token),
  getUserRepositories: (token: string) => ipcRenderer.invoke("github:get-user-repositories", token),
  getRepositoryData: (token: string, owner: string, repo: string) => ipcRenderer.invoke("github:get-repository-data", token, owner, repo),
  getMock: (key: string) => ipcRenderer.invoke("redis:get-mock", key),
  openExternal: (url: string) => ipcRenderer.invoke("open-external", url),
  make_login: () => ipcRenderer.invoke("github:open-oauth-window"),
  getRepositoryIssues: (token: string, owner: string, repo: string) =>
    ipcRenderer.invoke("github:get-repository-issues", token, owner, repo),
  createIssue: (token: string, owner: string, repo: string, title: string, body: string) =>
    ipcRenderer.invoke("github:create-issue", token, owner, repo, title, body),
  updateIssue: (token: string, owner: string, repo: string, issue_number: number, fields: Partial<{ title: string; body: string; labels: string[]; state: "open" | "closed" }>) =>
    ipcRenderer.invoke("github:update-issue", token, owner, repo, issue_number, fields),
  closeIssue: (token: string, owner: string, repo: string, issue_number: number) =>
    ipcRenderer.invoke("github:close-issue", token, owner, repo, issue_number),
  saveToken: (token: string) => ipcRenderer.invoke('github:save-token', token),
  getToken: () => ipcRenderer.invoke('github:get-token'),
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);

window.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");

  if (code) {
    console.log("Authorization code received:", code);
    ipcRenderer.send("github:authorization-code-received", code);
  }
});
