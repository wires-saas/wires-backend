import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SuperAdminGuard } from '../../auth/super-admin.guard';
import { AuthModule } from '../../auth/auth.module';

import { UserRolesModule } from '../../users/user-roles/user-roles.module';
import { UsersModule } from '../../users/users.module';
import { SecurityModule } from '../../services/security/security.module';
import allModels from '../../shared/mongoose-models';

@Module({
  imports: [
    MongooseModule.forFeature(allModels),
    AuthModule,
    UsersModule,
    UserRolesModule,
    SecurityModule,
  ],
  controllers: [PermissionsController],
  providers: [PermissionsService, SuperAdminGuard],
})
export class PermissionsModule {}
