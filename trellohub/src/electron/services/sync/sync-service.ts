import { RedisService } from "../redis/redis-service.js";
import { observer } from "../../utils/http/http-observer.js"
import axios, { AxiosRequestConfig } from "axios";

interface ISyncService {
    handle_syncronization(): Promise<any>;
    push_request(requestConfig: AxiosRequestConfig): Promise<void>;
}

class SyncService implements ISyncService {
    private keys: string[] = [];
    private readonly redisService = new RedisService();


    public async handle_syncronization(): Promise<any> {
        await this.redisService.connect();
        this.keys = await this.redisService.get_keys();
        console.log(this.keys);
        for (const key of this.keys) {
            try {
                const req = await this.redisService.get(key);
                console.log(req);
                if (req) {
                    const response = await axios(req);
                    if (response.status >= 200 && response.status < 300) {
                        await this.redisService.del(key);
                        console.log(`Request for key ${key} successful and removed from Redis.`);
                    }
                }
            } catch (error) {
                console.error(`Failed to sync request for key ${key}:`, error);
            }
        }
        await this.redisService.disconnect();
    }
    public async push_request(requestConfig: AxiosRequestConfig): Promise<void> {
        try {
            await this.redisService.connect();
            console.log("REQ CONFIG: \n\n\n", requestConfig)
            this.keys = await this.redisService.get_keys();
            console.log(this.keys);
            let key = (this.keys.length == 0)?"1":(Number(this.keys[this.keys.length-1])+1).toString();
            await this.redisService.set(key, JSON.stringify(requestConfig));
            console.log(`Requisição salva na chave ${key}`);        
            console.log(await this.redisService.get(key));
            await this.redisService.disconnect();
        } catch (error) {
            await this.redisService.disconnect();
            console.error("Failed to push request to Redis:", error);
        }
    }
}

export const sync_service = new SyncService();

observer.subscribe((event: any) => {
    if (event.type === "sync") {
        sync_service.handle_syncronization();
    }
    if (event.type === "offline" && event.config) {
        console.log("push_request!!!\n\n\n\n")
        console.log(event.config);
        sync_service.push_request(event.config)
    }
})
