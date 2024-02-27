import type { MediaEntity } from 'src/api/media/entities/media.entity';

import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { randomUUID } from 'crypto';

import type { JobRegistrationResult } from './media-manager-jobs.types';

import {
  MEDIA_MANAGER_PARENT_QUEUE,
  RESCALE_IMAGE_JOB,
} from './media-manager-jobs.constants';

@Injectable()
export class MediaManagerJobsService {
  constructor(
    @InjectQueue(MEDIA_MANAGER_PARENT_QUEUE) private parentQueue: Queue
  ) {}

  private async registerJob(
    queueName: string,
    jobData: any
  ): Promise<JobRegistrationResult> {
    const job = await this.parentQueue.add(
      queueName,
      { jobData },
      { jobId: randomUUID() }
    );

    return {
      jobId: job.id,
    };
  }

  private async registerRescaleImageJob(
    media: MediaEntity
  ): Promise<JobRegistrationResult> {
    return this.registerJob(RESCALE_IMAGE_JOB, media);
  }
}
