import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SuperAdminGuard } from '../../auth/super-admin.guard';
import { AuthModule } from '../../auth/auth.module';
import { UserRolesModule } from '../../users/user-roles/user-roles.module';
import allModels from '../../shared/mongoose-models';
import { SecurityModule } from '../../services/security/security.module';
import { UsersModule } from '../../users/users.module';
import { OrganizationsModule } from '../../organizations/organizations.module';

@Module({
  imports: [
    MongooseModule.forFeature(allModels),
    AuthModule,
    SecurityModule,
    UsersModule,
    OrganizationsModule,
    UserRolesModule,
  ],
  controllers: [RolesController],
  providers: [RolesService, SuperAdminGuard],
})
export class RolesModule {}
