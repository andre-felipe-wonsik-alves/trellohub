import { redisService } from "../redis/redis-service.js";

interface ISyncService{
    handleSyncronization(): Promise<any>;
    pushRequest(endpoint: string, body: JSON): Promise<string>;
}

class SyncService implements ISyncService{
    private keys: string[] = redisService.get_keys();
    public async handleSyncronization() {
        for(let key of this.keys){
            let req = redisService.get(key);
            
        }
    }

}

export const sync_service = new SyncService();
