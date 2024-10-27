import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SupportedContactsProvider } from '../entities/contacts-provider.entities';

export class CreateContactsProviderDto {
  @IsNotEmpty()
  @IsEnum(SupportedContactsProvider)
  type: SupportedContactsProvider;

  @IsNotEmpty()
  @IsString()
  organization: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @IsString()
  @IsOptional()
  secretKey: string;

  isDefault: boolean;
}
