import { IsObject, IsOptional, IsString } from 'class-validator';
import { User } from '../../users/schemas/user.schema';

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
  @IsString()
  adminContact?: User;

  @IsOptional()
  @IsString()
  billingContact?: User;

  @IsOptional()
  @IsObject()
  security?: {
    twoFactorAuthenticationEnabled: boolean;
    twoFactorAuthenticationMethods: string[];
  };
}
