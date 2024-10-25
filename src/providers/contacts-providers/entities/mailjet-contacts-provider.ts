import { ContactsProvider } from '../schemas/contacts-provider.schema';

export class MailjetContactsProvider extends ContactsProvider {
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
    console.log('MailjetContactsProvider created');
  }

  async getContacts(): Promise<any[]> {
    console.log('getContacts');
    return new Promise((res, _) => res([1, 2, 3]));
  }
}
