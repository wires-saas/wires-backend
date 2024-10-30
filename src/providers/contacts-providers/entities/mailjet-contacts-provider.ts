import { ContactsProvider } from '../schemas/contacts-provider.schema';

import { Client, LibraryResponse, Contact } from 'node-mailjet';

export class MailjetContactsProvider extends ContactsProvider {
  private client: any;
  private seed: number;

  constructor(partial: Partial<ContactsProvider>) {
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
  }

  async getContactsCount(): Promise<number> {
    const queryParams: Contact.GetContactQueryParams = {
      countOnly: true,
    };

    return this.client
      .get('contact', { version: 'v3' })
      .request({}, queryParams)
      .then((response: LibraryResponse<Contact.GetContactResponse>) => {
        return response.body.Total;
      });
  }

  async getSenderDomains(): Promise<any[]> {
    return this.client
      .get('sender', { version: 'v3' })
      .request()
      .then((response) => {
        return response.body['Data'];
      });
  }
}
