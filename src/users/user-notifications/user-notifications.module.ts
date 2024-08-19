import { Module } from '@nestjs/common';
import { UserNotificationsService } from './user-notifications.service';
import { UserNotificationsController } from './user-notifications.controller';
import { MongooseModule } from '@nestjs/mongoose';
import allModels from '../../shared/mongoose-models';
import { SecurityModule } from '../../services/security/security.module';
import { UsersService } from '../users.service';
import { UserRolesModule } from '../user-roles/user-roles.module';

@Module({
  imports: [
    MongooseModule.forFeature(allModels),
    SecurityModule,
    UserRolesModule,
  ],
  controllers: [UserNotificationsController],
  providers: [UserNotificationsService, UsersService],
})
export class UserNotificationsModule {}
