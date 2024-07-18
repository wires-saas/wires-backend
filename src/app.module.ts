import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CaslModule } from './casl/casl.module';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';
import { MongooseModule } from '@nestjs/mongoose';
import { connectionString } from '../vault/mongo.secret.js';
import { OrganizationsModule } from './organizations/organizations.module';

@Module({
  imports: [
    CaslModule,
    UsersModule,
    HealthModule,
    MongooseModule.forRoot(connectionString),
    OrganizationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
