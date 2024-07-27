import { User } from '../../users/schemas/user.schema';
import { UserRole } from '../../users/schemas/user-role.schema';
import { Prop } from '@nestjs/mongoose';
import { Role } from '../../rbac/roles/schemas/role.schema';

export type UserId = string;

export class UserRoleWithPermissions extends UserRole {
  @Prop({ required: true, type: Role })
  role: Role;
}

export class UserWithRoles extends User {
  @Prop()
  roles: UserRoleWithPermissions[];
}

export interface AuthenticatedRequest {
  user: User;
  jwt: {
    email: string;
    exp: number;
    iat: number;
    sub: string;
  };
}

export enum RoleName {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  GUEST = 'guest',
}
