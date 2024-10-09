import { IsBoolean, IsDefined } from 'class-validator';

export class ArchiveBlockDto {
  @IsDefined()
  @IsBoolean()
  isArchived: boolean;
}
