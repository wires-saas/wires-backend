import { Permission } from '../../permissions/schemas/permission.schema';

export const ManagerRolePermissions = [
  'read_organization',
  'read_role',
  'manage_user',
  'read_userRole',
  'update_feed',
  'read_feed',
  'create_feed',
  'create_feedRun',
  'read_feedRun',
  'create_article',
  'read_article',
  'update_article',
  'delete_article',
  'manage_tag',
  'read_gpt',
  'create_gptRequest',
  'manage_block',
  'manage_folder',
  'read_contactsProvider',
  'read_emailsProvider',
].map((permission) => Permission.getPermissionFromId(permission));
