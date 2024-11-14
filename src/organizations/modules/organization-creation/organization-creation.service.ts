import {
  BadRequestException,
  GoneException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { OrganizationPlan } from '../../schemas/organization-plan.schema';
import { UserWithPermissions } from '../../../users/schemas/user.schema';
import { UsersService } from '../../../users/users.service';
import { OrganizationPlansService } from '../../organization-plans.service';
import { PlanType } from '../../entities/plan-type.entity';
import { OrganizationsService } from '../../organizations.service';
import { RolesService } from '../../../rbac/roles/roles.service';
import { UserRolesService } from '../../../users/user-roles/user-roles.service';
import { RoleName } from '../../../shared/types/authentication.types';
import { CreateOrganizationWithTokenDto } from '../../../auth/organization-creation/create-organization-with-token.dto';

export interface OrganizationCreationInviteTokenCheckResult {
  plan: PlanType;
  requiresOwnerCreation: boolean;
  owner: string;
}

// Meta service for organization creation

// Allow to check organization creation invite token (provided by email)
// And create organization + resources required to use created organization

@Injectable()
export class OrganizationCreationService {
  private logger = new Logger(OrganizationCreationService.name);

  constructor(
    private organizationsService: OrganizationsService,
    private organizationPlansService: OrganizationPlansService,
    private rolesService: RolesService,
    private usersService: UsersService,
    private userRolesService: UserRolesService,
  ) {}

  async checkOrganizationCreationInviteToken(
    token: string,
  ): Promise<OrganizationCreationInviteTokenCheckResult> {
    const organizationPlan: OrganizationPlan =
      await this.organizationPlansService.findOneByToken(token);

    if (!organizationPlan) {
      throw new NotFoundException('Token not found');
    }

    if (organizationPlan.organization) {
      throw new GoneException('Organization already created with token');
    }

    const matchingUser: UserWithPermissions | undefined =
      await this.usersService
        .findOneByEmail(organizationPlan.customerEmail)
        .catch(() => undefined);

    return {
      plan: organizationPlan.type,
      requiresOwnerCreation: !matchingUser,
      owner: organizationPlan.customerEmail,
    };
  }

  async createOrganizationAndResourcesWithToken(
    token: string,
    createOrganizationDto: CreateOrganizationWithTokenDto,
  ): Promise<void> {
    const check = await this.checkOrganizationCreationInviteToken(token);

    const user: UserWithPermissions | undefined = await this.usersService
      .findOneByEmail(check.owner)
      .catch(() => undefined);

    let ownerUserId: string = user?._id;

    if (check.requiresOwnerCreation && !user) {
      if (!createOrganizationDto.userPassword) {
        throw new BadRequestException('User password is required');
      }

      this.logger.log('Creating organization owner account');
      const userCreated = await this.usersService.createOwner(
        check.owner,
        createOrganizationDto.userPassword,
      );
      ownerUserId = userCreated._id;
    }

    this.logger.log('Creating organization');
    const organization = await this.organizationsService.create({
      name: createOrganizationDto.organizationName,
      slug: createOrganizationDto.organizationSlug,
    });

    this.logger.log('Setting owner as admin of the organization');
    await this.userRolesService.createOrUpdate(ownerUserId, [
      {
        organization: organization._id,
        role: RoleName.ADMIN,
      },
    ]);

    this.logger.log('Setting plan for the organization');
    await this.organizationPlansService.updateOrganizationWithCreationToken(
      token,
      organization._id,
    ); // This will invalidate token (having an org attached to it)

    this.logger.log('Creating basic roles for the organization');
    await this.rolesService.createBasicRolesForNewOrganization(
      organization._id,
    );

    // Missing :
    // - default folders
    // - default example blocks
    // - upload default avatar in S3 (+ create folder)
  }
}
