import { UserWithPermissions } from '../../users/schemas/user.schema';
import { UserRole } from '../../users/schemas/user-role.schema';
import { MongoAbility } from '@casl/ability';
import { Permission } from '../../rbac/permissions/schemas/permission.schema';

export class UserRoleWithPermissions extends UserRole {
  permissions: Permission[];
}

export interface AuthenticatedRequest {
  user: UserWithPermissions;
  jwt: {
    email: string;
    exp: number;
    iat: number;
    sub: string;
  };
  ability: MongoAbility;
}

export enum RoleName {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  GUEST = 'guest',
}
