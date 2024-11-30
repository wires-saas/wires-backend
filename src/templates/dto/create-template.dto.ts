import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTemplateDto {
  @IsNotEmpty()
  @IsString()
  organization: string;

  @IsNotEmpty()
  @IsString()
  displayName: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsDefined()
  @IsArray()
  blocks: any;

  @IsOptional()
  @IsBoolean()
  isArchived: boolean;
}
