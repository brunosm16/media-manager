import type { MediaTypeEnum } from '../enums/media.enums';

export type ResultDataGetMediasGeneral = {
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
};

export class ResultGetMediasGeneralDto {
  [key: string]: any;

  length: number;

  result: ResultDataGetMediasGeneral[];
}
