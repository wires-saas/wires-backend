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
import { ApiTags } from '@nestjs/swagger';
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
  async create(
    @Body() createOrganizationDto: CreateOrganizationDto,
  ): Promise<Organization> {
    return this.organizationsService.create(createOrganizationDto);
  }

  @Get()
  async findAll(@Request() req: AuthenticatedRequest): Promise<Organization[]> {
    const ability = this.caslAbilityFactory.createForUser(req.user);
    if (ability.cannot(Action.Read, Organization)) {
      throw new UnauthorizedException();
    }

    return this.organizationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organizationsService.remove(id);
  }
}
