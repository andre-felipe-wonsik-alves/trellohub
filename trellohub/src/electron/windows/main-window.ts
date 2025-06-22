import { BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function createWindow(): Promise<BrowserWindow> {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, '../preload.js'),
            webSecurity: true,
            allowRunningInsecureContent: false,
        },
        titleBarStyle: 'default',
        show: false,
    });
    mainWindow.loadURL('http://localhost:5173');

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    return mainWindow;
}