import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { Redis as RedisClient } from 'ioredis';

@Injectable()
export class RedisUtil implements OnModuleDestroy {
  private client: RedisClient | null = null;
  private readonly url: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.url = process.env.REDIS_URL || this.configService.get<string>('REDIS_URL');
    if (this.url) {
      this.client = new Redis(this.url, {
        lazyConnect: true,
        maxRetriesPerRequest: 2,
        enableReadyCheck: true,
        retryStrategy: (times) => {
          // exponential backoff up to ~10s
          const delay = Math.min(times * 200, 10_000);
          return delay;
        },
      });
    }
  }

  isEnabled(): boolean {
    return !!this.client;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.client) return;
    if (ttlSeconds && ttlSeconds > 0) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) return null;
    return this.client.get(key);
  }

  async del(key: string): Promise<void> {
    if (!this.client) return;
    await this.client.del(key);
  }

  async hdel(key: string, ...fields: string[]): Promise<void> {
    if (!this.client || fields.length === 0) return;
    await this.client.hdel(key, ...fields);
  }

  async hincrby(key: string, field: string, increment: number): Promise<number> {
    if (!this.client) return 0;
    return this.client.hincrby(key, field, increment);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    if (!this.client) return {};
    return this.client.hgetall(key);
  }

  async rename(oldKey: string, newKey: string): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.rename(oldKey, newKey);
    } catch (e) {
      if (e.message !== 'ERR no such key') {
        throw e;
      }
    }
  }

  async keys(pattern: string): Promise<string[]> {
    if (!this.client) return [];
    return this.client.keys(pattern);
  }

  async scan(pattern: string, count = 100): Promise<string[]> {
    if (!this.client) return [];
    const keys: string[] = [];
    let cursor = '0';
    do {
      const [nextCursor, foundKeys] = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', count);
      keys.push(...foundKeys);
      cursor = nextCursor;
    } while (cursor !== '0');
    return keys;
  }

  async lock(key: string, ttlSeconds: number, token = 'locked'): Promise<boolean> {
    if (!this.client) return false;
    const result = await this.client.set(key, token, 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }

  async unlock(key: string, token = 'locked'): Promise<void> {
    if (!this.client) return;
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    await this.client.eval(script, 1, key, token);
  }

  async onModuleDestroy() {
    if (this.client) {
      try { await this.client.quit(); } catch { }
      this.client = null;
    }
  }
}


