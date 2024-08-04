import { Module } from '@nestjs/common';
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
  ],
  controllers: [AuthController, MailController],
  providers: [AuthService],
})
export class AuthModule {}
