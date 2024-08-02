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
import { EncryptService } from '../services/security/encrypt.service';
import { HashService } from '../services/security/hash.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { UserRolesModule } from '../users/user-roles/user-roles.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Organization.name, schema: OrganizationSchema },
      { name: User.name, schema: UserSchema },
    ]),
    UserRolesModule,
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
