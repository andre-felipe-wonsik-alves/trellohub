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
        show: false, // Não mostrar até estar pronto
    });

    // Carregar a aplicação React
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../../../dist/index.html'));
    }

    // Mostrar a janela quando estiver pronta
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Configurações de segurança
    mainWindow.webContents.on('did-finish-load', () => {
        console.log('✅ Janela principal carregada');
    });

    return mainWindow;
}