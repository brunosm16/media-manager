import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaEntity } from 'src/api/media/entities/media.entity';

import { mediaManagerBullQueueFactory } from './media-manager-jobs.configuration';
import { MEDIA_MANAGER_PARENT_QUEUE } from './media-manager-jobs.constants';
import { MediaManagerJobsProcessor } from './media-manager-jobs.processor';
import { MediaManagerJobsService } from './media-manager-jobs.service';

@Module({
  exports: [MediaManagerJobsService],
  imports: [
    TypeOrmModule.forFeature([MediaEntity]),
    BullModule.registerQueueAsync({
      name: MEDIA_MANAGER_PARENT_QUEUE,
      useFactory: () => mediaManagerBullQueueFactory(),
    }),
  ],
  providers: [MediaManagerJobsService, MediaManagerJobsProcessor],
})
export class MediaManagerJobsModule {}
