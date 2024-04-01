import { Process, Processor } from '@nestjs/bull';
import { BadRequestException, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import * as Ffmpeg from 'fluent-ffmpeg';
import { existsSync, mkdirSync } from 'fs';
import { readFile, stat, unlink } from 'fs/promises';
import * as path from 'path';
import * as sharp from 'sharp';
import { ExifEntity } from 'src/api/exif/entities/exif.entity';
import { ExifService } from 'src/api/exif/exif.service';
import { MediaEntity } from 'src/api/media/entities/media.entity';
import { createMediasDirectory } from 'src/api/media/multer/media.multer.utils';
import { logErrorDetailed } from 'src/utils/logs';
import { WebsocketsEventsGateway } from 'src/websockets-events/websockets-events.gateway';
import { Repository } from 'typeorm';

import type { MediaPaths } from './media-manager-jobs.types';

import {
  DELETE_MEDIAS_ON_STORAGE_JOB,
  EXTRACT_EXIF_DATA_JOB,
  EXTRACT_VIDEO_THUMBNAIL_JOB,
  MEDIA_MANAGER_PARENT_QUEUE,
  RESCALE_DIRECTORY,
  RESCALE_IMAGE_JOB,
  VIDEO_THUMBNAIL_DIRECTORY,
} from './media-manager-jobs.constants';

@Processor(MEDIA_MANAGER_PARENT_QUEUE)
export class MediaManagerJobsProcessor {
  constructor(
    @InjectRepository(MediaEntity)
    private readonly mediaRepository: Repository<MediaEntity>,
    @InjectRepository(ExifEntity)
    private readonly exifRepository: Repository<ExifEntity>,
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    private readonly webSocketsEventsGateway: WebsocketsEventsGateway,
    private readonly exifService: ExifService
  ) {}

  private emitFileEvent(
    userId: string,
    file: ExifEntity | MediaEntity | string | string[],
    eventName: string = 'onPersistedFile'
  ): void {
    const fileData = typeof file === 'string' ? { filePath: file } : file;

    this.webSocketsEventsGateway.server
      .to(userId)
      .emit(eventName, JSON.stringify(fileData));
  }

  private extractFilenameFromPath(filePath: string): string {
    const { ext, name } = path.parse(filePath);
    return `${name}${ext}`;
  }

  private extractMediaFromJobData(job: Job): MediaEntity {
    const persistedMedia = job?.data?.jobData as MediaEntity;

    if (!persistedMedia) {
      throw new BadRequestException(
        'Invalid job data provided. Please provide a Media Entity'
      );
    }

    return persistedMedia;
  }

  private async extractPathsFromMedia(
    media: MediaEntity,
    destinationDirectoryName: string
  ): Promise<MediaPaths> {
    const { dispositiveId, mediaFilePath, userId } = media;

    const mediaUploadPath = this.configService.get('MEDIA_UPLOAD_PATH');
    const destinationDirectory = createMediasDirectory(
      mediaUploadPath,
      userId,
      dispositiveId,
      destinationDirectoryName
    );

    const filename = this.extractFilenameFromPath(mediaFilePath);
    const destinationPath = `${destinationDirectory}/${filename}`;

    if (!existsSync(destinationDirectory)) {
      mkdirSync(destinationDirectory, { recursive: true });
    }

    return {
      destinationPath,
      originalPath: mediaFilePath,
    } as MediaPaths;
  }

  private getAllMediaPaths(medias: MediaEntity[]): string[] {
    return medias.reduce((acc: string[], curr: MediaEntity) => {
      const { mediaFilePath, mediaImageRescalePath, mediaVideoThumbnailPath } =
        curr;

      if (mediaFilePath) {
        acc.push(mediaFilePath);
      }

      if (mediaImageRescalePath) {
        acc.push(mediaImageRescalePath);
      }

      if (mediaVideoThumbnailPath) {
        acc.push(mediaVideoThumbnailPath);
      }

      return acc;
    }, [] as string[]);
  }

  private async persistVideoThumbnail(
    destinationPath: string,
    id: string,
    userId: string
  ): Promise<void> {
    const result = await this.mediaRepository.update(
      { id },
      { mediaVideoThumbnailPath: destinationPath }
    );

    if (!result?.affected) {
      throw new BadRequestException(
        'Video thumbnail was not persisted correctly'
      );
    }
    this.emitFileEvent(userId, destinationPath);

    Logger.log('Video thumbnail persisted successfully');
  }

  private async rescaleImage(
    originalPath: string,
    destinationPath: string
  ): Promise<sharp.OutputInfo> {
    const file = await readFile(originalPath);

    const rescaledImage = await sharp(file)
      .resize(200, 200, { fit: 'cover' })
      .toFile(destinationPath);

    return rescaledImage;
  }

  private async unlinkMediaPaths(paths: string[]): Promise<string[]> {
    const promises = paths.map(async (pathToDelete) => {
      try {
        await unlink(pathToDelete);
        Logger.log(`Media deleted successfully: ${pathToDelete}`);
        return pathToDelete;
      } catch (err) {
        logErrorDetailed(
          err,
          `Error while deleting media on storage: ${pathToDelete}`
        );
        return null;
      }
    });

    return Promise.all(promises);
  }

  @Process(DELETE_MEDIAS_ON_STORAGE_JOB)
  public async deleteMediasOnStorage(job: Job): Promise<void> {
    try {
      const { jobData } = job.data;
      const medias = jobData?.medias as MediaEntity[];
      const userId = jobData?.userId as string;
      const paths = this.getAllMediaPaths(medias);
      const deletedPaths = await this.unlinkMediaPaths(paths);
      const filteredDeletedPaths = deletedPaths.filter(
        (deletedPath) => !!deletedPath
      );

      this.emitFileEvent(userId, filteredDeletedPaths, 'onDeletedFiles');
    } catch (err) {
      logErrorDetailed(err, 'Error while deleting medias on storage');
      throw err;
    }
  }

  @Process(EXTRACT_EXIF_DATA_JOB)
  public async extractExifDataJob(job: Job): Promise<void> {
    try {
      const media = this.extractMediaFromJobData(job);

      const { mediaFilePath, mimeType } = media;

      const parsedOutput = await this.exifService.parse(
        mediaFilePath,
        mimeType
      );

      const exifEntity =
        this.exifService.createExifEntityFromOutput(parsedOutput);

      exifEntity.mediaId = media.id;
      exifEntity.mediaName = this.extractFilenameFromPath(media.mediaFilePath);
      exifEntity.mediaSize = (await stat(mediaFilePath)).size;

      const savedExifEntity = await this.exifRepository.save(exifEntity);

      if (!savedExifEntity) {
        throw new BadRequestException('Exif data was not persisted correctly');
      }

      Logger.log('Exif data persisted successfully', { savedExifEntity });

      this.emitFileEvent(media?.userId, savedExifEntity);
    } catch (err) {
      logErrorDetailed(err, 'Error while extracting Exif data');
      throw err;
    }
  }

  @Process(EXTRACT_VIDEO_THUMBNAIL_JOB)
  public async extractVideoThumbnail(job: Job): Promise<void> {
    try {
      const media = this.extractMediaFromJobData(job);

      const { destinationPath, originalPath } =
        await this.extractPathsFromMedia(media, VIDEO_THUMBNAIL_DIRECTORY);

      Ffmpeg(originalPath)
        .thumbnail({
          filename: `${path.parse(originalPath).name}.png`,
          folder: destinationPath,
          timestamps: ['1'],
        })
        .on('error', (err) => {
          logErrorDetailed(
            err,
            'Error while extracting video thumbnail with Ffmpeg'
          );
          throw err;
        })
        .on('end', () =>
          this.persistVideoThumbnail(destinationPath, media?.id, media?.userId)
        );
    } catch (err) {
      logErrorDetailed(err, 'Error while extracting video thumbnail');
      throw err;
    }
  }

  @Process(RESCALE_IMAGE_JOB)
  public async rescaleImageJob(job: Job): Promise<void> {
    try {
      const media = this.extractMediaFromJobData(job);

      const { destinationPath, originalPath } =
        await this.extractPathsFromMedia(media, RESCALE_DIRECTORY);

      const rescaledImage = await this.rescaleImage(
        originalPath,
        destinationPath
      );

      const result = await this.mediaRepository.update(
        { id: media.id },
        { mediaImageRescalePath: destinationPath }
      );

      if (!result?.affected) {
        throw new BadRequestException(
          'Image rescale was not persisted correctly'
        );
      }

      Logger.log(`Image rescaled successfully`, { rescaledImage });

      this.emitFileEvent(media?.userId, destinationPath);
    } catch (err) {
      logErrorDetailed(err, 'Error while rescaling image');
      throw err;
    }
  }
}
