import {
  IsBoolean,
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
  @IsBoolean()
  isFavorite: boolean;

  @IsNotEmpty()
  @IsUUID()
  userId: string;
}
