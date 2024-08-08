import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from './schemas/user.schema';
import { CaslAbilityFactory } from '../rbac/casl/casl-ability.factory';
import { Action } from '../rbac/permissions/entities/action.entity';
import { AuthenticatedRequest } from '../shared/types/authentication.types';
import { AuthGuard } from '../auth/auth.guard';
import { Organization } from '../organizations/schemas/organization.schema';
import { RbacUtils } from '../shared/utils/rbac.utils';
import { accessibleFieldsBy } from '@casl/mongoose';
import { EmailService } from '../services/email/email.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { UserEmailStatus } from './entities/user-email-status.entity';
import { EncryptService } from '../services/security/encrypt.service';

@ApiTags('Users')
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  private logger: Logger;
  constructor(
    private usersService: UsersService,
    private organizationsService: OrganizationsService,
    private emailService: EmailService,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {
    this.logger = new Logger(UsersController.name);
  }

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

    const organization = await this.organizationsService.findOne(
      createUserDto.organization,
    );

    if (!organization) {
      throw new BadRequestException('Organization not found');
    }

    const userCreated: User = await this.usersService.create(createUserDto);
    this.logger.log('New user created with id #' + userCreated._id);

    if (userCreated)
      await this.emailService.sendUserInviteEmail(
        userCreated,
        organization,
        EncryptService.TOKEN_EXPIRATION_DAYS,
      );

    return userCreated;
  }

  @Post(':userId/invite')
  @ApiOperation({ summary: 'Resend invite to user' })
  @ApiOkResponse({ description: 'User invite resent' })
  @ApiUnauthorizedResponse({ description: 'Cannot invite user' })
  @ApiForbiddenResponse({ description: 'User already validated' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async resendInvite(
    @Request() req: AuthenticatedRequest,
    @Param('userId') userId: string,
  ): Promise<void> {
    const ability = this.caslAbilityFactory.createForUser(req.user);
    if (ability.cannot(Action.Update, User)) {
      throw new UnauthorizedException('Cannot invite user');
    }

    const user = await this.usersService.findOne(userId, true);

    if (user.emailStatus !== UserEmailStatus.UNCONFIRMED) {
      throw new ForbiddenException('User already validated');
    }

    // Extend token expiration
    await this.usersService.update(userId, {
      inviteTokenExpiresAt:
        Date.now() + EncryptService.TOKEN_EXPIRATION_DAYS * 24 * 60 * 60 * 1000,
    });

    const organizationSlug = user.organizations[0];
    const organization =
      await this.organizationsService.findOne(organizationSlug);

    await this.emailService.sendUserInviteEmail(
      user,
      organization,
      EncryptService.TOKEN_EXPIRATION_DAYS,
    );
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

    // FIXME only return roles of users in the organizations the current user can manage

    if (organizations) {
      return this.usersService.findAll(ability, organizations.split(','));
    }

    return this.usersService.findAll(ability); // filter here users that the user can read organization from ?
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
  @ApiOperation({ summary: 'Update user information' })
  @ApiOkResponse({ description: 'User updated' })
  @ApiUnauthorizedResponse({ description: 'Cannot update target user' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const ability = this.caslAbilityFactory.createForUser(req.user);
    if (ability.cannot(Action.Update, User)) {
      throw new UnauthorizedException('Cannot update other users');
    }

    const target: User = await this.usersService.findOne(id, true);

    if (ability.cannot(Action.Update, target)) {
      throw new UnauthorizedException('Cannot update target user');
    }

    const fieldsToKeep = accessibleFieldsBy(ability, Action.Update).of(target);

    const safeUpdateUserDto = {};
    for (const field of fieldsToKeep) {
      if (updateUserDto[field] !== undefined)
        safeUpdateUserDto[field] = updateUserDto[field];
    }

    return this.usersService.update(id, safeUpdateUserDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remove user roles from organization, delete user if no roles',
  })
  @ApiOkResponse({ description: 'User excluded from organization' })
  @ApiUnauthorizedResponse({ description: 'Cannot delete other users' })
  @ApiNotFoundResponse({ description: 'User not found' })
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
      throw new UnauthorizedException('Cannot delete other users');
    }

    if (ability.cannot(Action.Update, Organization, organization)) {
      throw new UnauthorizedException(
        'Cannot delete users from this organization',
      );
    }

    if (ability.cannot(Action.Manage, Organization, organization)) {
      const target = await this.usersService.findOne(id, true);

      if (
        RbacUtils.isUserGreaterThan(target.roles, req.user.roles, organization)
      ) {
        throw new UnauthorizedException(
          'Cannot delete other users with same or higher roles',
        );
      }
    }

    return this.usersService.remove(id, organization);
  }
}
