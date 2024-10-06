import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { RoleDto } from './dto/role.dto';
import { ApiTags } from '@nestjs/swagger';
import { SuperAdminGuard } from '../../auth/super-admin.guard';
import { OrganizationGuard } from '../../auth/organization.guard';
import { AuthenticatedRequest } from '../../shared/types/authentication.types';

@ApiTags('Access Control')
@Controller('organizations/:organizationId/roles')
@UseGuards(OrganizationGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @UseGuards(SuperAdminGuard)
  create(
    @Param('organizationId') organizationId: string,
    @Body() createRoleDto: RoleDto,
  ) {
    return this.rolesService.create(organizationId, createRoleDto);
  }

  @Get()
  findAll(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
  ) {
    // TODO casl

    return this.rolesService.findAll(organizationId);
  }

  @Get(':roleId')
  @UseGuards(SuperAdminGuard)
  findOne(
    @Param('organizationId') organizationId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.rolesService.findOne(organizationId, roleId);
  }

  @Put(':roleId')
  @UseGuards(SuperAdminGuard)
  update(
    @Param('organizationId') organizationId: string,
    @Param('roleId') roleId: string,
    @Body() roleDto: RoleDto,
  ) {
    return this.rolesService.update(organizationId, roleId, roleDto);
  }

  @Delete(':roleId')
  @UseGuards(SuperAdminGuard)
  remove(
    @Param('organizationId') organizationId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.rolesService.remove(organizationId, roleId);
  }
}
