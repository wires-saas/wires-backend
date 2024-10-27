import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateContactsProviderDto } from './create-contacts-provider.dto';
import { IsOptional, IsBoolean } from 'class-validator';

// Forbid the type and organization fields from being updated
export class UpdateContactsProviderDto extends PartialType(
  OmitType(CreateContactsProviderDto, ['type', 'organization']),
) {
  @IsBoolean()
  @IsOptional()
  isDefault: boolean;
}
