import CacheProvider from './CacheProvider';

export default class InMemoryCacheProvider implements CacheProvider {
    private store = new Map<string, any>();

    async init() {
        // No-op for in-memory
    }

    async set(key: string, value: any, expirationInSec?: number) {
        this.store.set(key, value);
        // Expiration is ignored for dev
    }

    async get<T>(key: string): Promise<T> {
        return this.store.get(key);
    }

    async delete(key: string) {
        this.store.delete(key);
    }

    async close() {
        // No-op for in-memory
    }

    async exists(key: string) {
        return this.store.has(key);
    }
} 