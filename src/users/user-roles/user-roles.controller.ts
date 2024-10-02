import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UnauthorizedException,
  Request,
  UseGuards,
  Logger,
} from '@nestjs/common';
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
import { Action } from '../../rbac/permissions/entities/action.entity';
import { User } from '../schemas/user.schema';
import { AuthenticatedRequest } from '../../shared/types/authentication.types';
import { AuthGuard } from '../../auth/auth.guard';

@ApiTags('Users (Roles)')
@UseGuards(AuthGuard)
@Controller('users')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiNotFoundResponse({ description: 'User not found' })
export class UserRolesController {
  private logger: Logger = new Logger(UserRolesController.name);

  constructor(private readonly userRolesService: UserRolesService) {}

  @Post(':userId/roles')
  @ApiOperation({ summary: 'Add new roles for user' })
  @ApiOkResponse({ description: 'Roles added' })
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() userRoles: UserRoleDto[],
    @Param('userId') userId: string,
  ): Promise<UserRole[]> {
    const createdUserRoles: UserRole[] = userRoles.map(
      (dto) =>
        new UserRole({
          user: userId,
          organization: dto.organization,
          role: dto.role,
        }),
    );

    if (
      createdUserRoles.find((userRole) =>
        req.ability.cannot(Action.Create, userRole),
      )
    ) {
      throw new UnauthorizedException('Cannot update user roles');
    }

    const existingRoles = await this.userRolesService.findAllNoPopulate(userId); // TODO filter by ability ?

    // Avoiding duplicates
    const userRolesRelevant = userRoles.filter((userRole) => {
      return !existingRoles.some(
        (existingRole) =>
          existingRole.organization === userRole.organization &&
          existingRole.role === userRole.role,
      );
    });

    return this.userRolesService
      .createOrUpdate(userId, userRolesRelevant)
      .then((userRoles) => {
        this.logger.log(`User roles updated for user ${userId}`);

        userRoles.forEach(async (userRole) => {
          // Considering user roles mutually exclusive
          // One user cannot have two roles on the same organization
          // Hence why we remove the existing role if it exists
          const roleObsolete = existingRoles.find(
            (existingRole) =>
              existingRole.organization === userRole.organization,
          );

          if (roleObsolete) {
            this.logger.debug(
              `Removing obsolete role "${roleObsolete.role}" on organization "${roleObsolete.organization}"`,
            );

            await this.userRolesService.removeOneById(roleObsolete._id);
          }
        });

        return userRoles;
      });
  }

  @Get(':userId/roles')
  @ApiOperation({ summary: 'Get all roles of user' })
  @ApiOkResponse({ description: 'Roles returned' })
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Param('userId') userId: string,
  ): Promise<UserRole[]> {
    if (req.ability.cannot(Action.Read, User)) {
      throw new UnauthorizedException('Cannot read users');
    }

    if (req.ability.cannot(Action.Read, UserRole)) {
      throw new UnauthorizedException('Cannot read user roles');
    }

    return this.userRolesService.findAll(userId); // TODO filter by ability ?
  }

  @Delete(':userId/roles/all')
  @ApiOperation({ summary: 'Remove all roles from user' })
  @ApiOkResponse({ description: 'All roles removed' })
  remove(
    @Request() req: AuthenticatedRequest,
    @Param('userId') userId: string,
  ) {
    if (req.ability.cannot(Action.Delete, UserRole)) {
      throw new UnauthorizedException('Cannot delete user roles');
    }

    // TODO filter by ability / remove only roles that can be deleted

    return this.userRolesService.removeAll(userId);
  }

  @Delete(':userId/roles')
  @ApiOperation({ summary: 'Remove specific role from user' })
  @ApiOkResponse({ description: 'Role removed' })
  removeOne(
    @Request() req: AuthenticatedRequest,
    @Body() userRoleToDelete: UserRoleDto,
    @Param('userId') userId: string,
  ) {
    if (req.ability.cannot(Action.Delete, UserRole)) {
      throw new UnauthorizedException('Cannot delete user role');
    }

    // TODO filter by ability / 401 if not allowed to delete this role

    return this.userRolesService.removeOne(userId, userRoleToDelete);
  }
}
