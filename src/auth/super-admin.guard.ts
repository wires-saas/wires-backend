import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/schemas/user.schema';
import { AuthGuard } from './auth.guard';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  private logger: Logger;

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {
    this.logger = new Logger(SuperAdminGuard.name);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = AuthGuard.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      if (payload.expiracy < Date.now()) {
        this.logger.warn('Token expired');
        throw new UnauthorizedException();
      }

      const userFromDatabase: User = await this.usersService.findOneByEmail(
        payload.email,
      );

      if (!userFromDatabase?.isSuperAdmin) {
        this.logger.debug('User is not a super admin');
        throw new UnauthorizedException();
      }

      request['user'] = userFromDatabase;
      request['jwt'] = payload;
    } catch {
      // obfuscate the error message
      throw new NotFoundException();
    }

    return true;
  }
}
