import {
  AbilityBuilder,
  createMongoAbility,
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { User } from '../../users/schemas/user.schema';
import { Action } from '../permissions/entities/action.entity';
import { UserRoleWithPermissions } from '../../commons/types/authentication.types';
import { Permission } from '../permissions/schemas/permission.schema';
import { Subject } from '../permissions/entities/subject.entity';
import { Organization } from '../../organizations/schemas/organization.schema';

type Subjects = InferSubjects<typeof Organization | typeof User> | 'all';

@Injectable()
export class CaslAbilityFactory {
  static UpdatableUserFields: Array<keyof User> = [
    'firstName',
    'lastName',
    'street',
    'city',
    'zipCode',
    'country',
  ];

  static ReadableUserFields: Array<keyof User> = [
    'firstName',
    'lastName',
    'street',
    'city',
    'zipCode',
    'country',
    'email',
    'lastSeenAt',
  ];

  createForUser(user: User): MongoAbility {
    const { can, build } = new AbilityBuilder(createMongoAbility);

    if (user.isSuperAdmin) {
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
          switch (permission.subject) {
            case Subject.Organization:
              can(permission.action, Organization, {
                _id: userRole.organization,
              });
              break;
            case Subject.User:
              switch (permission.action) {
                case Action.Update:
                  can(
                    permission.action,
                    User,
                    [...CaslAbilityFactory.UpdatableUserFields],
                    {
                      organizations: { $in: [userRole.organization] },
                    },
                  );
                  break;

                case Action.Manage:
                  can(
                    permission.action,
                    User,
                    [...CaslAbilityFactory.UpdatableUserFields],
                    {
                      organizations: { $in: [userRole.organization] },
                    },
                  );
                  break;

                case Action.Read:
                  can(
                    permission.action,
                    User,
                    [...CaslAbilityFactory.ReadableUserFields],
                    {
                      organizations: { $in: [userRole.organization] },
                    },
                  );
                  break;

                default:
                  can(permission.action, User, {
                    organizations: { $in: [userRole.organization] },
                  });
                  break;
              }

              break;
          }
        });
      });

      // User can update its own data (including email and password)
      can(
        Action.Update,
        User,
        [...CaslAbilityFactory.UpdatableUserFields, 'email', 'password'],
        { _id: user._id },
      );
    }

    return build({
      // Read https://casl.js.org/v6/en/guide/subject-type-detection#use-classes-as-subject-types for details
      detectSubjectType: (item) => {
        let subjectType;
        if (item.email) subjectType = User;
        else if (item.slug) subjectType = Organization;

        return subjectType as ExtractSubjectType<Subjects>;
      },
    });
  }
}
