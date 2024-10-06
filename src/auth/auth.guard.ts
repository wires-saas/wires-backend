import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UsersService } from '../users/users.service';
import { CaslAbilityFactory } from '../rbac/casl/casl-ability.factory';

@Injectable()
export class AuthGuard implements CanActivate {
  private logger: Logger = new Logger(AuthGuard.name);

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

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
        this.logger.debug('Token expired');
        throw new UnauthorizedException();
      }

      const userFromDatabase = await this.usersService.findOneByEmail(
        payload.email,
      );

      request['user'] = userFromDatabase;
      request['jwt'] = payload;
      request['ability'] =
        this.caslAbilityFactory.createForUser(userFromDatabase);
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  public static extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
