import { Permission } from '../../permissions/schemas/permission.schema';

export const UserRolePermissions = [
  'read_organization',
  'read_role',
  'read_user',
  'read_userRole',
  'read_article',
  'read_feed',
  'read_tag',
  'read_gpt',
  'create_gptRequest',
  'read_block',
  'read_folder',
  'read_contactsProvider',
  'read_emailsProvider',
].map((permission) => Permission.getPermissionFromId(permission));
