import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
} from 'class-validator';

export class BulkDeleteMediasByIdsDto {
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(100)
  ids: string[];
}
