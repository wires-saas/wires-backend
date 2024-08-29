import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrUpdateTagDto {
  @IsOptional()
  @IsString()
  _id?: string;

  @IsNotEmpty()
  @IsString()
  displayName: string;
}
