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
import { Feed, FeedSchema } from '../feeds/schemas/feed.schema';
import { FeedRunColl, FeedRunSchema } from '../feeds/schemas/feed-run.schema';
import { Article, ArticleSchema } from '../articles/schemas/article.schema';

const allModels: ModelDefinition[] = [
  { name: User.name, schema: UserSchema },
  { name: Organization.name, schema: OrganizationSchema },
  { name: UserRoleColl, schema: UserRoleSchema },
  { name: UserNotificationColl, schema: UserNotificationSchema },
  { name: Role.name, schema: RoleSchema },
  { name: Permission.name, schema: PermissionSchema },
];

export const contentModels: ModelDefinition[] = [
  { name: Article.name, schema: ArticleSchema },
  { name: Feed.name, schema: FeedSchema },
  { name: FeedRunColl, schema: FeedRunSchema },
];

export default allModels;
