import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
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

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private organizationsService: OrganizationsService,
    private hashService: HashService,
    private jwtService: JwtService,
    private encryptService: EncryptService,
  ) {}

  async signIn(
    email: string,
    pass: string,
  ): Promise<{ access_token: string; user: User }> {
    const user = await this.usersService.findOneByEmail(email).catch(() => {
      // obfuscate the error message
      throw new UnauthorizedException();
    });
    const passwordMatches = await this.hashService.compare(pass, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException();
    }

    const clearEmail = this.encryptService.decrypt(user.email);

    const payload = { sub: user._id.toString(), email: clearEmail };

    user.roles = user.roles.map((userRole) => ({
      organization: userRole.organization,
      user: userRole.user,
      role: userRole.role._id,
    }));

    await this.usersService
      .update(user._id, {
        lastSeenAt: Date.now(),
      })
      .catch(() => {
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
    const userWithToken = await this.usersService.findOneByPasswordToken(token);

    if (!userWithToken) {
      throw new NotFoundException('Token not found');
    }

    if (userWithToken.passwordResetTokenExpiresAt < Date.now())
      throw new UnauthorizedException();

    if (!userWithToken?.organizations?.length) {
      throw new InternalServerErrorException(
        'User has no organization assigned',
      );
    }

    if (userWithToken.status !== UserStatus.PENDING) {
      throw new InternalServerErrorException(
        'User has already accepted invite',
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
    const userWithToken = await this.usersService.findOneByPasswordToken(token);

    if (!userWithToken) {
      throw new NotFoundException('Token not found');
    }

    if (userWithToken.passwordResetTokenExpiresAt < Date.now())
      throw new UnauthorizedException();

    if (!userWithToken?.organizations?.length) {
      throw new InternalServerErrorException(
        'User has no organization assigned',
      );
    }

    if (userWithToken.status !== UserStatus.PENDING) {
      throw new InternalServerErrorException(
        'User has already accepted invite',
      );
    }

    // TODO ensure password is strong enough

    const userActivated = await this.usersService.verifyInviteOfUser(
      userWithToken._id,
      password,
    );

    if (userActivated) return userActivated;
  }

  signOut() {
    return;
  }
}
