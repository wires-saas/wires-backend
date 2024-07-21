import { IsNotEmpty, IsString } from 'class-validator';

export class UserRoleDto {
  @IsNotEmpty()
  @IsString()
  role: string;

  @IsNotEmpty()
  @IsString()
  organization: string;
}
