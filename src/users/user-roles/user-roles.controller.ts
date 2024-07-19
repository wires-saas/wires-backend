import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { UserRolesService } from './user-roles.service';
import { CreateOrUpdateUserRoleDto } from '../dto/create-or-update-user-role.dto';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserRole } from '../schemas/user-role.schema';

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
    @Body() userRoles: CreateOrUpdateUserRoleDto[],
    @Param('userId') userId: string,
  ): Promise<UserRole[]> {
    return this.userRolesService.createOrUpdate(userId, userRoles);
  }

  @Put(':userId/roles')
  @ApiOperation({ summary: 'Set all roles of user' })
  @ApiOkResponse({ description: 'All roles set' })
  async setAll(
    @Body() userRoles: CreateOrUpdateUserRoleDto[],
    @Param('userId') userId: string,
  ): Promise<void> {
    return this.userRolesService.setAll(userId, userRoles);
  }

  @Get(':userId/roles')
  @ApiOperation({ summary: 'Get all roles of user' })
  @ApiOkResponse({ description: 'Roles returned' })
  async findAll(@Param('userId') userId: string): Promise<UserRole[]> {
    return this.userRolesService.findAll(userId);
  }

  @Delete(':userId/roles')
  @ApiOperation({ summary: 'Remove all roles from user' })
  @ApiOkResponse({ description: 'All roles removed' })
  remove(@Param('userId') userId: string) {
    return this.userRolesService.removeAll(userId);
  }

  @Delete(':userId/roles/:roleId')
  @ApiOperation({ summary: 'Remove specific role from user' })
  @ApiOkResponse({ description: 'Role removed' })
  removeOne(@Param('userId') userId: string, @Param('roleId') roleId: string) {
    return this.userRolesService.remove(userId, roleId);
  }
}
