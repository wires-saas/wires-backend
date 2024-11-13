import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserRolesModule } from './user-roles/user-roles.module';
import { CaslAbilityFactory } from '../rbac/casl/casl-ability.factory';
import { EmailModule } from '../services/email/email.module';
import { SecurityModule } from '../services/security/security.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { UserNotificationsModule } from './user-notifications/user-notifications.module';
import { UserAvatarsModule } from './user-avatars/user-avatars.module';
import { UserRoleColl, UserRoleSchema } from './schemas/user-role.schema';
import {
  UserNotificationColl,
  UserNotificationSchema,
} from './schemas/user-notification.schema';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserRoleColl, schema: UserRoleSchema },
      { name: UserNotificationColl, schema: UserNotificationSchema },
    ]),
    EmailModule,
    SecurityModule,
    forwardRef(() => OrganizationsModule),
    forwardRef(() => UserRolesModule),
    forwardRef(() => UserNotificationsModule),
    forwardRef(() => UserAvatarsModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, CaslAbilityFactory],
  exports: [UsersService, CaslAbilityFactory],
})
export class UsersModule {}
