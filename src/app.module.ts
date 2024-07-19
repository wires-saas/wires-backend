import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CaslModule } from './casl/casl.module';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';
import { MongooseModule } from '@nestjs/mongoose';
import { OrganizationsModule } from './organizations/organizations.module';

import { config as readEnvFile } from 'dotenv';
import { AuthModule } from './auth/auth.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
