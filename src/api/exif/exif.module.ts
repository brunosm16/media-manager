import { Module } from '@nestjs/common';

import { ExifService } from './exif.service';

@Module({
  providers: [ExifService],
})
export class ExifModule {}
