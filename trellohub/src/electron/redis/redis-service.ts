import { createClient, RedisClientType } from 'redis';

export class redisService {
    private client: RedisClientType; // Use specific RedisClientType for better typing
    private isConnected: boolean = false; // Track connection status

    constructor() {
        // Initialize client here, but don't connect immediately
        this.client = createClient();
        this.client.on('error', (err) => {
            console.error('Redis Client Error:', err);
            this.isConnected = false; // Mark as disconnected on error
        });
    }

    public async connect(): Promise<void> {
        if (this.isConnected) {
            console.log('Redis client is already connected.');
            return;
        }
        try {
            await this.client.connect();
            this.isConnected = true;
            console.log('Redis client connected successfully.');
        } catch (error) {
            console.error('Failed to connect to Redis:', error);
            throw new Error('Unable to connect to Redis service.');
        }
    }

    public async disconnect(): Promise<void> {
        if (!this.isConnected) {
            console.log('Redis client is already disconnected.');
            return;
        }
        try {
            await this.client.quit(); // Use quit to gracefully close the connection
            this.isConnected = false;
            console.log('Redis client disconnected successfully.');
        } catch (error) {
            console.error('Failed to disconnect from Redis:', error);
            throw new Error('Unable to disconnect from Redis service.');
        }
    }

    private ensure_connected(): void {
        if (!this.isConnected) {
            throw new Error('Redis client is not connected. Call connect() first.');
        }
    }

    public async set(key: string, value: string, options?: { EX?: number; PX?: number; NX?: boolean; XX?: boolean }): Promise<string | null> {
        this.ensure_connected();
        try {
            return await this.client.set(key, value, options);
        } catch (error) {
            console.error(`Error setting key '${key}':`, error);
            return null;
        }
    }

    public async get(key: string): Promise<string | null> {
        this.ensure_connected();
        try {
            const value = await this.client.get(key);
            if (value === null) {
                console.log(`Key '${key}' not found in Redis.`);
            }
            return value;
        } catch (error) {
            console.error(`Error getting key '${key}':`, error);
            return null;
        }
    }

    public async del(...keys: string[]): Promise<number> {
        this.ensure_connected();
        try {
            return await this.client.del(keys);
        } catch (error) {
            console.error(`Error deleting key(s) '${keys.join(', ')}':`, error);
            return 0;
        }
    }

    public async exists(key: string): Promise<boolean> {
        this.ensure_connected();
        try {
            const count = await this.client.exists(key);
            return count > 0;
        } catch (error) {
            console.error(`Error checking existence of key '${key}':`, error);
            return false;
        }
    }

    public async get_mock(key: string): Promise<string> {
        return `GET - ${key} (Mocked)`;
    }
}