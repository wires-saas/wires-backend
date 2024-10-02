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
import { Tag, TagSchema } from '../tags/schemas/tag.schema';
import { Gpt, GptSchema } from '../ai/schemas/gpt.schema';
import {
  GptRequestColl,
  GptRequestSchema,
} from '../ai/schemas/gpt-request.schema';
import { Block, BlockSchema } from '../blocks/schemas/block.schema';
import { Folder, FolderSchema } from '../folders/schemas/folder.schema';
import {
  FolderItem,
  FolderItemSchema,
} from '../folders/schemas/folder-item.schema';

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
  { name: Tag.name, schema: TagSchema },
];

export const aiModels: ModelDefinition[] = [
  { name: Gpt.name, schema: GptSchema },
  { name: GptRequestColl, schema: GptRequestSchema },
];

export const studioModels: ModelDefinition[] = [
  { name: Block.name, schema: BlockSchema },
  { name: Folder.name, schema: FolderSchema },
  { name: FolderItem.name, schema: FolderItemSchema },
];

export default allModels;
