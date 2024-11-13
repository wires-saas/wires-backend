import { forwardRef, Module } from '@nestjs/common';
import { OrganizationCreationService } from './organization-creation.service';
import { OrganizationsModule } from '../../organizations.module';
import { RolesModule } from '../../../rbac/roles/roles.module';
import { UsersModule } from '../../../users/users.module';
import { UserRolesModule } from '../../../users/user-roles/user-roles.module';

@Module({
  imports: [
    forwardRef(() => OrganizationsModule),
    forwardRef(() => UsersModule),
    RolesModule,
    UserRolesModule,
  ],
  providers: [OrganizationCreationService],
  exports: [OrganizationCreationService],
})
export class OrganizationCreationModule {}
