import { IsNotEmpty, IsString } from 'class-validator';
import { RoleName } from '../../commons/types/authentication.types';

export class UserRoleDto {
  @IsNotEmpty()
  @IsString()
  role: RoleName;

  @IsNotEmpty()
  @IsString()
  organization: string;
}
