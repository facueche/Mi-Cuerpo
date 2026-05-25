import { env } from "./env";
import { createClient, RedisClientType } from "redis";

export class RedisError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "RedisError";
    }
}

export default class RedisClient {
    private client: RedisClientType;
    private static instance: RedisClient;

    private constructor() {
        this.client = createClient({
            url: env.redis.url,
        });

        this.client.on('error', (err: Error) => console.error('Redis Client Error', err));
        this.client.on('ready', () => {
            console.log('Redis connected and ready');
        });
    }

    private async ensureConnection() {
        if (!this.client.isOpen) {
            await this.client.connect();
        }
    }

    async connect() {
        await this.ensureConnection();
    }

    async get(key: string) {
        await this.ensureConnection();
        const value = await this.client.get(key);
        if (!value) {
            throw new RedisError(`Key ${key} not found in Redis`);
        }
        return value;
    }

    async set(key: string, value: string, ttl?: number) {
        await this.ensureConnection();
        await this.client.set(key, value, { EX: ttl });
    }

    async del(key: string) {
        await this.ensureConnection();
        await this.client.del(key);
    }

    static getInstance(): RedisClient {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient();
        }
        return RedisClient.instance;
    }

    async isUp(): Promise<boolean> {
        try {
            await this.ensureConnection();
            await this.client.ping();
            return true;
        } catch {
            return false;
        }
    }
}
