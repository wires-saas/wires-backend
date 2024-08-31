import {
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { TagRule } from '../schemas/tag-rule.schema';

export class CreateOrUpdateTagDto {
  @IsOptional()
  @IsString()
  _id?: string;

  @IsOptional()
  @IsString()
  organization?: string;

  @IsNotEmpty()
  @IsString()
  displayName: string;

  @IsDefined()
  @IsString()
  description: string;

  @IsDefined()
  @IsArray()
  ruleset: TagRule[];
}
