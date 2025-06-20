import { ipcMain, shell } from 'electron';

const SYSTEM_CHANNELS = {
    OPEN_EXTERNAL: 'system:open-external',
    GET_APP_VERSION: 'system:get-app-version',
    GET_PLATFORM: 'system:get-platform',
} as const;

export const systemHandlers = {
    register(): void {
        console.log('Registrando handlers do sistema...');

        ipcMain.handle(SYSTEM_CHANNELS.OPEN_EXTERNAL, async (event, url: string) => {
            try {

                if (!url || typeof url !== 'string') {
                    throw new Error('URL inválida');
                }


                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    throw new Error('Apenas URLs HTTP/HTTPS são permitidas');
                }

                await shell.openExternal(url);
                return { success: true };
            } catch (error) {
                console.error('Erro ao abrir URL externa:', error);
                throw error;
            }
        });

        ipcMain.handle(SYSTEM_CHANNELS.GET_APP_VERSION, async () => {
            try {
                const { app } = await import('electron');
                return app.getVersion();
            } catch (error) {
                console.error('Erro ao obter versão da aplicação:', error);
                throw error;
            }
        });

        ipcMain.handle(SYSTEM_CHANNELS.GET_PLATFORM, async () => {
            try {
                return process.platform;
            } catch (error) {
                console.error('Erro ao obter plataforma:', error);
                throw error;
            }
        });

        console.log('Handlers do sistema registrados');
    },

    unregister(): void {
        console.log('Removendo handlers do sistema...');

        Object.values(SYSTEM_CHANNELS).forEach(channel => {
            ipcMain.removeAllListeners(channel);
        });

        console.log('Handlers do sistema removidos');
    }
};