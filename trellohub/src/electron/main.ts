import { app, BrowserWindow } from 'electron';
import { registerIpcHandlers } from './ipc/ipc-handler.js';
import { createWindow } from './windows/main-window.js';

let mainWindow: BrowserWindow | null = null;

async function setupApp(): Promise<void> {
  registerIpcHandlers();

  mainWindow = await createWindow();
}

app.whenReady().then(setupApp);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    setupApp();
  }
});

console.log("🚀 Electron main process iniciado");