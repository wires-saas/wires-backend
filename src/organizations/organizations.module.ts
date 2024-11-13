import { forwardRef, Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserRolesModule } from '../users/user-roles/user-roles.module';
import { SecurityModule } from '../services/security/security.module';
import { UsersModule } from '../users/users.module';
import { CaslModule } from '../rbac/casl/casl.module';
import { OrganizationPlansController } from './organization-plans.controller';
import { OrganizationPlansService } from './organization-plans.service';
import { OrganizationCreationModule } from './modules/organization-creation/organization-creation.module';
import {
  Organization,
  OrganizationSchema,
} from './schemas/organization.schema';
import {
  OrganizationPlanColl,
  OrganizationPlanSchema,
} from './schemas/organization-plan.schema';
import { RolesModule } from '../rbac/roles/roles.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Organization.name, schema: OrganizationSchema },
      { name: OrganizationPlanColl, schema: OrganizationPlanSchema },
    ]),
    forwardRef(() => UsersModule), // circular dependency
    UserRolesModule,
    SecurityModule,
    CaslModule,
    RolesModule,
    forwardRef(() => OrganizationCreationModule),
  ],
  providers: [OrganizationsService, OrganizationPlansService],
  controllers: [OrganizationsController, OrganizationPlansController],
  exports: [OrganizationsService, OrganizationPlansService],
})
export class OrganizationsModule {}
