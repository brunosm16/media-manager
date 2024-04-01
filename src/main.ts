import type { NestExpressApplication } from '@nestjs/platform-express';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { RedisIoAdapter } from './middlewares/redis-io-adapter-middleware';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();

  app.set('trust proxy');
  app.useGlobalPipes(new ValidationPipe());
  app.useWebSocketAdapter(redisIoAdapter);

  await app.listen(3000);
}
bootstrap();
