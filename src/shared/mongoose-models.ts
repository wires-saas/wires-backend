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
import { Gpt, GptSchema } from '../ai/schemas/gpt.schema';
import {
  GptRequestColl,
  GptRequestSchema,
} from '../ai/schemas/gpt-request.schema';
import {
  OrganizationPlanColl,
  OrganizationPlanSchema,
} from '../organizations/schemas/organization-plan.schema';

const allModels: ModelDefinition[] = [
  { name: User.name, schema: UserSchema },
  { name: Organization.name, schema: OrganizationSchema },
  { name: OrganizationPlanColl, schema: OrganizationPlanSchema },
  { name: UserRoleColl, schema: UserRoleSchema },
  { name: UserNotificationColl, schema: UserNotificationSchema },
  { name: Role.name, schema: RoleSchema },
  { name: Permission.name, schema: PermissionSchema },
];

export const aiModels: ModelDefinition[] = [
  { name: Gpt.name, schema: GptSchema },
  { name: GptRequestColl, schema: GptRequestSchema },
];

export default allModels;
