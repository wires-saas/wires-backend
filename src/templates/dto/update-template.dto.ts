import { IsBoolean, IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { CreateTemplateDto } from './create-template.dto';

export class UpdateTemplateDto extends CreateTemplateDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsDefined()
  @IsBoolean()
  isArchived: boolean;
}
