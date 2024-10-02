import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ResourceType } from '../entities/resource-type';

export class ResourceDto {
  @IsNotEmpty()
  @IsString()
  organization: string;

  @IsNotEmpty()
  @IsString()
  folder: string;

  @IsNotEmpty()
  @IsString()
  resource: string;

  @IsNotEmpty()
  @IsEnum(ResourceType)
  type: ResourceType;
}
