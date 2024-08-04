import {
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
import { User } from '../users/schemas/user.schema';
import { OrganizationsService } from '../organizations/organizations.service';
import { Organization } from '../organizations/schemas/organization.schema';
import { UserStatus } from '../users/entities/user-status.entity';
import { UserEmailStatus } from '../users/entities/user-email-status.entity';
import { EmailService } from '../services/email/email.service';

@Injectable()
export class AuthService {
  private logger: Logger;

  constructor(
    private usersService: UsersService,
    private organizationsService: OrganizationsService,
    private hashService: HashService,
    private jwtService: JwtService,
    private encryptService: EncryptService,
    private emailService: EmailService,
  ) {
    this.logger = new Logger(AuthService.name);
  }

  async signIn(
    email: string,
    pass: string,
  ): Promise<{ access_token: string; user: User }> {
    this.logger.log(`Sign in attempt for ${email}`);
    const user = await this.usersService.findOneByEmail(email).catch(() => {
      // obfuscate the error message
      throw new UnauthorizedException();
    });

    this.logger.log(`User found: ${user}`);
    if (user.emailStatus === UserEmailStatus.UNCONFIRMED) {
      throw new ForbiddenException('Email not confirmed');
    }

    this.logger.log(`User email status: ${user.emailStatus}`);

    const passwordMatches = await this.hashService
      .compare(pass, user.password)
      .catch((err) => {
        this.logger.error('Error occurred while comparing password', err);
        throw new InternalServerErrorException();
      });

    this.logger.log(`Password matches: ${passwordMatches}`);

    if (!passwordMatches) {
      throw new UnauthorizedException();
    }

    const clearEmail = this.encryptService.decrypt(user.email);

    this.logger.log(`Email decrypted: ${clearEmail}`);

    const payload = { sub: user._id.toString(), email: clearEmail };

    user.roles = user.roles.map((userRole) => ({
      organization: userRole.organization,
      user: userRole.user,
      role: userRole.role._id,
    }));

    this.logger.log(`User roles: ${user.roles}`);

    await this.usersService
      .update(user._id, {
        lastSeenAt: Date.now(),
      })
      .catch(() => {
        this.logger.warn('Could not update lastSeenAt for user #' + user._id);
        // silently ignoring the error
      });

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: user,
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

    // TODO ensure password is strong enough

    const userActivated = await this.usersService.verifyInviteOfUser(
      userWithToken._id,
      password,
    );

    if (userActivated) return userActivated;
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      const user = await this.usersService.findOneByEmail(email);

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

    // TODO ensure password is strong enough

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
