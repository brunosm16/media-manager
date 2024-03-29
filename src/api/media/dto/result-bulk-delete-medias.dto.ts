import type { MediaEntity } from '../entities/media.entity';

export type ResultBulkDeleteMediasDto = {
  media: MediaEntity;
  wasDeleted: boolean;
};

export type ResponseBulkDeleteMediasDto = {
  mediaId: string;
  wasDeleted: boolean;
};
