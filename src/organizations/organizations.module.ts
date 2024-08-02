import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserRolesModule } from '../users/user-roles/user-roles.module';
import allModels from '../shared/mongoose-models';
import { SecurityModule } from '../services/security/security.module';
import { UsersModule } from '../users/users.module';
import { CaslModule } from '../rbac/casl/casl.module';

@Module({
  imports: [
    MongooseModule.forFeature(allModels),
    UsersModule,
    UserRolesModule,
    SecurityModule,
    CaslModule,
  ],
  providers: [OrganizationsService],
  controllers: [OrganizationsController],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
