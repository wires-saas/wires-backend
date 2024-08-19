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

@Module({
  imports: [
    MongooseModule.forFeature(allModels),
    UserRolesModule,
    EmailModule,
    SecurityModule,
    forwardRef(() => OrganizationsModule),
    UserNotificationsModule, // circular dependency
  ],
  controllers: [UsersController],
  providers: [UsersService, CaslAbilityFactory],
  exports: [UsersService],
})
export class UsersModule {}
