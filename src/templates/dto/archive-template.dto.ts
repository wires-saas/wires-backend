import { IsBoolean, IsDefined } from 'class-validator';

export class ArchiveTemplateDto {
  @IsDefined()
  @IsBoolean()
  isArchived: boolean;
}
