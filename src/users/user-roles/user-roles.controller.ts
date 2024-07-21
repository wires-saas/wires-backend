import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { UserRolesService } from './user-roles.service';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserRole } from '../schemas/user-role.schema';
import { UserRoleDto } from '../dto/user-role.dto';

@ApiTags('Users (Roles)')
@Controller('users')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiNotFoundResponse({ description: 'User not found' })
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Post(':userId/roles')
  @ApiOperation({ summary: 'Add new roles for user' })
  @ApiOkResponse({ description: 'Roles added' })
  async create(
    @Body() userRoles: UserRoleDto[],
    @Param('userId') userId: string,
  ): Promise<UserRole[]> {
    return this.userRolesService.createOrUpdate(userId, userRoles);
  }

  @Get(':userId/roles')
  @ApiOperation({ summary: 'Get all roles of user' })
  @ApiOkResponse({ description: 'Roles returned' })
  async findAll(@Param('userId') userId: string): Promise<UserRole[]> {
    return this.userRolesService.findAll(userId);
  }

  @Delete(':userId/roles/all')
  @ApiOperation({ summary: 'Remove all roles from user' })
  @ApiOkResponse({ description: 'All roles removed' })
  remove(@Param('userId') userId: string) {
    return this.userRolesService.removeAll(userId);
  }

  @Delete(':userId/roles')
  @ApiOperation({ summary: 'Remove specific role from user' })
  @ApiOkResponse({ description: 'Role removed' })
  removeOne(
    @Body() userRoleToDelete: UserRoleDto,
    @Param('userId') userId: string,
  ) {
    return this.userRolesService.removeOne(userId, userRoleToDelete);
  }
}
