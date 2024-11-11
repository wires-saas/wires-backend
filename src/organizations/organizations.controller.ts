import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { Organization } from './schemas/organization.schema';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AuthenticatedRequest } from '../shared/types/authentication.types';
import { Action } from '../rbac/permissions/entities/action.entity';
import { SuperAdminGuard } from '../auth/super-admin.guard';
import { Gpt } from '../ai/schemas/gpt.schema';
import { ScopedSubject } from '../rbac/casl/casl.utils';
import { OrganizationPlansService } from './organization-plans.service';

@ApiTags('Organizations')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly organizationPlansService: OrganizationPlansService,
  ) {}

  @Post()
  @UseGuards(SuperAdminGuard)
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Create new organization (super admin only)' })
  @ApiOkResponse({ description: 'Organization created' })
  @ApiUnauthorizedResponse({
    description: 'User cannot create new organization',
  })
  async create(
    @Body() createOrganizationDto: CreateOrganizationDto,
  ): Promise<Organization> {
    const organization = await this.organizationsService.create(
      createOrganizationDto,
    );

    // Create free plan for organization
    await this.organizationPlansService.createForOrganization(organization._id);

    return organization;
  }

  @Get()
  @ApiOperation({ summary: 'Fetch all organizations' })
  @ApiOkResponse({ description: 'All organizations' })
  @ApiUnauthorizedResponse({
    description:
      'Cannot read any organization, requires "Read Organization" permission',
  })
  async findAll(@Request() req: AuthenticatedRequest): Promise<Organization[]> {
    if (req.ability.cannot(Action.Read, Organization)) {
      throw new UnauthorizedException('Cannot read organizations');
    }

    return this.organizationsService.findAll(req.ability);
  }

  @Get(':organizationId')
  @ApiOperation({ summary: 'Fetch one organization by ID' })
  @ApiOkResponse({ description: 'Organization matching ID' })
  @ApiUnauthorizedResponse({
    description:
      'Cannot read organization, requires "Read Organization" permission',
  })
  @ApiNotFoundResponse({ description: 'Organization not found' })
  async findOne(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
  ): Promise<Organization> {
    if (
      req.ability.cannot(
        Action.Read,
        ScopedSubject(Organization, organizationId),
      )
    ) {
      throw new UnauthorizedException('Cannot read organization');
    }

    return await this.organizationsService.findOneWithAbility(
      organizationId,
      req.ability,
    );
  }

  @Patch(':organizationId')
  @ApiOperation({
    summary: 'Update provided fields of organization',
  })
  @ApiOkResponse({ description: 'Updated organization' })
  @ApiNotFoundResponse({ description: 'Organization not found' })
  @ApiUnauthorizedResponse({
    description: 'Cannot update any organization or organization GPT',
  })
  update(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<Organization> {
    if (
      req.ability.cannot(
        Action.Update,
        ScopedSubject(Organization, organizationId),
      )
    ) {
      throw new UnauthorizedException('Cannot update organization');
    }

    if (updateOrganizationDto.gpt) {
      if (
        req.ability.cannot(Action.Update, ScopedSubject(Gpt, organizationId))
      ) {
        throw new UnauthorizedException(
          'Cannot update GPT for this organization',
        );
      }
    }

    return this.organizationsService.update(
      req.ability,
      organizationId,
      updateOrganizationDto,
    );
  }

  @Delete(':organizationId')
  @UseGuards(SuperAdminGuard)
  @ApiExcludeEndpoint()
  @ApiOperation({
    summary: 'Delete organization',
  })
  @ApiOkResponse({ description: 'Organization deleted' })
  @ApiNotFoundResponse({ description: 'Organization not found' })
  @ApiUnauthorizedResponse({
    description: 'Cannot delete organization',
  })
  remove(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
  ): Promise<Organization> {
    if (
      req.ability.cannot(
        Action.Delete,
        ScopedSubject(Organization, organizationId),
      )
    ) {
      throw new UnauthorizedException('Cannot delete organization');
    }

    return this.organizationsService.remove(req.ability, organizationId);
  }
}
