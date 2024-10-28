import { EmailsProvider } from '../schemas/emails-provider.schema';

import { Client } from 'node-mailjet';

export class MailjetEmailsProvider extends EmailsProvider {
  private client: any;
  private seed: number;

  constructor(partial: Partial<EmailsProvider>) {
    super({
      _id: partial._id,
      type: partial.type,
      organization: partial.organization,
      implementation: partial.implementation,
      displayName: partial.displayName,
      description: partial.description,
      authentication: partial.authentication,
    });

    this.seed = Math.random();

    this.client = new Client({
      apiKey: partial.authentication.apiKey,
      apiSecret: partial.authentication.secretKey,
    });

    console.log('MailjetEmailsProvider connected');
  }

  async getSenderDomains(): Promise<any[]> {
    /* return this.client
      .get('sender', { version: 'v3' })
      .request()
      .then((response) => {
        return response.body['Data'];
      }); */

    return new Promise((resolve) => {
      return resolve(['test.com']);
    });
  }
}
