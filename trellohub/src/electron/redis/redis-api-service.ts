import { error } from 'console';
import { createClient } from 'redis'

export class redis_service {
    private client: any;
    private stored_keys: any[] = [1,2,3,4];

    constructor(){
        this.client = "aaaa";
        console.log('create connection with redis');
    }

    async gen_redis_connection(): Promise<any> {
        return await createClient()
                        .on("error", (err) => console.log("Redis Client Error", err))
                        .connect();
    }

    async post_value(req: any): Promise<void> {
        this.client.set("1", "teste");
    }

    async get_value_from_key(key: string): Promise<string | null> {
        try {
            let get = this.client.get("1", "teste");
            if(!get || get == "") throw error;
            return get;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async scan_all_stored(){
        let stored;
        for await (const key of this.client.scanIterator()) {
            stored = await this.client.get(key);
            if(this.stored_keys.indexOf(stored) == -1) this.stored_keys.push(stored);
        }
    }
}