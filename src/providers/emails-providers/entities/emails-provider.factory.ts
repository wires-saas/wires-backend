import { EmailsProvider } from '../schemas/emails-provider.schema';
import { Injectable } from '@nestjs/common';
import { MailjetEmailsProvider } from './mailjet-emails-provider';
import { SupportedEmailsProvider } from './emails-provider.entities';

// NestJS default dependency injection = singleton
// Factory to create emails provider singletons
// Singleton pattern to avoid creating multiple instances of the same provider
// Avoiding client initialization overhead

@Injectable()
export class EmailsProviderFactory {
  private registry: Map<string, EmailsProvider> = new Map();

  private getProviderId(provider: EmailsProvider): string {
    return `${provider._id.organization}:${provider._id.provider}`;
  }

  private singletonInRegistryRelevant(provider: EmailsProvider): boolean {
    // No singleton in registry
    if (!this.registry.has(this.getProviderId(provider))) {
      return false;
    }

    const instance: EmailsProvider = this.registry.get(
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

  create(provider: EmailsProvider): EmailsProvider {
    if (this.singletonInRegistryRelevant(provider)) {
      return this.registry.get(this.getProviderId(provider));
    }

    let instance: EmailsProvider;
    switch (provider.implementation) {
      case SupportedEmailsProvider.Mailjet:
        instance = new MailjetEmailsProvider(provider);
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
