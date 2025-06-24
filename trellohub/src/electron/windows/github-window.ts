import { BrowserWindow } from 'electron'

export async function openGithubAuthWindow(oauthUrl: string, redirectUri: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const authWindow = new BrowserWindow({
            width: 600,
            height: 800,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
            },
            show: true,
        });

        authWindow.loadURL(oauthUrl);

        // Intercepta as navegações da janela
        authWindow.webContents.on('will-redirect', (_event, url) => {
            if (url.startsWith(redirectUri)) {
                const code = new URL(url).searchParams.get('code');
                if (code) {
                    resolve(code);
                    authWindow.close();
                } else {
                    reject(new Error('Código de autenticação não encontrado.'));
                    authWindow.close();
                }
            }
        });

        authWindow.on('closed', () => {
            reject(new Error('Janela fechada pelo usuário.'));
        });
    });
}