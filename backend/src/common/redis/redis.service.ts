import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private configService: ConfigService) {
    const redisUrl = this.configService.get<string>('redis.url');

    if (redisUrl) {
      // Upstash (cloud) — connect via full URL with TLS built-in
      this.client = new Redis(redisUrl, {
        lazyConnect: true,
        retryStrategy: () => 2000,
        tls: redisUrl.startsWith('rediss://') ? {} : undefined,
      });
    } else {
      // Local Docker — connect via host/port (no TLS)
      this.client = new Redis({
        host: this.configService.get('redis.host'),
        port: this.configService.get('redis.port'),
        lazyConnect: true,
        retryStrategy: () => 2000,
      });
    }

    this.client.on('error', (err) => {
      this.logger.warn(`Redis connection issue (caching disabled): ${err.message}`);
    });

    this.client.connect().catch(() => {
      this.logger.warn('Could not connect to Redis on startup — caching will be skipped.');
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds = 60): Promise<void> {
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
      // caching is a performance optimization, never a hard dependency
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch {
      // ignore
    }
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}