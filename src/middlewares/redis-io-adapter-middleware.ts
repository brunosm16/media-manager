import type { INestApplication } from '@nestjs/common';
import type { ServerOptions } from 'socket.io';

import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  private readonly configService: ConfigService;

  constructor(app: INestApplication) {
    super(app);
    this.configService = app.get(ConfigService);
  }

  private mountRedisURL(): string {
    const host = this.configService.get<string>('REDIS_HOST') || 'localhost';
    const port = this.configService.get<string>('REDIS_PORT') || '6379';
    return `redis://${host}:${port}`;
  }

  async connectToRedis(): Promise<void> {
    const url = this.mountRedisURL();
    const pubClient = createClient({ url });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
