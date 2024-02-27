import { Body, Controller, Logger, Post } from '@nestjs/common';

import { CreateMediaDto } from './dto/create-media.dto';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('create-batch')
  createBatch(@Body() createMediaDto: CreateMediaDto) {
    Logger.log('createBatch - Controller');
    return this.mediaService.createBatch(createMediaDto);
  }
}
