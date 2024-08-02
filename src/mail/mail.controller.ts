import { Controller, Get, Param, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { SuperAdminGuard } from '../auth/super-admin.guard';
import { I18nContext, I18nService } from 'nestjs-i18n';

// This controller is mainly used for debugging
// Hence why SuperAdminGuard is used
// It allows to preview email templates

@Controller('mail')
@UseGuards(SuperAdminGuard)
export class MailController {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private i18n: I18nService,
  ) {}

  @Get('invitation')
  async getInvitationEmail(@Res() res: Response) {
    const file = 'email-invitation.ejs';

    const user = await this.usersService.findOneByEmail('cross-admin@mail.com');

    const userInvite = this.i18n.t('email.userInvite');
    const footer = this.i18n.t('email.footer');

    const token = user.passwordResetToken;

    const options = {
      appName: this.configService.getOrThrow('appName'),
      theme: this.configService.getOrThrow('theme'),
      ...this.configService.getOrThrow('urls'),

      acceptInviteURL: `${this.configService.getOrThrow('urls.acceptInviteURL')}?token=${encodeURIComponent(token)}`,
      fullName: user.firstName,
      orgName: 'Alphabet Corporation',
      userInvite,
      footer,
    };

    return res.render(file, options);
  }

  @Post('invitation/:token')
  async validateInvitation(@Param('token') token: string) {}
}
