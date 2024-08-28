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

@ApiTags('Organizations')
@UseGuards(AuthGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Create new organization (super admin only)' })
  @ApiOkResponse({ description: 'Organization created' })
  @ApiUnauthorizedResponse({
    description: 'User cannot create new organization',
  })
  async create(
    @Body() createOrganizationDto: CreateOrganizationDto,
  ): Promise<Organization> {
    return this.organizationsService.create(createOrganizationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Fetch all organizations accessible by user' })
  @ApiOkResponse({ description: 'All organizations' })
  @ApiUnauthorizedResponse({ description: 'User cannot read any organization' })
  async findAll(@Request() req: AuthenticatedRequest): Promise<Organization[]> {
    if (req.ability.cannot(Action.Read, Organization)) {
      throw new UnauthorizedException();
    }

    return this.organizationsService.findAll(req.ability);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fetch one organization by id (slug)' })
  @ApiOkResponse({ description: 'Organization matching id' })
  @ApiNotFoundResponse({ description: 'Organization not found' })
  async findOne(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<Organization> {
    if (req.ability.cannot(Action.Read, Organization)) {
      throw new UnauthorizedException();
    }

    const organization = await this.organizationsService.findOne(id);

    if (req.ability.cannot(Action.Read, organization)) {
      throw new UnauthorizedException();
    }

    return organization;
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update provided fields of organization',
  })
  @ApiOkResponse({ description: 'Organization updated' })
  @ApiNotFoundResponse({ description: 'Organization not found' })
  @ApiUnauthorizedResponse({
    description: 'User cannot update any organization',
  })
  update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<Organization> {
    if (req.ability.cannot(Action.Update, Organization)) {
      throw new UnauthorizedException();
    }

    return this.organizationsService.update(
      req.ability,
      id,
      updateOrganizationDto,
    );
  }

  @Delete(':id')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({
    summary: 'Delete organization',
  })
  @ApiOkResponse({ description: 'Organization deleted' })
  @ApiNotFoundResponse({ description: 'Organization not found' })
  @ApiUnauthorizedResponse({
    description: 'User cannot delete any organization',
  })
  remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.organizationsService.remove(req.ability, id);
  }
}
