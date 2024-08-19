import {
  Permission,
  PermissionSchema,
} from '../rbac/permissions/schemas/permission.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { ModelDefinition } from '@nestjs/mongoose/dist/interfaces';
import {
  Organization,
  OrganizationSchema,
} from '../organizations/schemas/organization.schema';
import { Role, RoleSchema } from '../rbac/roles/schemas/role.schema';
import {
  UserRoleColl,
  UserRoleSchema,
} from '../users/schemas/user-role.schema';
import {
  UserNotificationColl,
  UserNotificationSchema,
} from '../users/schemas/user-notification.schema';

const allModels: ModelDefinition[] = [
  { name: User.name, schema: UserSchema },
  { name: Organization.name, schema: OrganizationSchema },
  { name: UserRoleColl, schema: UserRoleSchema },
  { name: UserNotificationColl, schema: UserNotificationSchema },
  { name: Role.name, schema: RoleSchema },
  { name: Permission.name, schema: PermissionSchema },
];

export default allModels;
