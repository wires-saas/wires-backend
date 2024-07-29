import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SignInDto } from './signin.dto';
import { User } from '../users/schemas/user.schema';
import { AuthenticatedRequest } from '../commons/types/authentication.types';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Sign in and get JWT' })
  @ApiOkResponse({
    description: 'Valid access token for 30 days and user data',
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  signIn(
    @Body() signInDto: SignInDto,
  ): Promise<{ access_token: string; user: User }> {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Sign out' })
  @ApiOkResponse({ description: 'User signed out' })
  signOut() {
    return this.authService.signOut();
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  @ApiOperation({
    summary: 'Get profile',
  })
  @ApiOkResponse({ description: 'User data and access token properties' })
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

  @Get('invite/:token')
  @ApiOperation({ summary: 'Check if invite token is valid' })
  @ApiOkResponse({ description: 'Invite token is valid' })
  @ApiNotFoundResponse({ description: 'Invite token is invalid' })
  @ApiUnauthorizedResponse({ description: 'Invite token is expired' })
  async checkInviteToken(@Param('token') token: string): Promise<boolean> {
    return this.authService.checkInviteToken(token);
  }
}
