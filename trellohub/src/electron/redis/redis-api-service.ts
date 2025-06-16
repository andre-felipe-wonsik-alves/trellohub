import { createClient } from 'redis'

export class redisService {
    private client;
    private stored_keys: any[];

    constructor(){
        this.client = this.gen_redis_connection()
    }

    private async gen_redis_connection(): Promise<any> {
        return await createClient()
                        .on("error", (err) => console.log("Redis Client Error", err))
                        .connect();
    }

    async post_redis(req: any): Promise<void> {
        this.client.set("");
    }

    async scan_all_stored(){
        let stored;
        for await (const key of this.client.scanIterator()) {
            stored = await this.client.get(key);
            if(this.stored_keys.indexOf(stored) == -1) this.stored_keys.push(stored);
        }
    }
}