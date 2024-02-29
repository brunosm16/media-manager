import { IsDateString, IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export class QueryGetMediasByDateDto {
  @IsNotEmpty()
  @IsUUID()
  dispositiveId: string;

  @IsNotEmpty()
  @IsDateString()
  limitDate: string;

  @IsNotEmpty()
  @IsEnum(['ASC', 'DESC'], { message: 'sort must be ASC or DESC' })
  sort: string;
}
