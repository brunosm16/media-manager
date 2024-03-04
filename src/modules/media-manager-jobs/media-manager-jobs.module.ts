import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExifEntity } from 'src/api/exif/entities/exif.entity';
import { ExifModule } from 'src/api/exif/exif.module';
import { ExifService } from 'src/api/exif/exif.service';
import { MediaEntity } from 'src/api/media/entities/media.entity';

import { mediaManagerBullQueueFactory } from './media-manager-jobs.configuration';
import { MEDIA_MANAGER_PARENT_QUEUE } from './media-manager-jobs.constants';
import { MediaManagerJobsProcessor } from './media-manager-jobs.processor';
import { MediaManagerJobsService } from './media-manager-jobs.service';

@Module({
  exports: [MediaManagerJobsService],
  imports: [
    TypeOrmModule.forFeature([MediaEntity, ExifEntity]),
    BullModule.registerQueueAsync({
      name: MEDIA_MANAGER_PARENT_QUEUE,
      useFactory: () => mediaManagerBullQueueFactory(),
    }),
    ExifModule,
  ],
  providers: [MediaManagerJobsService, MediaManagerJobsProcessor, ExifService],
})
export class MediaManagerJobsModule {}
