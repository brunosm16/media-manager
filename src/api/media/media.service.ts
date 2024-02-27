import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MediaManagerJobsService } from 'src/modules/media-manager-jobs/media-manager-jobs.service';
import { logErrorDetailed } from 'src/utils/logs';
import { Repository } from 'typeorm';

import type { CreateMediaDto } from './dto/create-media.dto';

import { MediaEntity } from './entities/media.entity';
import { MediaTypeEnum } from './enums/media.enums';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(MediaEntity)
    private mediaRepository: Repository<MediaEntity>,
    private mediaManagerJobsService: MediaManagerJobsService
  ) {}

  private async createMedia(
    createMediaDto: CreateMediaDto,
    userId: string,
    file: Express.Multer.File
  ) {
    const mediaEntity = await this.makeMediaEntityToCreate(
      createMediaDto,
      userId,
      file
    );

    const result = await this.mediaRepository.save(mediaEntity);

    if (mediaEntity.mediaType === MediaTypeEnum.IMAGE) {
      await this.mediaManagerJobsService.registerRescaleImageJob(mediaEntity);
    }

    if (mediaEntity.mediaType === MediaTypeEnum.VIDEO) {
      await this.mediaManagerJobsService.extractVideoThumbnail(mediaEntity);
    }

    return result;
  }

  private extractMediaTypeFromMimeType(mimeType: string): MediaTypeEnum {
    if (mimeType.startsWith('image')) {
      return MediaTypeEnum.IMAGE;
    }

    if (mimeType.startsWith('video')) {
      return MediaTypeEnum.VIDEO;
    }

    return MediaTypeEnum.OTHER;
  }

  private async makeMediaEntityToCreate(
    createMediaDto: CreateMediaDto,
    userId: string,
    file: Express.Multer.File
  ) {
    const media = new MediaEntity();

    const { description, dispositiveId, isFavorite } = createMediaDto;

    media.description = description;
    media.dispositiveId = dispositiveId;
    media.isFavorite = isFavorite;
    media.mediaFilePath = file.path;
    media.mediaType = this.extractMediaTypeFromMimeType(file.mimetype);
    media.mimeType = file.mimetype;
    media.userId = userId;

    return media;
  }

  async createBatch(
    createMediaDto: CreateMediaDto,
    userId: string,
    files: Express.Multer.File[]
  ) {
    try {
      if (!files?.length) {
        throw new BadRequestException('No files were sent to be inserted');
      }

      const promises = files.map(async (file) =>
        this.createMedia(createMediaDto, userId, file)
      );

      const result = await Promise.all(promises);

      Logger.log(
        `Medias inserted using batch mode. Total medias inserted: ${result.length}`
      );

      return result;
    } catch (err) {
      logErrorDetailed(err, 'Error while trying to insert media in batch mode');
      throw err;
    }
  }
}
