import { IsNotEmpty, IsUUID } from 'class-validator';

export class QueryDisplayFileMediaDto {
  @IsNotEmpty()
  @IsUUID()
  dispositiveId: string;

  @IsNotEmpty()
  @IsUUID()
  id: string;
}
