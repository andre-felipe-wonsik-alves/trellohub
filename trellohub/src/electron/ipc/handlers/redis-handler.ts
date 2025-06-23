import { ipcMain } from 'electron';
import { redisService } from '../../redis/redis-api-service';

const _redisService = new redisService();

const REDIS_CHANNELS = {
    GET_MOCK: 'redis:get-mock'
} as const;

export const githubHandlers = {
    register(): void {
        console.log('Registrando handlers do redis...');

        ipcMain.handle(REDIS_CHANNELS.GET_MOCK, async (event, key: string) => {
            try {
                return await _redisService.get_mock(key);
            } catch (error) {
                console.error('Erro ao obter URL OAuth:', error);
                throw error;
            }
        });

        console.log('Handlers do redis registrados');
    },

    unregister(): void {
        console.log('Removendo handlers do redis...');

        Object.values(REDIS_CHANNELS).forEach(channel => {
            ipcMain.removeAllListeners(channel);
        });

        console.log('Handlers do redis removidos');
    }
};