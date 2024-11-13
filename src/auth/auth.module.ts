import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { config as readEnvFile } from 'dotenv';
import { MailController } from '../mail/mail.controller';
import { UserRolesModule } from '../users/user-roles/user-roles.module';
import allModels from '../shared/mongoose-models';
import { SecurityModule } from '../services/security/security.module';
import { UsersModule } from '../users/users.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { EmailModule } from '../services/email/email.module';
import { OrganizationCreationService } from './organization-creation/organization-creation.service';
import { OrganizationCreationController } from './organization-creation/organization-creation.controller';
import { RolesModule } from '../rbac/roles/roles.module';

readEnvFile();
const jwtSecret = process.env.JWT_SECRET;
@Module({
  imports: [
    MongooseModule.forFeature(allModels),
    JwtModule.register({
      global: true,
      secret: jwtSecret,
      signOptions: { expiresIn: '30d' },
    }),
    UserRolesModule,
    SecurityModule,
    UsersModule,
    OrganizationsModule,
    EmailModule,
    forwardRef(() => RolesModule),
  ],
  controllers: [AuthController, OrganizationCreationController, MailController],
  providers: [AuthService, OrganizationCreationService],
})
export class AuthModule {}
