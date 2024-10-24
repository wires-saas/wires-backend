import { IsNotEmpty, IsString } from 'class-validator';

export class CreateContactsProviderDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
