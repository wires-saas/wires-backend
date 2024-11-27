import {
  BadRequestException,
  GoneException,
  Injectable,
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
import { BlocksService } from '../../../blocks/blocks.service';
import { ConfigService } from '@nestjs/config';
import { FoldersService } from '../../../folders/folders.service';
import { FolderItemsService } from '../../../folders/folder-items.service';
import { CreateOrganizationDto } from '../../dto/create-organization.dto';

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
  domain: string;

  constructor(
    private blocksService: BlocksService,
    private configService: ConfigService,
    private foldersService: FoldersService,
    private folderItemsService: FolderItemsService,
    private organizationsService: OrganizationsService,
    private organizationPlansService: OrganizationPlansService,
    private rolesService: RolesService,
    private usersService: UsersService,
    private userRolesService: UserRolesService,
  ) {
    this.domain = this.configService.getOrThrow('appUrl');
  }

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

  async createOrganizationResources(
    organizationSlug: string,
    ownerUserId?: string,
  ): Promise<void> {
    if (ownerUserId) {
      this.logger.log('Setting owner as admin of the organization');
      await this.userRolesService.createOrUpdate(ownerUserId, [
        {
          organization: organizationSlug,
          role: RoleName.ADMIN,
        },
      ]);
    }

    this.logger.log('Creating basic roles for the organization');
    await this.rolesService.createBasicRolesForNewOrganization(
      organizationSlug,
    );

    this.logger.log('Creating example blocks for the organization');
    await this.blocksService.createExampleBlocks(organizationSlug, this.domain);

    this.logger.log('Creating default folders for the organization');
    await this.foldersService.createDefaultFolders(organizationSlug);

    this.logger.log(
      'Placing example blocks in default folders for the organization',
    );
    await this.folderItemsService.placeExampleBlocksInDefaultFolders(
      organizationSlug,
    );
  }

  async createOrganizationAndResources(
    createOrganizationDto: CreateOrganizationDto,
  ) {
    this.logger.log('Creating organization');
    const organization = await this.organizationsService.create(
      createOrganizationDto,
    );

    this.logger.log('Setting free plan for the new organization');
    const plan =
      await this.organizationPlansService.createFreePlanForOrganization(
        organization._id,
      );

    const organizationWithPlan = await this.organizationsService.updatePlan(
      organization._id,
      plan._id,
    );

    this.logger.log('Creating organization resources');
    await this.createOrganizationResources(organization._id);

    return organizationWithPlan;
  }

  async createOrganizationAndResourcesWithToken(
    token: string,
    createOrganizationDto: CreateOrganizationWithTokenDto,
  ): Promise<{ ownerEmail: string; organizationName: string }> {
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

    this.logger.log('Setting plan for the organization');
    await this.organizationPlansService.updateOrganizationWithCreationToken(
      token,
      organization._id,
    ); // This will invalidate token (having an org attached to it)

    await this.createOrganizationResources(organization._id, ownerUserId);

    return {
      ownerEmail: ownerUserId,
      organizationName: organization.name,
    };

    // TODO
    // - upload default avatar in S3 (+ init bucket)
  }
}
