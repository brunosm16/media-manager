import { IsDateString, IsNotEmpty } from 'class-validator';

export class QueryGetLatestMediasDto {
  @IsNotEmpty()
  @IsDateString()
  limitDate: string;
}
