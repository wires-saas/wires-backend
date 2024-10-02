import { Injectable, Logger } from '@nestjs/common';
import * as Sendgrid from '@sendgrid/mail';
import { config as readEnvFile } from 'dotenv';
import { MailDataRequired } from '@sendgrid/mail';

@Injectable()
export class SendGridClient {
  private logger: Logger = new Logger(SendGridClient.name);
  constructor() {
    readEnvFile();
    const sendgridApiKey = process.env.SENDGRID_API_KEY;
    Sendgrid.setApiKey(sendgridApiKey);
  }

  async send(mail: MailDataRequired): Promise<void> {
    try {
      await Sendgrid.send(mail);
      this.logger.log(`Email successfully dispatched to ${mail.to as string}`);
    } catch (error) {
      //You can do more with the error
      this.logger.error('Error while sending email', error);
      throw error;
    }
  }
}
