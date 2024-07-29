import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UnauthorizedException,
  Request,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from './schemas/user.schema';
import { CaslAbilityFactory } from '../rbac/casl/casl-ability.factory';
import { Action } from '../rbac/permissions/entities/action.entity';
import { AuthenticatedRequest } from '../commons/types/authentication.types';
import { AuthGuard } from '../auth/auth.guard';
import { Organization } from '../organizations/schemas/organization.schema';
import { RbacUtils } from '../commons/utils/rbac.utils';

@ApiTags('Users')
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create new user' })
  @ApiOkResponse({
    description: 'New user invited to validate account',
  })
  @ApiUnauthorizedResponse({ description: 'User cannot create other users' })
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createUserDto: CreateUserDto,
  ): Promise<User> {
    const ability = this.caslAbilityFactory.createForUser(req.user);
    if (ability.cannot(Action.Create, User)) {
      throw new UnauthorizedException();
    }

    return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Query('organizations') organizations?: string,
  ): Promise<User[]> {
    const ability = this.caslAbilityFactory.createForUser(req.user);
    if (ability.cannot(Action.Read, User)) {
      throw new UnauthorizedException();
    }

    // FIXME only return users with roles in the organizations the user can manage

    if (organizations) {
      return this.usersService.findAll(ability, organizations.split(','));
    }

    return this.usersService.findAll(ability);
  }

  @Get(':id')
  findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const ability = this.caslAbilityFactory.createForUser(req.user);
    if (ability.cannot(Action.Read, User)) {
      throw new UnauthorizedException();
    }

    return this.usersService.findOne(id, false);
  }

  @Patch(':id')
  update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const ability = this.caslAbilityFactory.createForUser(req.user);
    if (ability.cannot(Action.Update, User)) {
      throw new UnauthorizedException();
    }

    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Query('organization') organization: string,
  ) {
    if (!organization) {
      throw new BadRequestException('Organization is required');
    }

    const ability = this.caslAbilityFactory.createForUser(req.user);
    if (ability.cannot(Action.Delete, User)) {
      throw new UnauthorizedException('User cannot delete other users');
    }

    if (ability.cannot(Action.Update, Organization, organization)) {
      throw new UnauthorizedException(
        'User cannot delete users from this organization',
      );
    }

    if (ability.cannot(Action.Manage, Organization, organization)) {
      const target = await this.usersService.findOne(id, true);

      if (
        RbacUtils.isUserGreaterThan(target.roles, req.user.roles, organization)
      ) {
        throw new UnauthorizedException(
          'User cannot delete other users with same or higher roles',
        );
      }
    }

    return this.usersService.remove(id, organization);
  }
}
