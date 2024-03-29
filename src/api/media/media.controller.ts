import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Response,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Response as ExpressResponse } from 'express';
import { GetAuthenticatedUser } from 'src/decorators/get-authenticated-user.decorator';
import { JwtAuthenticationGuard } from 'src/modules/jwt-helper/jwt.authentication.guard';

import type {
  ResultGetMediasByDateDto,
  ResultGetMediasGeneralDto,
} from './dto';
import type { ResultGetMediaIdByDto } from './dto/result-get-media-by-id.dto';

import { UserEntity } from '../user/entities/user.entity';
import {
  QueryGetLatestMediasDto,
  QueryGetMediasByDateDto,
  QueryGetMediasByDispositiveIdDto,
} from './dto';
import { CreateMediaDto } from './dto/create-media.dto';
import { QueryDisplayFileMediaDto } from './dto/query-display-file-media.dto';
import { QueryGetMediaByIdDto } from './dto/query-get-media-by-id.dto';
import { MediaService } from './media.service';
import {
  MEDIA_CREATE_BATCH_SIZE,
  MEDIA_FIELDS_NAME,
} from './multer/media.multer.constants';
import { mediaMulterOptions } from './multer/media.multer.options';

@UseGuards(JwtAuthenticationGuard)
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('create-batch')
  @UseInterceptors(
    FilesInterceptor(
      MEDIA_FIELDS_NAME,
      MEDIA_CREATE_BATCH_SIZE,
      mediaMulterOptions
    )
  )
  public async createBatch(
    @Body() createMediaDto: CreateMediaDto,
    @UploadedFiles() files: Express.Multer.File[],
    @GetAuthenticatedUser() user: UserEntity
  ) {
    return this.mediaService.createBatch(createMediaDto, user?.id, files);
  }

  @Get('/display-file')
  public async displayFile(
    @Query(ValidationPipe) query: QueryDisplayFileMediaDto,
    @Response({ passthrough: true }) res: ExpressResponse,
    @GetAuthenticatedUser() user: UserEntity,
    @Headers('range') range: string
  ) {
    return this.mediaService.displayFile(query, res, user?.id, range);
  }

  @Get('/get-latest-medias')
  public async getLatestMedias(
    @Query(ValidationPipe) query: QueryGetLatestMediasDto,
    @GetAuthenticatedUser() user: UserEntity
  ): Promise<ResultGetMediasGeneralDto> {
    return this.mediaService.getLatestMedias(query, user?.id);
  }

  @Get('/get-media-by-id')
  public async getMediaById(
    @Query(ValidationPipe) query: QueryGetMediaByIdDto,
    @GetAuthenticatedUser() user: UserEntity
  ): Promise<ResultGetMediaIdByDto> {
    return this.mediaService.getMediaById(query, user?.id);
  }

  @Get('/get-medias-by-date')
  public async getMediasByDate(
    @Query(ValidationPipe) query: QueryGetMediasByDateDto,
    @GetAuthenticatedUser() user: UserEntity
  ): Promise<ResultGetMediasByDateDto> {
    return this.mediaService.getMediasByDate(query, user?.id);
  }

  @Get('/get-medias-by-dispositive-id')
  public async getMediasByDispositiveId(
    @Query(ValidationPipe) query: QueryGetMediasByDispositiveIdDto,
    @GetAuthenticatedUser() user: UserEntity
  ): Promise<ResultGetMediasGeneralDto> {
    return this.mediaService.getMediasByDispositiveId(query, user?.id);
  }
}
