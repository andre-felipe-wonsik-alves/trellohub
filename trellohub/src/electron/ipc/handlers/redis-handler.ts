import { ipcMain } from 'electron';
// Assuming your updated RedisService is in this path
import { redisService } from '../../services/redis/redis-service.js';

// Instantiate the RedisService.
// It's crucial to connect to Redis when your Electron app starts up
// or before you attempt any Redis operations.

// Define your IPC channels using snake_case
const REDIS_CHANNELS = {
    // Connection and Disconnection
    CONNECT: 'redis:connect',
    DISCONNECT: 'redis:disconnect',

    // Key-Value Operations
    SET: 'redis:set',
    GET: 'redis:get',
    DEL: 'redis:del',
    EXISTS: 'redis:exists',

    // Mock (if you still need it, though less critical for a full service)
    GET_MOCK: 'redis:get_mock',
} as const;

export const redisHandlers = {
    async register(): Promise<void> {
        console.log('Registrando handlers do redis...');

        // Connect to Redis when handlers are registered
        // This is a good place to ensure the service is ready
        try {
            await redisService.connect();
            console.log('Redis service connected during handler registration.');
        } catch (error) {
            console.error('Falha ao conectar ao Redis durante o registro dos handlers:', error);
            // Decide how to handle this critical error: throw, exit, or log and continue
            // For now, we'll just log, but a real app might need a more robust error strategy
        }

        // --- Connection & Disconnection Handlers ---
        ipcMain.handle(REDIS_CHANNELS.CONNECT, async () => {
            try {
                await redisService.connect();
                return { success: true, message: 'Connected to Redis' };
            } catch (error: any) {
                console.error('Erro ao conectar ao Redis:', error);
                return { success: false, message: error.message || 'Failed to connect to Redis' };
            }
        });

        ipcMain.handle(REDIS_CHANNELS.DISCONNECT, async () => {
            try {
                await redisService.disconnect();
                return { success: true, message: 'Disconnected from Redis' };
            } catch (error: any) {
                console.error('Erro ao desconectar do Redis:', error);
                return { success: false, message: error.message || 'Failed to disconnect from Redis' };
            }
        });

        // --- Key-Value Operations Handlers ---

        // SET Handler: redis:set
        // Expects { key: string, value: string, options?: object }
        ipcMain.handle(REDIS_CHANNELS.SET, async (event, { key, value, options }: { key: string, value: string, options?: object }) => {
            try {
                const result = await redisService.set(key, value, options);
                return { success: true, result: result };
            } catch (error: any) {
                console.error(`Erro ao setar chave '${key}':`, error);
                return { success: false, message: error.message || `Failed to set key '${key}'` };
            }
        });

        // GET Handler: redis:get
        // Expects key: string
        ipcMain.handle(REDIS_CHANNELS.GET, async (event, key: string) => {
            try {
                const value = await redisService.get(key);
                return { success: true, value: value };
            } catch (error: any) {
                console.error(`Erro ao obter chave '${key}':`, error);
                return { success: false, message: error.message || `Failed to get key '${key}'` };
            }
        });

        // DEL Handler: redis:del
        // Expects keys: string[]
        ipcMain.handle(REDIS_CHANNELS.DEL, async (event, keys: string[]) => {
            try {
                const deletedCount = await redisService.del(...keys); // Use spread operator for multiple keys
                return { success: true, deleted_count: deletedCount };
            } catch (error: any) {
                console.error(`Erro ao deletar chave(s) '${keys.join(', ')}':`, error);
                return { success: false, message: error.message || `Failed to delete key(s) '${keys.join(', ')}'` };
            }
        });

        // EXISTS Handler: redis:exists
        // Expects key: string
        ipcMain.handle(REDIS_CHANNELS.EXISTS, async (event, key: string) => {
            try {
                const exists = await redisService.exists(key);
                return { success: true, exists: exists };
            } catch (error: any) {
                console.error(`Erro ao verificar existência da chave '${key}':`, error);
                return { success: false, message: error.message || `Failed to check existence of key '${key}'` };
            }
        });

        // --- Mock Handler ---
        ipcMain.handle(REDIS_CHANNELS.GET_MOCK, async (event, key: string) => {
            try {
                // Renamed from get_mock to getMock in the RedisService, adjust accordingly
                return await redisService.get_mock(key);
            } catch (error: any) {
                console.error('Erro ao obter mock:', error);
                throw error; // Re-throw errors for the renderer to catch if needed
            }
        });

        console.log('Handlers do redis registrados');
    },

    async unregister(): Promise<void> {
        console.log('Removendo handlers do redis...');

        // Disconnect from Redis when handlers are unregistered
        try {
            await redisService.disconnect();
            console.log('Redis service disconnected during handler unregistration.');
        } catch (error) {
            console.error('Falha ao desconectar do Redis durante a desregistro dos handlers:', error);
        }

        Object.values(REDIS_CHANNELS).forEach(channel => {
            ipcMain.removeAllListeners(channel);
        });

        console.log('Handlers do redis removidos');
    }
};