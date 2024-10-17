import { OrganizationPlan } from '../../organizations/schemas/organization-plan.schema';
import { Permission } from '../../rbac/permissions/schemas/permission.schema';
import { Action } from '../../rbac/permissions/entities/action.entity';

export class RbacUtils {
  static restrictPermissionsWithOrganizationPlan(
    permissions: Permission[],
    organizationPlan?: OrganizationPlan,
  ): Permission[] {
    if (!organizationPlan) return permissions;

    // If user has manage permission, we should expand it to all permissions
    // Else it may be tricky to restrict permissions with organization plan
    // (for example if user has manage permission and organization plan has read permission)
    // (it would require to remove manage permission and add read permission)
    const permissionsExpanded = permissions.reduce((acc, permission) => {
      if (permission.action === Action.Manage) {
        return [
          ...acc,
          {
            action: Action.Create,
            subject: permission.subject,
          },
          {
            action: Action.Read,
            subject: permission.subject,
          },
          {
            action: Action.Update,
            subject: permission.subject,
          },
          {
            action: Action.Delete,
            subject: permission.subject,
          },
        ];
      } else {
        return [...acc, permission];
      }
    }, []);

    return permissionsExpanded.filter((permission) => {
      return organizationPlan.permissions.find((planPermission) => {
        return (
          (planPermission.action === Action.Manage &&
            planPermission.subject === permission.subject) ||
          (planPermission.action === permission.action &&
            planPermission.subject === permission.subject)
        );
      });
    });
  }

  static uniqueRoleNames(roles: { name: string }[]): boolean {
    const names = [];
    for (const role of roles) {
      if (names.includes(role.name)) return false;
      names.push(role.name);
    }

    return true;
  }
}
