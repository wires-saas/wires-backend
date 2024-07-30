import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { EncryptService } from '../commons/encrypt.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';
import { HashService } from '../commons/hash.service';
import { JwtModule } from '@nestjs/jwt';
import { config as readEnvFile } from 'dotenv';
import {
  UserRoleColl,
  UserRoleSchema,
} from '../users/schemas/user-role.schema';
import { MailService } from './mail/mail.service';
import { MailController } from './mail/mail.controller';
import { OrganizationsService } from '../organizations/organizations.service';
import {
  Organization,
  OrganizationSchema,
} from '../organizations/schemas/organization.schema';

readEnvFile();
const jwtSecret = process.env.JWT_SECRET;
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserRoleColl, schema: UserRoleSchema },
      { name: Organization.name, schema: OrganizationSchema },
    ]),
    JwtModule.register({
      global: true,
      secret: jwtSecret,
      signOptions: { expiresIn: '30d' },
    }),
  ],
  controllers: [AuthController, MailController],
  providers: [
    AuthService,
    UsersService,
    OrganizationsService,
    EncryptService,
    HashService,
    MailService,
  ],
})
export class AuthModule {}
