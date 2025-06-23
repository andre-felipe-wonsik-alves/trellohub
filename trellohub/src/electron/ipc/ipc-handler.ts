import { ipcMain } from 'electron';
import { githubHandlers } from './handlers/github-handlers.js';
import { redisHandlers } from './handlers/redis-handler.js';
import { systemHandlers } from './handlers/system-handlers.js';

export function registerIpcHandlers(): void {
    console.log('Registrando handlers IPC...');

    githubHandlers.register();
    redisHandlers.register();
    systemHandlers.register();

    console.log('Handlers IPC registrados com sucesso');
}

export function unregisterIpcHandlers(): void {
    console.log('Removendo handlers IPC...');

    githubHandlers.unregister();
    redisHandlers.unregister();
    systemHandlers.unregister();

    console.log('Handlers IPC removidos');
}