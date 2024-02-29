import type { Response as ExpressResponse } from 'express';

import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createReadStream, existsSync } from 'fs';
import { MediaManagerJobsService } from 'src/modules/media-manager-jobs/media-manager-jobs.service';
import { groupArrayByKey } from 'src/utils/arrays';
import { logErrorDetailed } from 'src/utils/logs';
import { Repository } from 'typeorm';

import type {
  QueryGetMediasByDateDto,
  QueryGetMediasByDispositiveIdDto,
  ResultDataGetMediasGeneral,
  ResultGetMediasGeneralDto,
} from './dto';
import type { CreateMediaDto } from './dto/create-media.dto';
import type { QueryDisplayFileMediaDto } from './dto/query-display-file-media.dto';
import type {
  ResultDataGetMediasByDate,
  ResultGetMediasByDateDto,
} from './dto/result-get-medias-by-date.dto';

import { MediaEntity } from './entities/media.entity';
import { MediaTypeEnum } from './enums/media.enums';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(MediaEntity)
    private readonly mediaRepository: Repository<MediaEntity>,
    private readonly mediaManagerJobsService: MediaManagerJobsService
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

  private async createRangeStreamableFile(
    range: string,
    filePath: string,
    res: ExpressResponse
  ): Promise<StreamableFile> {
    const { end, start } = this.extractRangeLimits(range);

    const isInvalidRange = !start || !end || start >= end;

    if (isInvalidRange) {
      res.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE).set({
        'Content-Range': `bytes ${start}-${end}/${end}`,
      });

      throw new BadRequestException('Invalid range provided');
    }

    const headers = {
      'Accept-Ranges': 'bytes',
      'Content-Length': `${end - start}`,
      'Content-Range': `bytes ${start}-${end}/${end}`,
      'Content-Type': 'video/mp4',
    };

    res.status(HttpStatus.PARTIAL_CONTENT).set(headers);

    return this.createStreamableFile(filePath, { end, start });
  }

  private async createStreamableFile(
    filePath: string,
    opts?: { end: number; start: number }
  ) {
    if (!filePath || !existsSync(filePath)) {
      throw new BadRequestException('Media file path invalid');
    }

    const stream = createReadStream(filePath, opts);
    return new StreamableFile(stream);
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

  private extractRangeLimits(range: string): { end: number; start: number } {
    const [startRange, endRange] = range.replace(/bytes=/, '').split('-');

    const start = parseInt(startRange, 10);
    const end = parseInt(endRange, 10);

    return {
      end,
      start,
    };
  }

  private async findMediaByIdAndDispositiveId(
    query: QueryDisplayFileMediaDto,
    userId: string
  ): Promise<MediaEntity> {
    const { dispositiveId, id } = query;

    const queryString = `
      SELECT * from medias m
      WHERE m."id" = $1
      AND m."dispositiveId" = $2
      AND m."userId" = $3
    `;

    const fields = [id, dispositiveId, userId];

    const [media] = await this.mediaRepository.query(queryString, fields);

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    return media;
  }

  private groupMediasByDate(
    medias: MediaEntity[]
  ): ResultDataGetMediasByDate[] {
    const parseISODate = (date: string) =>
      new Date(date).toISOString().slice(0, 10);

    const groupedByCreatedAt = groupArrayByKey(
      medias,
      'createdAt',
      parseISODate
    );

    const resultDataGetMediasByDate: ResultDataGetMediasByDate[] = Object.keys(
      groupedByCreatedAt
    ).map((key) => ({
      date: key,
      medias: groupedByCreatedAt[key],
    }));

    return resultDataGetMediasByDate;
  }

  private makeGetMediasByDateResponse(
    length: number,
    limitDate: string,
    result: ResultDataGetMediasByDate[] = []
  ): ResultGetMediasByDateDto {
    return {
      length,
      limitDate,
      result,
    };
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

  private makeResultGetMediasGeneral(
    length: number,
    keyValue: Record<string, string>,
    result: ResultDataGetMediasGeneral[] = []
  ): ResultGetMediasGeneralDto {
    const keys = Object.keys(keyValue);

    if (keys.length > 1) {
      throw new BadRequestException(
        'Invalid key value',
        'makeResultGetMediasGeneral'
      );
    }

    const [key] = keys;
    const value = keyValue[key];

    return {
      [`${key}`]: value,
      length,
      result,
    };
  }

  public async createBatch(
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

  public async displayFile(
    query: QueryDisplayFileMediaDto,
    res: ExpressResponse,
    userId: string,
    headersRange: string
  ): Promise<StreamableFile> {
    try {
      const media = await this.findMediaByIdAndDispositiveId(query, userId);
      const { mediaFilePath, mediaType, mimeType } = media;

      const isRangeRequest = headersRange && mediaType === MediaTypeEnum.VIDEO;

      if (isRangeRequest) {
        return await this.createRangeStreamableFile(
          headersRange,
          mediaFilePath,
          res
        );
      }

      res.set({
        'Content-Type': mimeType,
      });

      return await this.createStreamableFile(mediaFilePath);
    } catch (err) {
      logErrorDetailed(err, 'Error while trying to display file');
      throw err;
    }
  }

  public async getMediasByDate(
    query: QueryGetMediasByDateDto,
    userId: string
  ): Promise<ResultGetMediasByDateDto> {
    const { dispositiveId, limitDate, sort } = query;

    const queryString = `
      SELECT * from medias m
      WHERE m."dispositiveId" = $1 AND
      m."createdAt" <= $2 AND
      m."userId" = $3
      ORDER BY m."createdAt" ${sort}
    `;

    const fields = [dispositiveId, limitDate, userId];

    const medias = await this.mediaRepository.query(queryString, fields);
    const length = medias?.length;

    if (!length) {
      return this.makeGetMediasByDateResponse(medias?.length, limitDate);
    }

    const mediasByDate = this.groupMediasByDate(medias);

    return this.makeGetMediasByDateResponse(length, limitDate, mediasByDate);
  }

  public async getMediasByDispositiveId(
    query: QueryGetMediasByDispositiveIdDto,
    userId: string
  ): Promise<ResultGetMediasGeneralDto> {
    const { dispositiveId } = query;

    const medias = await this.mediaRepository.findBy({
      dispositiveId,
      userId,
    });

    return this.makeResultGetMediasGeneral(
      medias?.length,
      { dispositive: dispositiveId },
      medias
    );
  }
}
