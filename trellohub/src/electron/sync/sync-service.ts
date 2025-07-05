import { redisService } from "../redis/redis-service.js";
import { observer } from "../utils/http/http-observer.js"

interface ISyncService {
    handle_syncronization(): Promise<any>;
    push_request(endpoint: string, body: JSON): Promise<string>;
}

class SyncService implements ISyncService {
    private keys: string[] = redisService.get_keys();
    public async handle_syncronization() {
        for (let key of this.keys) {
            let req = redisService.get(key);

        }
    }
    public async push_request(endpoint: string, body: JSON): Promise<string> {
        return "";
    }
}

export const sync_service = new SyncService();

observer.subscribe((event: any) => {
    if (event.type === "sync") {
        sync_service.handle_syncronization()
    }
})
