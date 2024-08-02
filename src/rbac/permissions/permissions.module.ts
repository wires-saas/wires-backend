import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Permission, PermissionSchema } from './schemas/permission.schema';
import { SuperAdminGuard } from '../../auth/super-admin.guard';
import { AuthModule } from '../../auth/auth.module';
import { User, UserSchema } from '../../users/schemas/user.schema';
import {
  UserRoleColl,
  UserRoleSchema,
} from '../../users/schemas/user-role.schema';
import { UsersService } from '../../users/users.service';
import { EncryptService } from '../../services/security/encrypt.service';
import { HashService } from '../../services/security/hash.service';
import { UserRolesModule } from '../../users/user-roles/user-roles.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Permission.name, schema: PermissionSchema },

      // For SuperAdminGuard
      { name: User.name, schema: UserSchema },
    ]),
    AuthModule,
    UserRolesModule,
  ],
  controllers: [PermissionsController],
  providers: [
    PermissionsService,
    UsersService,
    EncryptService,
    HashService,
    SuperAdminGuard,
  ],
})
export class PermissionsModule {}
