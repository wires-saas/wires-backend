import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CaslModule } from './rbac/casl/casl.module';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';
import { MongooseModule } from '@nestjs/mongoose';
import { OrganizationsModule } from './organizations/organizations.module';

import { config as readEnvFile } from 'dotenv';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './rbac/roles/roles.module';
import { PermissionsModule } from './rbac/permissions/permissions.module';
import { ConfigModule } from '@nestjs/config';
import configuration from '../environments/environment.local';

readEnvFile();
const connectionString = process.env.MONGO_URI;

@Module({
  imports: [
    CaslModule,
    UsersModule,
    HealthModule,
    MongooseModule.forRoot(connectionString),
    OrganizationsModule,
    AuthModule,
    RolesModule,
    PermissionsModule,
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
