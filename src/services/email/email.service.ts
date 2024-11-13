import { Injectable, Logger } from '@nestjs/common';
import { MailDataRequired } from '@sendgrid/mail';
import { SendGridClient } from './sendgrid-client';
import { User } from '../../users/schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import { EncryptService } from '../security/encrypt.service';
import * as ejs from 'ejs';
import { join } from 'path';
import { I18nService } from 'nestjs-i18n';
import { Organization } from '../../organizations/schemas/organization.schema';
import { PlanType } from '../../organizations/entities/plan-type.entity';

@Injectable()
export class EmailService {
  private logger: Logger = new Logger(EmailService.name);
  private readonly interceptEmail: boolean = false;

  constructor(
    private readonly sendGridClient: SendGridClient,
    private configService: ConfigService,
    private encryptService: EncryptService,
    private readonly i18n: I18nService,
  ) {
    this.interceptEmail = this.configService.getOrThrow('env') === 'local';
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

    if (this.configService.getOrThrow('enableEmails')) {
      await this.sendGridClient.send(mail);
    } else {
      this.logger.warn('Emails are disabled, not sending email');
    }
  }

  private async sendEmail(
    recipient: string,
    subject: string,
    body: string,
  ): Promise<void> {
    const to = this.interceptEmail
      ? this.configService.get('emailInterceptor')
      : recipient;

    if (this.interceptEmail) {
      this.logger.warn(
        'Email interception enabled, according to process.env.EMAIL_INTERCEPTOR',
      );
    }

    const mail: MailDataRequired = {
      to: to,
      from: 'team@wires.fr', // Approved sender ID in Sendgrid
      subject: subject,
      content: [
        {
          type: 'text/html',
          value: body,
        },
      ],
    };

    if (this.configService.getOrThrow('enableEmails')) {
      await this.sendGridClient.send(mail);
    } else {
      this.logger.warn('Emails are disabled, not sending email');
    }
  }

  async sendUserInviteEmail(
    user: User,
    organization: Organization,
    expiration: number,
  ): Promise<void> {
    this.logger.log('Sending user invite email to user ' + user._id);

    const userEmail = user.email;
    try {
      this.encryptService.decrypt(user.email);
    } catch (e) {
      this.logger.warn(
        'Could not decrypt email for user ' +
          user._id +
          ' considering it as decrypted',
      );
    }

    const token = user.inviteToken;

    const userInvite = this.i18n.t('email.userInvite');
    const footer = this.i18n.t('email.footer');

    const options = {
      appName: this.configService.getOrThrow('appName'),
      appUrl: this.configService.getOrThrow('appUrl'),
      theme: this.configService.getOrThrow('theme'),
      ...this.configService.getOrThrow('urls'),

      acceptInviteURL: `${this.configService.getOrThrow('urls.acceptInviteURL')}?token=${encodeURIComponent(token)}`,
      fullName: user.firstName,
      orgName: organization.name,

      expiration: expiration,
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

        if (html) return await this.sendEmail(userEmail, subject, html);
      },
    );
  }

  async sendUserPasswordResetEmail(
    user: User,
    token: string,
    expiration: number,
  ): Promise<void> {
    this.logger.log('Sending password reset email to user ' + user._id);

    const userEmail = user.email;
    try {
      this.encryptService.decrypt(user.email);
    } catch (e) {
      this.logger.warn(
        'Could not decrypt email for user ' +
          user._id +
          ' considering it as decrypted',
      );
    }

    const userPasswordReset = this.i18n.t('email.userPasswordReset');
    const footer = this.i18n.t('email.footer');

    const options = {
      appName: this.configService.getOrThrow('appName'),
      appUrl: this.configService.getOrThrow('appUrl'),
      theme: this.configService.getOrThrow('theme'),
      ...this.configService.getOrThrow('urls'),

      passwordResetURL: `${this.configService.getOrThrow('urls.passwordResetURL')}?token=${encodeURIComponent(token)}`,
      fullName: user.firstName,
      expiration: expiration,
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

  async sendOrganizationCreationEmail(
    customerId: string,
    customerEmail: string,
    token: string,
    plan: PlanType,
  ): Promise<void> {
    this.logger.log(
      'Sending organization creation email to customer ' + customerId,
    );

    const organizationCreationInvite = this.i18n.t(
      'email.organizationCreationInvite',
    );
    const footer = this.i18n.t('email.footer');

    const planSubscribed = this.i18n.t(`plans.${plan}`);

    const options = {
      appName: this.configService.getOrThrow('appName'),
      appUrl: this.configService.getOrThrow('appUrl'),
      theme: this.configService.getOrThrow('theme'),
      ...this.configService.getOrThrow('urls'),

      createOrganizationInviteURL: `${this.configService.getOrThrow('urls.createOrganizationInviteURL')}?token=${encodeURIComponent(token)}`,

      organizationCreationInvite,

      planSubscribed,

      footer,
    };

    const subject = this.i18n.t('email.organizationCreationInvite.subject');

    return ejs.renderFile(
      join(
        __dirname,
        '../../../',
        'views',
        'email-organization-creation-invite.ejs',
      ),
      options,
      async (err, html) => {
        if (err) {
          return this.logger.error(
            'An error occurred while trying to render email-organization-creation-invite.ejs',
            err,
          );
        }

        if (html) return await this.sendEmail(customerEmail, subject, html);
      },
    );
  }
}
