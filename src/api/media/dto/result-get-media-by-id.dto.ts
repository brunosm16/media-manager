import type { ExifEntity } from 'src/api/exif/entities/exif.entity';

import type { MediaTypeEnum } from '../enums/media.enums';

export type ResultGetMediaIdByDto = {
  createdAt: string;

  deletedAt: string;

  description: string;

  dispositiveId: string;

  id: string;

  isFavorite: boolean;

  mediaFilePath: string;

  mediaImageRescalePath: string;

  mediaType: MediaTypeEnum;

  mediaVideoThumbnailPath: string;

  mimeType: string;

  updatedAt: string;

  userId: string;

  // eslint-disable-next-line perfectionist/sort-object-types
  exif: ExifEntity;
};
