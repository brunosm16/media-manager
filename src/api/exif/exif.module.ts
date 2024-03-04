import { Module } from '@nestjs/common';

import { ExifService } from './exif.service';

@Module({
  exports: [ExifService],
  providers: [ExifService],
})
export class ExifModule {}
