import { Injectable, Logger } from '@nestjs/common';
import { MailDataRequired } from '@sendgrid/mail';
import { SendGridClient } from './sendgrid-client';
import { User } from '../../users/schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import { EncryptService } from '../security/encrypt.service';
import * as ejs from 'ejs';
import { join } from 'path';
import { I18nService } from 'nestjs-i18n';
import { OrganizationsService } from '../../organizations/organizations.service';
import { Organization } from '../../organizations/schemas/organization.schema';

@Injectable()
export class EmailService {
  private logger: Logger;

  constructor(
    private readonly sendGridClient: SendGridClient,
    private configService: ConfigService,
    private encryptService: EncryptService,
    private readonly i18n: I18nService,
  ) {
    this.logger = new Logger(EmailService.name);
  }

  private async sendTestEmail(
    recipient: string,
    body = 'This is a test mail',
  ): Promise<void> {
    const mail: MailDataRequired = {
      to: recipient,
      cc: 'debug@wires.fr',
      from: 'team@wires.fr', //Approved sender ID in Sendgrid
      subject: 'Test email',
      content: [{ type: 'text/plain', value: body }],
    };
    await this.sendGridClient.send(mail);
  }

  private async sendEmail(
    recipient: string,
    subject: string,
    body: string,
  ): Promise<void> {
    const mail: MailDataRequired = {
      to: 'antoine.gautrain@gmail.com', // TODO put recipient
      from: 'team@wires.fr', // Approved sender ID in Sendgrid
      subject: subject,
      content: [
        {
          type: 'text/html',
          value: body,
        },
      ],
    };
    await this.sendGridClient.send(mail);
  }

  async sendUserInviteEmail(
    user: User,
    organization: Organization,
  ): Promise<void> {
    const userEmail = user.email;
    try {
      this.encryptService.decrypt(user.email);
    } catch (e) {
      this.logger.warn(
        'Could not decrypt email for user #' +
          user._id +
          ' considering it as decrypted',
      );
    }

    this.logger.log('User invite email sent to user #' + user._id);

    const token = user.passwordResetToken;

    const userInvite = this.i18n.t('email.userInvite');
    const footer = this.i18n.t('email.footer');

    const options = {
      appName: this.configService.get('appName'),
      theme: this.configService.get('theme'),
      ...this.configService.get('urls'),

      acceptInviteURL: `${this.configService.get('urls.acceptInviteURL')}?token=${encodeURIComponent(token)}`,
      fullName: user.firstName,
      orgName: organization.name,

      userInvite,
      footer,
    };

    const subject = this.i18n.t('email.userInvite.subject', {
      args: { organization: organization.name },
    });

    return ejs.renderFile(
      join(__dirname, '../../../', 'views', 'email-invitation.ejs'),
      options,
      async (err, html) => {
        if (err) {
          return this.logger.error(
            'An error occurred while trying to render email-invitation.ejs',
            err,
          );
        }

        if (html) await this.sendEmail(userEmail, subject, html);
      },
    );
  }

  async sendUserPasswordResetEmail(user: User): Promise<void> {
    const userEmail = user.email;
    try {
      this.encryptService.decrypt(user.email);
    } catch (e) {
      this.logger.warn(
        'Could not decrypt email for user #' +
          user._id +
          ' considering it as decrypted',
      );
    }

    this.logger.log('Password reset email sent to user #' + user._id);

    const token = user.passwordResetToken;

    const userPasswordReset = this.i18n.t('email.userPasswordReset');
    const footer = this.i18n.t('email.footer');

    const options = {
      appName: this.configService.get('appName'),
      theme: this.configService.get('theme'),
      ...this.configService.get('urls'),

      passwordResetURL: `${this.configService.get('urls.passwordResetURL')}?token=${encodeURIComponent(token)}`,
      fullName: user.firstName,
      userPasswordReset,
      footer,
    };

    const subject = this.i18n.t('email.userPasswordReset.subject');

    return ejs.renderFile(
      join(__dirname, '../../../', 'views', 'email-password-reset.ejs'),
      options,
      async (err, html) => {
        if (err) {
          return this.logger.error(
            'An error occurred while trying to render email-password-reset.ejs',
            err,
          );
        }

        if (html) await this.sendEmail(userEmail, subject, html);
      },
    );
  }
}
