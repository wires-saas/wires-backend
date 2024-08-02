import { Injectable } from '@nestjs/common';
import { MailDataRequired } from '@sendgrid/mail';
import { SendGridClient } from './sendgrid-client';

@Injectable()
export class EmailService {
  constructor(private readonly sendGridClient: SendGridClient) {}

  async sendTestEmail(
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

  async sendEmailWithTemplate(recipient: string, body: string): Promise<void> {
    const mail: MailDataRequired = {
      to: recipient,
      cc: 'debug@wires.fr',
      from: 'team@wires.fr', // Approved sender ID in Sendgrid
      templateId: 'Sendgrid_template_ID', //Retrieve from config service or environment variable
      dynamicTemplateData: { body, subject: 'Subject of Email' }, //The data to be used in the template
    };
    await this.sendGridClient.send(mail);
  }
}
