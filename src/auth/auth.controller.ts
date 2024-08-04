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
  ApiForbiddenResponse,
  ApiGoneResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SignInDto } from './signin.dto';
import { User } from '../users/schemas/user.schema';
import { AuthenticatedRequest } from '../shared/types/authentication.types';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Sign in' })
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
  @ApiGoneResponse({ description: 'Invite token already used' })
  @ApiNotFoundResponse({ description: 'Invite token does not exist' })
  @ApiForbiddenResponse({ description: 'Invite token is expired' })
  async checkInviteToken(
    @Param('token') token: string,
  ): Promise<{ organization: string; firstName: string }> {
    return this.authService.checkInviteToken(token);
  }

  @Post('invite/:token')
  @ApiOperation({ summary: 'Consumes invite token, setting password' })
  @ApiOkResponse({ description: 'Invite token is valid' })
  @ApiGoneResponse({ description: 'Invite token already used' })
  @ApiNotFoundResponse({ description: 'Invite token does not exist' })
  @ApiForbiddenResponse({ description: 'Invite token is expired' })
  async useInviteToken(
    @Param('token') token: string,
    @Body('password') password: string,
  ): Promise<User> {
    return this.authService.useInviteToken(token, password);
  }

  @Post('password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiOkResponse({ description: 'Password reset email sent' })
  async requestPasswordReset(@Body('email') email: string): Promise<void> {
    return this.authService.requestPasswordReset(email);
  }

  @Get('password/:token')
  @ApiOperation({ summary: 'Check if password reset token is valid' })
  @ApiOkResponse({ description: 'Password reset token is valid' })
  @ApiNotFoundResponse({ description: 'Password reset token is invalid' })
  @ApiForbiddenResponse({ description: 'Password reset token is expired' })
  async checkPasswordResetToken(
    @Param('token') token: string,
  ): Promise<{ firstName: string }> {
    return this.authService.checkPasswordResetToken(token);
  }

  @Post('password/:token')
  @ApiOperation({
    summary: 'Consumes password reset token, setting password',
  })
  @ApiOkResponse({ description: 'Password reset token is valid' })
  @ApiNotFoundResponse({ description: 'Password reset token is invalid' })
  @ApiForbiddenResponse({ description: 'Password reset token is expired' })
  async usePasswordResetToken(
    @Param('token') token: string,
    @Body('password') password: string,
  ): Promise<User> {
    return this.authService.usePasswordResetToken(token, password);
  }
}
