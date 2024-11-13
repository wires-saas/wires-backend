import {
  BadRequestException,
  ForbiddenException,
  GoneException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { HashService } from '../services/security/hash.service';
import { JwtService } from '@nestjs/jwt';
import { EncryptService } from '../services/security/encrypt.service';
import { User, UserWithPermissions } from '../users/schemas/user.schema';
import { OrganizationsService } from '../organizations/organizations.service';
import { Organization } from '../organizations/schemas/organization.schema';
import { UserStatus } from '../users/entities/user-status.entity';
import { UserEmailStatus } from '../users/entities/user-email-status.entity';
import { EmailService } from '../services/email/email.service';
import { PasswordUtils } from '../shared/utils/password.utils';

@Injectable()
export class AuthService {
  private logger: Logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private organizationsService: OrganizationsService,
    private hashService: HashService,
    private jwtService: JwtService,
    private encryptService: EncryptService,
    private emailService: EmailService,
  ) {}

  async signIn(
    email: string,
    pass: string,
  ): Promise<{ access_token: string; user: UserWithPermissions }> {
    const user = await this.usersService.findOneByEmail(email).catch(() => {
      // obfuscate the error message
      throw new UnauthorizedException();
    });

    if (user.emailStatus === UserEmailStatus.UNCONFIRMED) {
      throw new ForbiddenException('Email not confirmed');
    }

    const passwordMatches = await this.hashService
      .compare(pass, user.password)
      .catch((err) => {
        this.logger.error('Error occurred while comparing password', err);
        throw new InternalServerErrorException();
      });

    if (!passwordMatches) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user._id.toString(), email: user.email };

    /*
    user.rolesW = user.roles.map((userRole) => ({
      organization: userRole.organization,
      user: userRole.user,
      role: userRole.role._id,
      permissions: userRole.roleWit,
    })); */

    await this.usersService
      .update(user._id, {
        lastSeenAt: Date.now(),
      })
      .catch(() => {
        this.logger.warn('Could not update lastSeenAt for user ' + user._id);
        // silently ignoring the error
      });

    return {
      access_token: await this.jwtService.signAsync(payload),
      user,
    };
  }

  async checkInviteToken(
    token: string,
  ): Promise<{ organization: string; firstName: string }> {
    const userWithToken: User =
      await this.usersService.findOneByInviteToken(token);

    if (userWithToken.status !== UserStatus.PENDING) {
      throw new GoneException('Token already used');
    }

    if (userWithToken.inviteTokenExpiresAt < Date.now())
      throw new ForbiddenException('Token expired');

    if (!userWithToken?.organizations?.length) {
      throw new InternalServerErrorException(
        'User has no organization assigned',
      );
    }

    const organizationOfUser: Organization =
      await this.organizationsService.findOne(userWithToken.organizations[0]);

    return {
      organization: organizationOfUser.name,
      firstName: userWithToken.firstName,
    };
  }

  async useInviteToken(token: string, password: string): Promise<User> {
    const userWithToken: User =
      await this.usersService.findOneByInviteToken(token);

    if (userWithToken.status !== UserStatus.PENDING) {
      throw new GoneException('Token already used');
    }

    if (userWithToken.inviteTokenExpiresAt < Date.now())
      throw new ForbiddenException('Token expired');

    if (!userWithToken?.organizations?.length) {
      throw new InternalServerErrorException(
        'User has no organization assigned',
      );
    }

    if (!password || !PasswordUtils.STRENGTH_REGEX.test(password)) {
      throw new BadRequestException('Password is too weak');
    }

    const userActivated = await this.usersService.verifyInviteOfUser(
      userWithToken._id,
      password,
    );

    if (userActivated) return userActivated;
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      const user = await this.usersService.findOneByEmail(email);

      if (user.passwordResetTokenExpiresAt) {
        const lastReset =
          user.passwordResetTokenExpiresAt -
          EncryptService.TOKEN_EXPIRATION_TIME;
        if (lastReset > Date.now() - 60 * 60 * 1000 && lastReset < Date.now()) {
          throw new ForbiddenException(
            'Password reset already requested less than 1 hour ago',
          );
        }
      }

      const token = this.encryptService.generateRandomToken();

      await this.usersService.update(user._id, {
        passwordResetToken: token,
        passwordResetTokenExpiresAt:
          Date.now() + EncryptService.TOKEN_EXPIRATION_TIME,
      });

      await this.emailService.sendUserPasswordResetEmail(
        user,
        token,
        EncryptService.TOKEN_EXPIRATION_DAYS,
      );
    } catch (err) {
      this.logger.warn('Password reset request failed', err);
      // failing silently
    }
  }

  async checkPasswordResetToken(token: string): Promise<{ firstName: string }> {
    const userWithToken: User =
      await this.usersService.findOneByPasswordResetToken(token);

    if (userWithToken.passwordResetTokenExpiresAt < Date.now())
      throw new ForbiddenException('Token expired');

    return {
      firstName: userWithToken.firstName,
    };
  }

  async usePasswordResetToken(token: string, password: string): Promise<User> {
    const userWithToken: User =
      await this.usersService.findOneByPasswordResetToken(token);

    if (userWithToken.passwordResetTokenExpiresAt < Date.now())
      throw new ForbiddenException('Token expired');

    if (!password || !PasswordUtils.STRENGTH_REGEX.test(password)) {
      throw new BadRequestException('Password is too weak');
    }

    const userActivated = await this.usersService.resetPasswordOfUser(
      userWithToken._id,
      password,
    );

    if (userActivated) return userActivated;
  }

  signOut() {
    return;
  }
}
