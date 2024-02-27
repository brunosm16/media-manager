import { Injectable, Logger } from '@nestjs/common';

import type { CreateMediaDto } from './dto/create-media.dto';

@Injectable()
export class MediaService {
  createBatch(
    createMediaDto: CreateMediaDto,
    userId: string,
    files: Express.Multer.File[]
  ) {
    Logger.log(`userId: ${userId}`);
    Logger.log(`files`, { files });
    Logger.log(`createMediaDto`, { createMediaDto });
    return 'This action add medias in batch';
  }
}
