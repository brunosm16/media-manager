import { Injectable } from '@nestjs/common';

import type { CreateMediaDto } from './dto/create-media.dto';

@Injectable()
export class MediaService {
  createBatch(createMediaDto: CreateMediaDto) {
    return 'This action add medias in batch';
  }
}
