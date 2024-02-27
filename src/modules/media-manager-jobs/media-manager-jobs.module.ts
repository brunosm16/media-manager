import { Module } from '@nestjs/common';

import { MediaManagerJobsService } from './media-manager-jobs.service';

@Module({
  providers: [MediaManagerJobsService],
})
export class MediaManagerJobsModule {}
