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
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from './schemas/user.schema';
import { Action } from '../rbac/permissions/entities/action.entity';
import { AuthenticatedRequest } from '../shared/types/authentication.types';
import { AuthGuard } from '../auth/auth.guard';
import { Organization } from '../organizations/schemas/organization.schema';
import { accessibleFieldsBy } from '@casl/mongoose';
import { EmailService } from '../services/email/email.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { UserEmailStatus } from './entities/user-email-status.entity';
import { EncryptService } from '../services/security/encrypt.service';
import { UserRole } from './schemas/user-role.schema';
import { ScopedSubject } from '../rbac/casl/casl.utils';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  private logger: Logger = new Logger(UsersController.name);
  constructor(
    private usersService: UsersService,
    private organizationsService: OrganizationsService,
    private emailService: EmailService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create new user' })
  @ApiOkResponse({
    description: 'New user invited to validate account by email',
  })
  @ApiBadRequestResponse({ description: 'Organization not found' })
  @ApiUnauthorizedResponse({
    description:
      'Cannot create user, requires "Create User" and "Create User Role" permissions',
  })
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() createUserDto: CreateUserDto,
  ): Promise<User> {
    if (
      req.ability.cannot(Action.Create, User) ||
      req.ability.cannot(Action.Create, UserRole)
    ) {
      throw new UnauthorizedException('Cannot create user');
    }

    const organization = await this.organizationsService.findOne(
      createUserDto.organization,
    );

    if (!organization) {
      throw new BadRequestException('Organization not found');
    }

    if (
      req.ability.cannot(Action.Create, ScopedSubject(User, organization.slug))
    ) {
      throw new UnauthorizedException(
        'Cannot create users for this organization',
      );
    }

    if (
      req.ability.cannot(
        Action.Create,
        ScopedSubject(UserRole, organization.slug),
      )
    ) {
      throw new UnauthorizedException(
        'Cannot create roles for this organization',
      );
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
  @ApiOperation({ summary: 'Resend email invite to user' })
  @ApiOkResponse({ description: 'User email invite resent' })
  @ApiUnauthorizedResponse({
    description: 'Cannot invite user, requires "Update User" permission',
  })
  @ApiForbiddenResponse({ description: 'User already validated' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async resendInvite(
    @Request() req: AuthenticatedRequest,
    @Param('userId') userId: string,
  ): Promise<void> {
    if (req.ability.cannot(Action.Update, User)) {
      throw new UnauthorizedException('Cannot invite user');
    }

    const user: User = await this.usersService.findOne(userId, true);

    if (user.emailStatus !== UserEmailStatus.UNCONFIRMED) {
      throw new ForbiddenException('User already validated');
    }

    // Extend token expiration
    await this.usersService.update(userId, {
      inviteTokenExpiresAt:
        Date.now() + EncryptService.TOKEN_EXPIRATION_DAYS * 24 * 60 * 60 * 1000,
    });

    const organizationSlug = user.organizations[0];
    const organization: Organization =
      await this.organizationsService.findOne(organizationSlug);

    await this.emailService.sendUserInviteEmail(
      user,
      organization,
      EncryptService.TOKEN_EXPIRATION_DAYS,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Fetch all users' })
  @ApiOkResponse({ description: 'All users' })
  @ApiUnauthorizedResponse({
    description: 'Cannot read users, requires "Read User" permission',
  })
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Query('organizations') organizations?: string,
  ): Promise<User[]> {
    if (req.ability.cannot(Action.Read, User)) {
      throw new UnauthorizedException('Cannot read users');
    }

    if (organizations) {
      return this.usersService.findAll(req.ability, organizations.split(','));
    }

    return this.usersService.findAll(req.ability);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Fetch user by ID' })
  @ApiOkResponse({ description: 'User found' })
  @ApiUnauthorizedResponse({
    description: 'Cannot read users, requires "Read User" permission',
  })
  findOne(
    @Request() req: AuthenticatedRequest,
    @Param('userId') userId: string,
  ): Promise<User> {
    if (req.ability.cannot(Action.Read, User)) {
      throw new UnauthorizedException('Cannot read users');
    }

    return this.usersService.findOne(userId, false);
  }

  @Patch(':userId')
  @ApiOperation({ summary: 'Update user information' })
  @ApiOkResponse({ description: 'User updated' })
  @ApiUnauthorizedResponse({
    description: 'Cannot update target user, requires "Update User" permission',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    // Not applying any authorization/field filtering if user can manage all
    if (req.ability.can(Action.Manage, 'all')) {
      return this.usersService.update(userId, updateUserDto);
    }

    if (req.ability.cannot(Action.Update, User)) {
      throw new UnauthorizedException('Cannot update other users');
    }

    const target: User = await this.usersService.findOne(userId, true);

    if (req.ability.cannot(Action.Update, target)) {
      throw new UnauthorizedException('Cannot update target user');
    }

    const fieldsToKeep: string[] = accessibleFieldsBy(
      req.ability,
      Action.Update,
    ).of(target);

    const safeUpdateUserDto = {};
    for (const field of fieldsToKeep) {
      if (updateUserDto[field] !== undefined)
        safeUpdateUserDto[field] = updateUserDto[field];
    }

    return this.usersService.update(userId, safeUpdateUserDto);
  }

  @Delete(':userId')
  @ApiOperation({
    summary: 'Remove user roles from organization, delete user if no roles',
  })
  @ApiOkResponse({ description: 'User excluded from organization' })
  @ApiUnauthorizedResponse({
    description: 'Cannot delete other users, requires "Delete User" permission',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  async remove(
    @Request() req: AuthenticatedRequest,
    @Param('userId') userId: string,
    @Query('organization') organizationId: string,
  ): Promise<User> {
    if (!organizationId) {
      throw new BadRequestException('Organization is required');
    }

    if (
      req.ability.cannot(Action.Delete, ScopedSubject(User, organizationId))
    ) {
      throw new UnauthorizedException('Cannot delete other users');
    }

    return this.usersService.remove(userId, organizationId);
  }
}
