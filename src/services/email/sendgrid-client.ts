import { Injectable, Logger } from '@nestjs/common';
import * as Sendgrid from '@sendgrid/mail';
import { config as readEnvFile } from 'dotenv';
import { MailDataRequired } from '@sendgrid/mail';

@Injectable()
export class SendGridClient {
  private logger: Logger;
  constructor() {
    //Initialize the logger. This is done for simplicity. You can use a logger service instead
    this.logger = new Logger(SendGridClient.name);
    //Get the API key from config service or environment variable

    readEnvFile();
    const sendgridApiKey = process.env.SENDGRID_API_KEY;
    console.log(sendgridApiKey);
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
