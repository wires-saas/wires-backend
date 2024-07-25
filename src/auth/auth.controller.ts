import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { SignInDto } from './signin.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/schemas/user.schema';
import { AuthenticatedRequest } from '../commons/types/authentication.types';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  signOut() {
    return this.authService.signOut();
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Request() req: AuthenticatedRequest): Promise<{
    jwt: {
      email: string;
      exp: number;
      iat: number;
      sub: string;
    };
    user: User;
  }> {
    // For the sake of simplicity, we will "de-populate" the roles
    // As frontend doesn't need the inner permissions of the roles
    req.user.roles = req.user.roles.map((userRole) => ({
      organization: userRole.organization,
      user: userRole.user,
      role: userRole.role._id,
    }));

    return {
      jwt: req.jwt,
      user: req.user,
    };
  }
}
