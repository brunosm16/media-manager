import type { RemoveObjectKeysResult } from 'src/utils/utils-types';

import { Injectable, Logger } from '@nestjs/common';
import * as exifr from 'exifr';
import { logErrorDetailed } from 'src/utils/logs';
import { camelCaseObjectKeys, removeObjectKeys } from 'src/utils/objects-utils';

import type {
  ExifEntityOutput,
  ExifEntityParseError,
  ExifrOutput,
} from './entities/exif.types';

@Injectable()
export class ExifService {
  private makeExifEntityParseError(
    reason: string,
    mimeType: string
  ): ExifEntityParseError {
    return {
      mimeType,
      reason,
    };
  }

  private async parseExifrOutput(
    exifrOutput: ExifrOutput
  ): Promise<ExifEntityOutput> {
    const { isSuccessfulDeleted, resultObject: sanitizedExifrOutput } =
      this.sanitizeExifrOutput(exifrOutput);

    if (!isSuccessfulDeleted) {
      throw new Error('Error sanitizing Exifr');
    }

    const exifEntityOutput: ExifEntityOutput =
      camelCaseObjectKeys(sanitizedExifrOutput);

    return exifEntityOutput;
  }

  private sanitizeExifrOutput(
    exifrOutput: ExifrOutput
  ): RemoveObjectKeysResult {
    const sanitizedExifrOutput = exifrOutput;

    const sanitizeFields = [
      'ComponentsConfiguration',
      'GPSAltitudeRef',
      'GPSProcessingMethod',
    ];

    return removeObjectKeys(sanitizedExifrOutput, sanitizeFields);
  }

  public async parse(
    path: string,
    mimeType: string
  ): Promise<ExifEntityOutput | ExifEntityParseError> {
    try {
      if (mimeType === 'image/gif') {
        Logger.log('GIF not supported as Exif Data');
        return this.makeExifEntityParseError('GIF not supported', mimeType);
      }

      const result: ExifrOutput = await exifr.parse(path);

      if (!result) {
        Logger.log('No Exif data found image');
        return this.makeExifEntityParseError('No Exif data found', mimeType);
      }

      return await this.parseExifrOutput(result);
    } catch (err) {
      logErrorDetailed(err, 'Error parsing Exif data');
      throw err;
    }
  }
}
