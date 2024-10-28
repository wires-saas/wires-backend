import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateEmailsProviderDto } from './create-emails-provider.dto';
import { IsOptional, IsBoolean } from 'class-validator';

// Forbid the type and organization fields from being updated
export class UpdateEmailsProviderDto extends PartialType(
  OmitType(CreateEmailsProviderDto, ['type', 'organization']),
) {
  @IsBoolean()
  @IsOptional()
  isDefault: boolean;
}
