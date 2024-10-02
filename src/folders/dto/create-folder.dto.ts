import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFolderDto {
  @IsNotEmpty()
  @IsString()
  organization: string;

  @IsNotEmpty()
  @IsString()
  displayName: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  parentFolder: string;
}
