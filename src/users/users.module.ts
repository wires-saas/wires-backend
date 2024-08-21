import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserRolesModule } from './user-roles/user-roles.module';
import { CaslAbilityFactory } from '../rbac/casl/casl-ability.factory';
import { EmailModule } from '../services/email/email.module';
import { SecurityModule } from '../services/security/security.module';
import allModels from '../shared/mongoose-models';
import { OrganizationsModule } from '../organizations/organizations.module';
import { UserNotificationsModule } from './user-notifications/user-notifications.module';
import { UserAvatarsModule } from './user-avatars/user-avatars.module';

@Module({
  imports: [
    MongooseModule.forFeature(allModels),
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
