import { forwardRef, Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SuperAdminGuard } from '../../auth/super-admin.guard';
import { UserRolesModule } from '../../users/user-roles/user-roles.module';
import { SecurityModule } from '../../services/security/security.module';
import { UsersModule } from '../../users/users.module';
import { OrganizationsModule } from '../../organizations/organizations.module';
import { Role, RoleSchema } from './schemas/role.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
    SecurityModule,
    forwardRef(() => UsersModule),
    forwardRef(() => OrganizationsModule),
    UserRolesModule,
  ],
  controllers: [RolesController],
  providers: [RolesService, SuperAdminGuard],
  exports: [RolesService],
})
export class RolesModule {}
