import type { BullModuleOptions, BullRootModuleOptions } from '@nestjs/bull';
import type { ConfigService } from '@nestjs/config';

export const mediaManagerBullRootFactory = async (
  configService: ConfigService
): Promise<BullRootModuleOptions> => ({
  redis: {
    host: configService.get('REDIS_HOST'),
    password: configService.get('REDIS_PASSWORD'),
    port: configService.get('REDIS_PORT'),
  },
});

export const mediaManagerBullQueueFactory =
  async (): Promise<BullModuleOptions> => ({
    defaultJobOptions: {
      attempts: 5,
      removeOnComplete: true,
      removeOnFail: false,
    },
  });
