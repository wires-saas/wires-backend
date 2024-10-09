import { IsBoolean, IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { CreateBlockDto } from './create-block.dto';

export class UpdateBlockDto extends CreateBlockDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsDefined()
  @IsBoolean()
  isArchived: boolean;
}
