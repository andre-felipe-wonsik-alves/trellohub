import { redisService } from "../redis/redis-service.js";

interface ISyncService{
    handleSyncronization(): Promise<any>;
    pushRequest(endpoint: string, body: JSON): Promise<string>;
}

class SyncService{
    private keys: string[] = redisService.get_keys();
    public async handleSyncronization() {
    }

}

export const sync_service = new SyncService();
