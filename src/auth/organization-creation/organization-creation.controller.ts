import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiExcludeController,
  ApiForbiddenResponse,
  ApiGoneResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  OrganizationCreationInviteTokenCheckResult,
  OrganizationCreationService,
} from './organization-creation.service';
import { UsersService } from '../../users/users.service';
import { CreateOrganizationDto } from './create-organization.dto';
import { UserWithPermissions } from '../../users/schemas/user.schema';
import { OrganizationsService } from '../../organizations/organizations.service';
import { UserRolesService } from '../../users/user-roles/user-roles.service';
import { RoleName } from '../../shared/types/authentication.types';
import { OrganizationPlansService } from '../../organizations/organization-plans.service';
import { RolesService } from '../../rbac/roles/roles.service';

@ApiExcludeController()
@Controller('auth/organization-creation-invite')
export class OrganizationCreationController {
  private logger: Logger = new Logger(OrganizationCreationController.name);
  constructor(
    private organizationsService: OrganizationsService,
    private organizationPlansService: OrganizationPlansService,
    private organizationCreationService: OrganizationCreationService,
    private rolesService: RolesService,
    private usersService: UsersService,
    private userRolesService: UserRolesService,
  ) {}

  @Get(':token')
  @ApiOperation({
    summary: 'Check if organization creation invite token is valid',
  })
  @ApiOkResponse({ description: 'Invite token is valid' })
  @ApiGoneResponse({ description: 'Invite token already used' })
  @ApiNotFoundResponse({ description: 'Invite token does not exist' })
  async checkCreateOrganizationInviteToken(
    @Param('token') token: string,
  ): Promise<OrganizationCreationInviteTokenCheckResult> {
    return this.organizationCreationService.checkOrganizationCreationInviteToken(
      token,
    );
  }

  @Post(':token')
  @ApiOperation({ summary: 'Consumes create organization invite token' })
  @ApiOkResponse({ description: 'Invite token is valid' })
  @ApiBadRequestResponse({ description: 'Password is too weak' })
  @ApiGoneResponse({ description: 'Invite token already used' })
  @ApiNotFoundResponse({ description: 'Invite token does not exist' })
  @ApiForbiddenResponse({ description: 'Invite token is expired' })
  async useCreateOrganizationInviteToken(
    @Param('token') token: string,
    @Body() createOrganizationDto: CreateOrganizationDto,
  ): Promise<void> {
    const check =
      await this.organizationCreationService.checkOrganizationCreationInviteToken(
        token,
      );

    const user: UserWithPermissions | undefined = await this.usersService
      .findOneByEmail(check.owner)
      .catch(() => undefined);

    let ownerUserId: string = user?._id;

    if (check.requiresOwnerCreation) {
      if (!createOrganizationDto.userPassword) {
        throw new BadRequestException('User password is required');
      }

      if (!user) {
        this.logger.log('Creating organization owner account');
        const userCreated = await this.usersService.createOwner(
          check.owner,
          createOrganizationDto.userPassword,
        );
        ownerUserId = userCreated._id;
      }
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
    await this.organizationPlansService.updateOrganization(
      token,
      organization._id,
    ); // This will invalidate token (having an org attached to it)

    this.logger.log('Creating basic roles for the organization');
    await this.rolesService.createBasicRolesForNewOrganization(
      organization._id,
    );

    // TODO other entities required for the organization
  }
}
