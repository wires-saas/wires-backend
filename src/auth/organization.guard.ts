import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CaslAbilityFactory } from '../rbac/casl/casl-ability.factory';
import { AuthGuard } from './auth.guard';
import { OrganizationsService } from '../organizations/organizations.service';

/*
  This guard must be used on routes with :organizationId in the path
  It will check if the user has access to the organization
 */
@Injectable()
export class OrganizationGuard implements CanActivate {
  private logger: Logger = new Logger(OrganizationGuard.name);

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private organizationsService: OrganizationsService,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.params['organizationId']) {
      throw new BadRequestException('Organization ID not provided');
    }

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

      request['organization'] =
        await this.organizationsService.findOneWithAbility(
          request.params['organizationId'],
          request['ability'],
        );
    } catch (err) {
      this.logger.error(err);
      throw new UnauthorizedException();
    }
    return true;
  }
}
