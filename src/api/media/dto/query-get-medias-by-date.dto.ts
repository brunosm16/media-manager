import { IsDateString, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class QueryGetMediasByDateDto {
  @IsNotEmpty()
  @IsUUID()
  dispositiveId: string;

  @IsNotEmpty()
  @IsDateString()
  limitDate: string;

  @IsNotEmpty()
  @IsString()
  sort: 'ASC' | 'DESC' = 'ASC';
}
