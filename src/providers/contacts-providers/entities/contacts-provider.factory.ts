import { ContactsProvider } from '../schemas/contacts-provider.schema';
import { SupportedContactsProvider } from './contacts-provider.entities';
import { MailjetContactsProvider } from './mailjet-contacts-provider';

export class ContactsProviderFactory {
  static create(provider: ContactsProvider): ContactsProvider {
    switch (provider.implementation) {
      case SupportedContactsProvider.Mailjet:
        return new MailjetContactsProvider(provider);
      default:
        throw new Error(
          'Factory cannot process unknown contacts provider implementation',
        );
    }
  }
}
