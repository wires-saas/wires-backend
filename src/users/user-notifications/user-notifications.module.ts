import { forwardRef, Module } from '@nestjs/common';
import { UserNotificationsService } from './user-notifications.service';
import { UserNotificationsController } from './user-notifications.controller';
import { MongooseModule } from '@nestjs/mongoose';
import allModels from '../../shared/mongoose-models';
import { SecurityModule } from '../../services/security/security.module';
import { UsersModule } from '../users.module';

@Module({
  imports: [
    MongooseModule.forFeature(allModels),
    SecurityModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [UserNotificationsController],
  providers: [UserNotificationsService],
})
export class UserNotificationsModule {}
