import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { User } from '../../users/schemas/user.schema';
import { Action } from '../permissions/entities/action.entity';
import { UserRoleWithPermissions } from '../../commons/types/authentication.types';
import { Permission } from '../permissions/schemas/permission.schema';
import { Subject } from '../permissions/entities/subject.entity';
import { Organization } from '../../organizations/schemas/organization.schema';

type Subjects = InferSubjects<typeof Organization | typeof User> | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { can, cannot, build } = new AbilityBuilder<
      Ability<[Action, Subjects]>
    >(Ability as AbilityClass<AppAbility>);

    if (user.isSuperAdmin) {
      console.log('isSuperAdmin');
      can(Action.Manage, 'all'); // read-write access to everything
    } else {
      // This is a dynamic way to define ABILITIES
      // For that we have the current user, with its roles on organizations (user roles)
      // From those roles we can extract the permissions

      user.roles.forEach((userRole: UserRoleWithPermissions) => {
        userRole.role.permissions.forEach((id) => {
          // forcing string cast here as we did not deep populate permissions

          const permission: Permission = Permission.getPermissionFromId(
            id.toString(),
          );
          console.log(permission.subject);
          switch (permission.subject) {
            case Subject.Organization:
              console.log(
                'adding permission',
                permission.action,
                'to organization',
                userRole.organization,
              );
              can(permission.action, Organization, {
                slug: userRole.organization,
              });
              // {
              //                 slug: userRole.organization,
              //               });
              break;
            case Subject.User:
              console.log('adding permission', permission.action, 'to user');
              can(permission.action, User);
              break;
          }
        });
      });
    }

    return build({
      // Read https://casl.js.org/v6/en/guide/subject-type-detection#use-classes-as-subject-types for details
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
