import { BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function createWindow(): Promise<BrowserWindow> {
    console.log('Current __dirname (where this file is located):', __dirname);

    // This will go up one directory from __dirname
    const parentDir = path.join(__dirname, '..');
    console.log('Parent directory:', parentDir);

    // Assuming your compiled preload.js is now in the parent directory
    // of where your main.js (or this createWindow file) is located
    const preloadPath = path.join(parentDir, 'preload.js'); // <--- CHANGE IS HERE
    console.log('Attempting to load preload from:', preloadPath);

    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: preloadPath,
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