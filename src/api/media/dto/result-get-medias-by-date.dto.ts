import type { MediaEntity } from '../entities/media.entity';

export type ResultDataGetMediasByDate = {
  date: string;
  medias: MediaEntity[];
};

export class ResultGetMediasByDateDto {
  length: number;

  limitDate: string;

  result: ResultDataGetMediasByDate[] | null;
}
