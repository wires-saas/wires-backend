import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from './schemas/role.schema';
import { SuperAdminGuard } from '../../auth/super-admin.guard';
import { AuthModule } from '../../auth/auth.module';
import { UsersService } from '../../users/users.service';
import { User, UserSchema } from '../../users/schemas/user.schema';
import {
  UserRoleColl,
  UserRoleSchema,
} from '../../users/schemas/user-role.schema';
import { EncryptService } from '../../services/security/encrypt.service';
import { HashService } from '../../services/security/hash.service';
import { UserRolesModule } from '../../users/user-roles/user-roles.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },

      // For SuperAdminGuard
      { name: User.name, schema: UserSchema },
    ]),
    AuthModule,
    UserRolesModule,
  ],
  controllers: [RolesController],
  providers: [
    RolesService,
    UsersService,
    EncryptService,
    HashService,
    SuperAdminGuard,
  ],
})
export class RolesModule {}
