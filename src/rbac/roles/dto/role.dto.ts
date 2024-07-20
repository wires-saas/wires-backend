import { Permission } from '../../permissions/schemas/permission.schema';

export class RoleDto {
  name: string;
  permissions: Permission[];
}
