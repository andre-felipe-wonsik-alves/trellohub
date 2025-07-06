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
        this.keys = await this.redisService.get_keys();
        for (let key of this.keys) {
            let req: AxiosRequestConfig = await this.redisService.get(key);
            let response = await axios(req);
        }
    }
    public async push_request(requestConfig: AxiosRequestConfig): Promise<void> {
        try {
            this.keys = await this.redisService.get_keys();
            let key = (!this.keys)?"1":(Number(this.keys[0])+1).toString();
            this.redisService.set(key, JSON.stringify(requestConfig));
            console.log(`Requisição salva na chave ${key}`);        
        } catch (error) {
            console.error(error);
        }
    }
}

export const sync_service = new SyncService();

observer.subscribe((event: any) => {
    if (event.type === "sync") {
        sync_service.handle_syncronization();
    }

    if (event.type === "offline") {
        sync_service.push_request(event.request)
    }
})
