import { Process, Processor } from '@nestjs/bull';
import { BadRequestException, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import { existsSync, mkdirSync } from 'fs';
import sharp from 'sharp';
import { MediaEntity } from 'src/api/media/entities/media.entity';
import { createMediasDirectory } from 'src/api/media/multer/media.multer.utils';
import { logErrorDetailed } from 'src/utils/logs';
import { Repository } from 'typeorm';

import type { MediaPaths } from './media-manager-jobs.types';

import {
  MEDIA_MANAGER_PARENT_QUEUE,
  RESCALE_DIRECTORY,
  RESCALE_IMAGE_JOB,
} from './media-manager-jobs.constants';

@Processor(MEDIA_MANAGER_PARENT_QUEUE)
export class MediaManagerJobsProcessor {
  constructor(
    @InjectRepository(MediaEntity)
    private readonly mediaRepository: Repository<MediaEntity>,
    @Inject(ConfigService)
    private readonly configService: ConfigService
  ) {}

  private extractMediaFromJobData(job: Job): MediaEntity {
    const persistedMedia = job?.data?.jobData as MediaEntity;

    if (!persistedMedia) {
      throw new BadRequestException(
        'Invalid job data provided. Please provide a Media Entity'
      );
    }

    return persistedMedia;
  }

  private async extractPathsFromMedia(media: MediaEntity): Promise<MediaPaths> {
    const { dispositiveId, mediaFilePath, userId } = media;

    const mediaUploadPath = this.configService.get('MEDIA_UPLOAD_PATH');
    const destinationPath = createMediasDirectory(
      mediaUploadPath,
      userId,
      dispositiveId,
      RESCALE_DIRECTORY
    );

    if (!existsSync(destinationPath)) {
      mkdirSync(destinationPath, { recursive: true });
    }

    return {
      destinationPath,
      originalPath: mediaFilePath,
    } as MediaPaths;
  }

  @Process(RESCALE_IMAGE_JOB)
  async rescaleImageJob(job: Job): Promise<void> {
    try {
      const media = this.extractMediaFromJobData(job);

      const { destinationPath, originalPath } =
        await this.extractPathsFromMedia(media);

      const rescaledImage = await sharp(originalPath)
        .resize(200, 200, { fit: 'cover' })
        .toFile(destinationPath);

      await this.mediaRepository.update(
        { id: media.id },
        { mediaImageRescalePath: destinationPath }
      );

      Logger.log(`Image rescaled successfully`, { rescaledImage });
    } catch (err) {
      logErrorDetailed(err, 'Error while rescaling image');
      throw err;
    }
  }
}