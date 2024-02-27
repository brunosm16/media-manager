import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { GetAuthenticatedUser } from 'src/decorators/get-authenticated-user.decorator';
import { JwtAuthenticationGuard } from 'src/modules/jwt-helper/jwt.authentication.guard';

import { UserEntity } from '../user/entities/user.entity';
import { CreateMediaDto } from './dto/create-media.dto';
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
  createBatch(
    @Body() createMediaDto: CreateMediaDto,
    @UploadedFiles() files: Express.Multer.File[],
    @GetAuthenticatedUser() user: UserEntity
  ) {
    return this.mediaService.createBatch(createMediaDto, user?.id, files);
  }
}
