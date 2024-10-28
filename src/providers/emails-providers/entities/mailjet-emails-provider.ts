import { EmailsProvider } from '../schemas/emails-provider.schema';

import { Client, LibraryResponse, Sender } from 'node-mailjet';

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

  async getSenderDomains(): Promise<string[]> {
    return this.client
      .get('sender', { version: 'v3' })
      .request()
      .then((response: LibraryResponse<Sender.GetSenderResponse>) => {
        return response.body['Data'].map((_) => _.Name);
      });
  }
}
