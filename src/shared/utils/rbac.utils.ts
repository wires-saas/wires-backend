import {
  RoleName,
  UserRoleWithPermissions,
} from '../types/authentication.types';

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
}
