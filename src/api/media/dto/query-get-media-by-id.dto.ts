import { IsNotEmpty, IsUUID } from 'class-validator';

export class QueryGetMediaByIdDto {
  @IsNotEmpty()
  @IsUUID()
  mediaId: string;
}
