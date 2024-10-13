import {
  RoleName,
  UserRoleWithPermissions,
} from '../types/authentication.types';
import { OrganizationPlan } from '../../organizations/schemas/organization-plan.schema';
import { Permission } from '../../rbac/permissions/schemas/permission.schema';
import { Action } from '../../rbac/permissions/entities/action.entity';

export class RbacUtils {
  static isUserGreaterThan(
    user: UserRoleWithPermissions[],
    targetUser: UserRoleWithPermissions[],
    organization: string,
  ): boolean {
    const roleNameOfUser = user.find(
      (role) => role.organization === organization,
    )?.role as RoleName;

    const roleNameOfTargetUser = targetUser.find(
      (role) => role.organization === organization,
    )?.role as RoleName;

    const roleToInt = (role: RoleName) => {
      switch (role) {
        case RoleName.ADMIN:
          return 3;
        case RoleName.MANAGER:
          return 2;
        case RoleName.USER:
          return 1;
        case RoleName.GUEST:
          return 0;
        default:
          return 0;
      }
    };

    return roleToInt(roleNameOfUser) > roleToInt(roleNameOfTargetUser);
  }

  static restrictPermissionsWithOrganizationPlan(
    permissions: Permission[],
    organizationPlan?: OrganizationPlan,
  ): Permission[] {
    if (!organizationPlan) return permissions;

    return permissions.filter((permission) => {
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
}
