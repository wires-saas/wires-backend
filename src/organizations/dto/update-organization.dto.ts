import { IsObject, IsOptional, IsString } from 'class-validator';
import { Contact } from '../schemas/organization.schema';

export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  legalName?: string;

  @IsOptional()
  @IsString()
  legalId?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  activity?: string;

  @IsOptional()
  @IsObject()
  address?: Record<string, string>;

  @IsOptional()
  @IsObject()
  subscription?: { type: string };

  @IsOptional()
  @IsObject()
  adminContact?: Contact;

  @IsOptional()
  @IsObject()
  billingContact?: Contact;

  @IsOptional()
  @IsObject()
  security?: {
    twoFactorAuthenticationEnabled: boolean;
    twoFactorAuthenticationMethods: string[];
  };
}
