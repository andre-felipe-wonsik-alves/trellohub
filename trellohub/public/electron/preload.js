const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  getOAuthUrl: () => {
    ipcRenderer.invoke("github:get-oauth-url");
  },
  exchangeCodeForToken: (code) => {
    ipcRenderer.invoke("github:exchange-code-for-token", code);
  },
  getAuthenticatedUser: (token) => {
    ipcRenderer.invoke("github:get-authenticated-user", token);
  },
  isTokenValid: (token) => {
    ipcRenderer.invoke("github:is-token-valid", token);
  },
  revokeToken: (token) => {
    ipcRenderer.invoke("github:revoke-token", token);
  },
  getUserRepositories: (token) => {
    ipcRenderer.invoke("github:get-user-repositories", token);
  },
  getRepositoryData: (token, owner, repo) => {
    ipcRenderer.invoke("github:get-repository-data", token, owner, repo);
  },

  openExternal: (url) => {
    ipcRenderer.invoke("open-external", url);
  },
});

window.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");

  if (code) {
    console.log("Authorization code received:", code);
    ipcRenderer.send("github:authorization-code-received", code);
  }
});
