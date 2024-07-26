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
import { AuthenticatedRequest } from '../commons/types/authentication.types';
import { CaslAbilityFactory } from '../rbac/casl/casl-ability.factory';
import { Action } from '../rbac/permissions/entities/action.entity';

@ApiTags('Organizations')
@UseGuards(AuthGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create new organization (super admin only)' })
  @ApiOkResponse({ description: 'Organization created' })
  @ApiUnauthorizedResponse({
    description: 'User cannot create new organization',
  })
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createOrganizationDto: CreateOrganizationDto,
  ): Promise<Organization> {
    const ability = this.caslAbilityFactory.createForUser(req.user);
    if (ability.cannot(Action.Manage, 'all')) {
      throw new UnauthorizedException();
    }

    return this.organizationsService.create(createOrganizationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Fetch all organizations accessible by user' })
  @ApiOkResponse({ description: 'All organizations' })
  @ApiUnauthorizedResponse({ description: 'User cannot read any organization' })
  async findAll(@Request() req: AuthenticatedRequest): Promise<Organization[]> {
    const ability = this.caslAbilityFactory.createForUser(req.user);
    if (ability.cannot(Action.Read, Organization)) {
      throw new UnauthorizedException();
    }

    return this.organizationsService.findAll(ability);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fetch one organization by id (slug)' })
  @ApiOkResponse({ description: 'Organization matching id' })
  @ApiNotFoundResponse({ description: 'Organization not found' })
  findOne(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<Organization> {
    const ability = this.caslAbilityFactory.createForUser(req.user);
    if (ability.cannot(Action.Read, Organization)) {
      throw new UnauthorizedException();
    }

    return this.organizationsService.findOne(ability, id);
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
    const ability = this.caslAbilityFactory.createForUser(req.user);
    if (ability.cannot(Action.Update, Organization)) {
      throw new UnauthorizedException();
    }

    return this.organizationsService.update(ability, id, updateOrganizationDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete organization',
  })
  @ApiOkResponse({ description: 'Organization deleted' })
  @ApiNotFoundResponse({ description: 'Organization not found' })
  @ApiUnauthorizedResponse({
    description: 'User cannot delete any organization',
  })
  remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const ability = this.caslAbilityFactory.createForUser(req.user);
    if (ability.cannot(Action.Delete, Organization)) {
      throw new UnauthorizedException();
    }

    return this.organizationsService.remove(ability, id);
  }
}
