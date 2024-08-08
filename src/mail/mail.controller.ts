import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { SuperAdminGuard } from '../auth/super-admin.guard';
import { I18nService } from 'nestjs-i18n';
import { EncryptService } from '../services/security/encrypt.service';

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

    const token = user.inviteToken;

    const options = {
      appName: this.configService.getOrThrow('appName'),
      appUrl: this.configService.getOrThrow('appUrl'),
      theme: this.configService.getOrThrow('theme'),
      ...this.configService.getOrThrow('urls'),

      acceptInviteURL: `${this.configService.getOrThrow('urls.acceptInviteURL')}?token=${encodeURIComponent(token)}`,
      fullName: user.firstName,
      orgName: 'Alphabet Corporation',
      expiration: EncryptService.TOKEN_EXPIRATION_DAYS,
      userInvite,
      footer,
    };

    return res.render(file, options);
  }

  @Get('password-reset')
  async getPasswordResetEmail(@Res() res: Response) {
    const file = 'email-password-reset.ejs';

    const user = await this.usersService.findOneByEmail('cross-admin@mail.com');

    const userPasswordReset = this.i18n.t('email.userPasswordReset');
    const footer = this.i18n.t('email.footer');

    const token = user.passwordResetToken;

    const options = {
      appName: this.configService.getOrThrow('appName'),
      appUrl: this.configService.getOrThrow('appUrl'),
      theme: this.configService.getOrThrow('theme'),
      ...this.configService.getOrThrow('urls'),

      acceptInviteURL: `${this.configService.getOrThrow('urls.passwordResetURL')}?token=${encodeURIComponent(token)}`,
      fullName: user.firstName,
      orgName: 'Alphabet Corporation',
      expiration: EncryptService.TOKEN_EXPIRATION_DAYS,
      userPasswordReset,
      footer,
    };

    return res.render(file, options);
  }
}
