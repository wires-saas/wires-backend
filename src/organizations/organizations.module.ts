import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Organization,
  OrganizationSchema,
} from './schemas/organization.schema';
import { CaslAbilityFactory } from '../rbac/casl/casl-ability.factory';
import { UsersService } from '../users/users.service';
import { EncryptService } from '../commons/encrypt.service';
import { HashService } from '../commons/hash.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import {
  UserRoleColl,
  UserRoleSchema,
} from '../users/schemas/user-role.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Organization.name, schema: OrganizationSchema },
      { name: User.name, schema: UserSchema },
      { name: UserRoleColl, schema: UserRoleSchema },
    ]),
  ],
  providers: [
    OrganizationsService,
    CaslAbilityFactory,
    UsersService,
    EncryptService,
    HashService,
  ],
  controllers: [OrganizationsController],
})
export class OrganizationsModule {}
