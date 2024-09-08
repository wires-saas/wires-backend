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
import { UserRoleWithPermissions } from '../../shared/types/authentication.types';
import { Permission } from '../permissions/schemas/permission.schema';
import { Subject } from '../permissions/entities/subject.entity';
import { Organization } from '../../organizations/schemas/organization.schema';
import { UserRole } from '../../users/schemas/user-role.schema';
import { UserNotification } from '../../users/schemas/user-notification.schema';
import { Feed } from '../../feeds/schemas/feed.schema';
import { Article } from '../../articles/schemas/article.schema';
import { FeedRun } from '../../feeds/schemas/feed-run.schema';
import { ScopedSubject } from './casl.utils';
import { Tag } from '../../tags/schemas/tag.schema';

type Subjects =
  | InferSubjects<
      | typeof Organization
      | typeof User
      | typeof UserRole
      | typeof UserNotification
      | typeof Feed
      | typeof FeedRun
      | typeof Article
      | typeof Tag
    >
  | 'all';

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

      // 3 distinct permissions, sorted by priority:

      // 1- Permission with restriction (records with specific field value)
      // ex: can(Action.Read, Article, { organization: userRole.organization });

      // 2- Permission with scope (scope is included in permission name)
      // ex: can(Action.Read, ScopedSubject(FeedRun, userRole.organization));

      // 3- Permission without restriction or scope (no restriction and no scope)
      // ex: can(Action.Read, User);

      // Restricted permission must be preferred over scoped permission
      // As it allows to be also used in database queries

      // Scoped permission exists because we need to restrict access to a specific organization
      // But organization is not a direct field of the record

      // Permission without restriction or scope is the most generic one
      // It can create leaks if not used carefully

      user.roles.forEach((userRole: UserRoleWithPermissions) => {
        userRole.role.permissions.forEach((id) => {
          // forcing string cast here as we did not deep populate permissions

          const permission: Permission = Permission.getPermissionFromId(
            id.toString(),
          );
          switch (permission.subject) {
            case Subject.Organization:
              // For DBs access, we need to use the _id
              can(permission.action, Organization, {
                _id: userRole.organization,
              });
              break;

            case Subject.Billing:
              can(permission.action, Subject.Billing);
              break;

            case Subject.UserRole:
              can(permission.action, UserRole, {
                organization: userRole.organization,
              });
              break;

            case Subject.Tag:
              can(permission.action, Tag, {
                organization: userRole.organization,
              });
              can(permission.action, ScopedSubject(Tag, userRole.organization));
              break;

            case Subject.Feed:
              can(permission.action, Feed, {
                organization: userRole.organization,
              });
              break;

            case Subject.FeedRun:
              can(
                permission.action,
                ScopedSubject(FeedRun, userRole.organization),
              );

              // it may be needed to duplicate permission without scope
              break;
            case Subject.Article:
              can(permission.action, Article, {
                organization: userRole.organization,
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

            default:
              throw new Error('Invalid permission subject');
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

      // User can access and update its own notifications
      can(Action.Read, UserNotification, { user: user._id });
      can(Action.Update, UserNotification, { user: user._id });
    }

    return build({
      // Read https://casl.js.org/v6/en/guide/subject-type-detection#use-classes-as-subject-types for details
      detectSubjectType: (item) => {
        let subjectType: Subjects;
        if (item.email) subjectType = User;
        else if (item.slug) subjectType = Organization;
        else if (item.role) subjectType = UserRole;
        else if (item.scope) subjectType = UserNotification;
        else if (item.urls) subjectType = Feed;
        else if (item.scrapingDurationMs) subjectType = FeedRun;
        else if (item.metadata) subjectType = Article;
        else if (item.ruleset) subjectType = Tag;

        return subjectType as ExtractSubjectType<Subjects>;
      },
    });
  }
}
