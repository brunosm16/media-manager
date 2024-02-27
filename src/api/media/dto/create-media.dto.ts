import {
  IsBooleanString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateMediaDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsUUID()
  dispositiveId: string;

  @IsOptional()
  @IsBooleanString()
  isFavorite: boolean;
}
