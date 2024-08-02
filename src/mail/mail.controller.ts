import { Controller, Get, Param, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { SuperAdminGuard } from '../auth/super-admin.guard';

// This controller is mainly used for debugging
// Hence why SuperAdminGuard is used
// It allows to preview email templates

@Controller('mail')
@UseGuards(SuperAdminGuard)
export class MailController {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  @Get('invitation')
  async getInvitationEmail(@Res() res: Response) {
    const file = 'email-invitation.ejs';

    const user = await this.usersService.findOneByEmail('cross-admin@mail.com');

    const token = user.passwordResetToken;

    return res.render(file, {
      appName: this.configService.get('appName'),
      theme: this.configService.get('theme'),
      ...this.configService.get('urls'),

      acceptInviteURL: `${this.configService.get('urls.acceptInviteURL')}?token=${encodeURIComponent(token)}`,
      fullName: user.firstName,
      orgName: 'Alphabet Corporation',
    });
  }

  @Post('invitation/:token')
  async validateInvitation(@Param('token') token: string) {}
}
