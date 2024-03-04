import { BadRequestException, Injectable } from '@nestjs/common';
import * as exifr from 'exifr';
import { logErrorDetailed } from 'src/utils/logs';
import { camelCaseObjectKeys } from 'src/utils/objects-utils';

import type { ExifEntityOutput, ExifrOutput } from './entities/exif.types';

import { ExifEntity } from './entities/exif.entity';
import { exifEntityOutputFields } from './exif.constants';

@Injectable()
export class ExifService {
  public createExifEntityFromOutput(
    entityOutput: ExifEntityOutput
  ): ExifEntity {
    const exifEntity: ExifEntity = new ExifEntity();
    const sanitizeEntityOutput = this.filterEntityOutput(entityOutput);

    Object.assign(exifEntity, sanitizeEntityOutput);

    return exifEntity;
  }

  public filterEntityOutput(entityOutput: ExifEntityOutput) {
    const entries = Object.entries(entityOutput);
    const allowedKeys = exifEntityOutputFields;

    const filteredEntries = entries
      .filter(([key, value]) => allowedKeys.includes(key))
      .map(([key, value]) => [key, value]);

    return Object.fromEntries(filteredEntries);
  }

  public async parse(
    path: string,
    mimeType: string
  ): Promise<ExifEntityOutput> {
    try {
      if (mimeType === 'image/gif') {
        throw new BadRequestException('GIF not supported as Exif Data');
      }

      const parsedOutput: ExifrOutput = await exifr.parse(path);

      if (!parsedOutput) {
        throw new BadRequestException('No Exif data found in image');
      }

      const exifEntityOutput: ExifEntityOutput =
        camelCaseObjectKeys(parsedOutput);

      return exifEntityOutput;
    } catch (err) {
      logErrorDetailed(err, 'Error parsing Exif data');
      throw err;
    }
  }
}
