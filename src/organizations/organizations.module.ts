import { forwardRef, Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserRolesModule } from '../users/user-roles/user-roles.module';
import allModels from '../shared/mongoose-models';
import { SecurityModule } from '../services/security/security.module';
import { UsersModule } from '../users/users.module';
import { CaslModule } from '../rbac/casl/casl.module';
import { OrganizationPlansController } from './organization-plans.controller';
import { OrganizationPlansService } from './organization-plans.service';
import { RolesService } from '../rbac/roles/roles.service';

@Module({
  imports: [
    MongooseModule.forFeature(allModels),
    forwardRef(() => UsersModule), // circular dependency
    UserRolesModule,
    SecurityModule,
    CaslModule,
  ],
  providers: [OrganizationsService, OrganizationPlansService, RolesService],
  controllers: [OrganizationsController, OrganizationPlansController],
  exports: [OrganizationsService, OrganizationPlansService],
})
export class OrganizationsModule {}
