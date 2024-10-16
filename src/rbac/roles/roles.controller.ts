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
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { RoleDto } from './dto/role.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiExcludeEndpoint,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SuperAdminGuard } from '../../auth/super-admin.guard';
import { OrganizationGuard } from '../../auth/organization.guard';
import { AuthenticatedRequest } from '../../shared/types/authentication.types';
import { ScopedSubject } from '../casl/casl.utils';
import { Role } from './schemas/role.schema';
import { Action } from '../permissions/entities/action.entity';
import { RbacUtils } from '../../shared/utils/rbac.utils';

@ApiTags('Access Control')
@ApiBearerAuth()
@Controller('organizations/:organizationId/roles')
@UseGuards(OrganizationGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiBadRequestResponse({
    description:
      'Role with this name already exists, use PUT endpoint to update it',
  })
  @ApiUnauthorizedResponse({
    description:
      'Cannot create organization role definition, requires custom plan and "Create Role" permission',
  })
  async create(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Body() createRoleDto: RoleDto,
  ): Promise<Role> {
    if (
      req.ability.cannot(Action.Create, ScopedSubject(Role, organizationId))
    ) {
      throw new UnauthorizedException(
        'Cannot create organization role definition',
      );
    }

    const roles = await this.rolesService.findAll(organizationId);
    if (roles.find((role) => role.name === createRoleDto.name)) {
      throw new BadRequestException('Role with this name already exists');
    }

    return this.rolesService.create(organizationId, createRoleDto);
  }

  @Get()
  @ApiUnauthorizedResponse({
    description:
      'Cannot read organization role definitions, requires "Read Role" permission',
  })
  findAll(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
  ): Promise<Role[]> {
    if (req.ability.cannot(Action.Read, ScopedSubject(Role, organizationId))) {
      throw new UnauthorizedException(
        'Cannot read organization role definitions',
      );
    }

    return this.rolesService.findAll(organizationId);
  }

  @Get(':roleId')
  @ApiUnauthorizedResponse({
    description:
      'Cannot read organization role definition, requires "Read Role" permission',
  })
  findOne(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('roleId') roleId: string,
  ) {
    if (req.ability.cannot(Action.Read, ScopedSubject(Role, organizationId))) {
      throw new UnauthorizedException(
        'Cannot read organization role definition',
      );
    }

    return this.rolesService.findOne(organizationId, roleId);
  }

  @Put()
  @ApiBody({ type: [RoleDto], description: 'Array of role definitions' })
  @ApiBadRequestResponse({
    description:
      'Role names must be unique and cannot be interchanged for consistency',
  })
  @ApiUnauthorizedResponse({
    description:
      'Cannot update organization role definitions, requires custom plan and "Update Role" permission',
  })
  async updateAll(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Body() roleDtos: RoleDto[],
  ) {
    if (
      req.ability.cannot(Action.Update, ScopedSubject(Role, organizationId))
    ) {
      throw new UnauthorizedException(
        'Cannot update organization role definitions',
      );
    }

    const roles = await this.rolesService.findAll(organizationId);

    // Ensuring role names are unique
    if (!RbacUtils.uniqueRoleNames(roleDtos)) {
      throw new BadRequestException('Role names must be unique');
    }

    // Preventing a role name from being changed to another role name
    if (
      roleDtos.find((role1) =>
        roleDtos.find((role2) => role1.name === role2.previousName),
      )
    ) {
      throw new BadRequestException(
        'Role names cannot be interchanged for consistency',
      );
    }

    for (const role of roles) {
      const roleDtoWithNameChange = roleDtos.find(
        (dto) => dto.previousName === role.name,
      );

      if (roleDtoWithNameChange) {
        await this.rolesService.updateName(
          organizationId,
          roleDtoWithNameChange,
        );
      } else {
        const roleDto = roleDtos.find((dto) => dto.name === role.name);

        if (roleDto) {
          await this.rolesService.updatePermissions(organizationId, roleDto);
        }
      }
    }

    return this.rolesService.findAll(organizationId);
  }

  @Delete(':roleId')
  @ApiExcludeEndpoint()
  @UseGuards(SuperAdminGuard)
  remove(
    @Param('organizationId') organizationId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.rolesService.remove(organizationId, roleId);
  }
}
