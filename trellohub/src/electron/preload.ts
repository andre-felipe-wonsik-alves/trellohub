import { contextBridge, ipcRenderer, shell } from "electron";

console.log("\n\n\nSALVE DO PRELOAD\n\n\n");

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
