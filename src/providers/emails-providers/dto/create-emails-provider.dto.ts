import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SupportedEmailsProvider } from '../entities/emails-provider.entities';

export class CreateEmailsProviderDto {
  @IsNotEmpty()
  @IsEnum(SupportedEmailsProvider)
  type: SupportedEmailsProvider;

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
