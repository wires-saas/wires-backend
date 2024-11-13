import {
  IsAlpha,
  IsAlphanumeric,
  IsLowercase,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateOrganizationDto {
  @IsNotEmpty()
  @IsString()
  @IsAlphanumeric()
  @MinLength(2)
  @MaxLength(255)
  organizationName: string;

  @IsNotEmpty()
  @IsString()
  @IsAlpha()
  @IsLowercase()
  @MinLength(3)
  @MaxLength(32)
  organizationSlug: string;

  @IsNotEmpty()
  @IsString()
  userPassword: string;
}
