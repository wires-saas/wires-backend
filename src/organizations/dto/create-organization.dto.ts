import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateOrganizationDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  slug: string;

  @IsObject()
  @IsOptional()
  address: {
    street: string;
    city: string;
    zip: string;
    country: string;
  };
}
