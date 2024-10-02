import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { FolderItemType } from '../entities/folder-item-type';

export class FolderItemDto {
  @IsNotEmpty()
  @IsString()
  organization: string;

  @IsNotEmpty()
  @IsString()
  folder: string;

  @IsNotEmpty()
  @IsString()
  item: string;

  @IsNotEmpty()
  @IsEnum(FolderItemType)
  type: FolderItemType;
}
