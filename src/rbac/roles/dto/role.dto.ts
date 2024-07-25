import { Permission } from '../../permissions/schemas/permission.schema';
import { RoleName } from '../../../commons/types/authentication.types';

export class RoleDto {
  name: RoleName;
  permissions: Permission[];
}
