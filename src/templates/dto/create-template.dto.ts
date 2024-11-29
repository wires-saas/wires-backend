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
  @IsString()
  code: string;

  @IsDefined()
  @IsArray()
  model: any;

  @IsDefined()
  @IsArray()
  parameters: any;

  @IsOptional()
  @IsBoolean()
  isArchived: boolean;
}
