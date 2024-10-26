import { ContactsProvider } from '../schemas/contacts-provider.schema';
import { SupportedContactsProvider } from './contacts-provider.entities';
import { MailjetContactsProvider } from './mailjet-contacts-provider';
import { Injectable } from '@nestjs/common';

// NestJS default dependency injection = singleton
// Factory to create contacts provider singletons
// Singleton pattern to avoid creating multiple instances of the same provider
// Avoiding client initialization overhead

@Injectable()
export class ContactsProviderFactory {
  private registry: Map<string, ContactsProvider> = new Map();

  private getProviderId(provider: ContactsProvider): string {
    return `${provider._id.organization}:${provider._id.provider}`;
  }

  private singletonInRegistryRelevant(provider: ContactsProvider): boolean {
    // No singleton in registry
    if (!this.registry.has(this.getProviderId(provider))) {
      return false;
    }

    const instance: ContactsProvider = this.registry.get(
      this.getProviderId(provider),
    );

    // Updatable fields have not changed
    return (
      instance.displayName === provider.displayName &&
      instance.description === provider.description &&
      instance.authentication.apiKey === provider.authentication.apiKey &&
      instance.authentication.secretKey === provider.authentication.secretKey
    );
  }

  create(provider: ContactsProvider): ContactsProvider {
    if (this.singletonInRegistryRelevant(provider)) {
      return this.registry.get(this.getProviderId(provider));
    }

    let instance: ContactsProvider;
    switch (provider.implementation) {
      case SupportedContactsProvider.Mailjet:
        instance = new MailjetContactsProvider(provider);
        break;
      default:
        throw new Error(
          'Factory cannot process unknown contacts provider implementation',
        );
    }

    this.registry.set(this.getProviderId(provider), instance);
    return instance;
  }
}
