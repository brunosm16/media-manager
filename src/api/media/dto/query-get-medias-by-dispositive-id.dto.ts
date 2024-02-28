import { IsNotEmpty, IsUUID } from 'class-validator';

export class QueryGetMediasByDispositiveIdDto {
  @IsNotEmpty()
  @IsUUID()
  dispositiveId: string;
}
