import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import { github_auth_service } from './github/github-auth-service.js';
import { github_api_service } from "./github/github-api-service.js";
import { redis_service } from './redis/redis-api-service.js' 
import { error } from 'console';

const githubAuthService = new github_auth_service();
const githubApiService = new github_api_service();
const redisService = new redis_service();

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadURL("http://localhost:5173");
  mainWindow.webContents.openDevTools();
}

// Handlers com tipos explícitos
ipcMain.handle("github:exchange-code-for-token", async (event, code: string) => {
  try {
    console.log("📡 Handler: exchange-code-for-token");
    return await githubAuthService.exchange_code_for_token(code);
  } catch (error) {
    console.error("❌ Erro exchange-code-for-token:", error);
    throw error;
  }
});

ipcMain.handle("github:get-authenticated-user", async (event, token: string) => {
  try {
    console.log("📡 Handler: get-authenticated-user");
    return await githubAuthService.get_authenticated_user(token);
  } catch (error) {
    console.error("❌ Erro get-authenticated-user:", error);
    throw error;
  }
});

ipcMain.handle("github:is-token-valid", async (event, token: string) => {
  try {
    console.log("📡 Handler: is-token-valid");
    return await githubAuthService.is_token_valid(token);
  } catch (error) {
    console.error("❌ Erro is-token-valid:", error);
    throw error;
  }
});

ipcMain.handle("github:revoke-token", async (event, token: string) => {
  try {
    console.log("📡 Handler: revoke-token");
    return await githubAuthService.revoke_token(token);
  } catch (error) {
    console.error("❌ Erro revoke-token:", error);
    throw error;
  }
});

ipcMain.handle("github:get-user-repositories", async (event, token: string) => {
  try {
    console.log("📡 Handler: get-user-repositories");
    return await githubApiService.get_user_repositories(token);
  } catch (error) {
    console.error("❌ Erro get-user-repositories:", error);
    throw error;
  }
});

ipcMain.handle(
  "github:get-repository-data",
  async (event, token: string, owner: string, repo: string) => {
    try {
      console.log("📡 Handler: get-repository-data");
      return await githubApiService.get_repository_data(token, owner, repo);
    } catch (error) {
      console.error("❌ Erro get-repository-data:", error);
      throw error;
    }
  }
);

ipcMain.handle('redis:get_redis', async (req: any) => {
  try {
    console.log('Redis: get');
    let get = await redisService.get_redis("1");
    console.log(get);
    if(!get) throw error;
    return get;
  } catch (error) {
    console.error(error)
  }
});

ipcMain.handle('redis:post_redis', async (req: any) => {
  try {
    console.log('Redis: post');
    await redisService.post_redis("teste");
  } catch (error) {
    console.error(error)
  }
});

ipcMain.handle("open-external", async (event, url: string) => {
  try {
    console.log("🌐 Abrindo URL externa:", url);
    await shell.openExternal(url);
  } catch (error) {
    console.error("❌ Erro ao abrir URL:", error);
    throw error;
  }
});

ipcMain.handle("log", async (event, message: string) => {
  console.log("📝 Log do renderer:", message);
});



// Resto do código permanece igual
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

console.log("🚀 Electron main process iniciado");