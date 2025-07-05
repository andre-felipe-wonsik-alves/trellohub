import { redisService } from "../redis/redis-service.js";
import { observer } from "../../utils/http/http-observer.js"
import { Axios, AxiosRequestConfig } from "axios";

interface ISyncService {
    handle_syncronization(): Promise<any>;
    push_request(requestConfig: AxiosRequestConfig): Promise<string>;
}

class SyncService implements ISyncService {
    private keys: string[] = [];
    public async handle_syncronization() {
        for (let key of this.keys) {
            let req = redisService.get(key);

        }
    }
    public async push_request(requestConfig: AxiosRequestConfig): Promise<string> {
        let key = (!this.keys)?"1":(Number(this.keys[this.keys.length-1])+1).toString();
        redisService.set(key, JSON.stringify(requestConfig));
        return "";
    }
}

export const sync_service = new SyncService();

observer.subscribe((event: any) => {
    if (event.type === "sync") {
        sync_service.handle_syncronization()
    }
})
