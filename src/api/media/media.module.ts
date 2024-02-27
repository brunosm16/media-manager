import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { mediaManagerBullQueueFactory } from 'src/modules/media-manager-jobs/media-manager-jobs.configuration';
import { MEDIA_MANAGER_PARENT_QUEUE } from 'src/modules/media-manager-jobs/media-manager-jobs.constants';
import { MediaManagerJobsModule } from 'src/modules/media-manager-jobs/media-manager-jobs.module';
import { MediaManagerJobsService } from 'src/modules/media-manager-jobs/media-manager-jobs.service';

import { MediaEntity } from './entities/media.entity';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

@Module({
  controllers: [MediaController],
  imports: [
    TypeOrmModule.forFeature([MediaEntity]),
    BullModule.registerQueueAsync({
      name: MEDIA_MANAGER_PARENT_QUEUE,
      useFactory: () => mediaManagerBullQueueFactory(),
    }),
    MediaManagerJobsModule,
  ],
  providers: [MediaService, MediaManagerJobsService],
})
export class MediaModule {}
