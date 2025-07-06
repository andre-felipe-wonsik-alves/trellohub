import Store from 'electron-store';

export class StorageService {
    private store: Store;

    constructor() {
        this.store = new Store();
    }

    public set(key: string, value: any): void {
        this.store.set(key, value);
    }

    public get(key: string): any {
        return this.store.get(key);
    }

    public delete(key: string): void {
        this.store.delete(key);
    }
}
