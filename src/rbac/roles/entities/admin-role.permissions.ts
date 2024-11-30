import { Permission } from '../../permissions/schemas/permission.schema';

export const AdminRolePermissions = [
  'manage_organization',
  'manage_role',
  'manage_user',
  'manage_userRole',
  'manage_feed',
  'manage_article',
  'manage_feedRun',
  'manage_billing',
  'manage_tag',
  'read_gpt',
  'update_gpt',
  'delete_gpt',
  'create_gptRequest',
  'manage_block',
  'manage_template',
  'manage_folder',
  'manage_contactsProvider',
  'manage_emailsProvider',
].map((permission) => Permission.getPermissionFromId(permission));
