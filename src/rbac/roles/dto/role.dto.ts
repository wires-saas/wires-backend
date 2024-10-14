import { Permission } from '../../permissions/schemas/permission.schema';
import { RoleName } from '../../../shared/types/authentication.types';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RoleDto {
  @IsString()
  @IsOptional()
  previousName?: RoleName;

  @IsString()
  @IsNotEmpty()
  name: RoleName;

  @IsArray()
  @IsNotEmpty()
  permissions: Permission[];
}
