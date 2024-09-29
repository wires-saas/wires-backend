import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateOrUpdateBlockDto {
  @IsOptional()
  @IsString()
  _id: string;

  @IsDefined()
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
  @IsBoolean()
  wysiwygEnabled: boolean;

  @IsDefined()
  @IsNumber()
  version: number;

  @IsDefined()
  @IsArray()
  parameters: any;
}
