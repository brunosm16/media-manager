import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MediaEntity } from './entities/media.entity';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

@Module({
  controllers: [MediaController],
  imports: [TypeOrmModule.forFeature([MediaEntity])],
  providers: [MediaService],
})
export class MediaModule {}
