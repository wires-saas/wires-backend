import { EmailsProvider } from '../schemas/emails-provider.schema';

import { Client, DNS, LibraryResponse, Sender } from 'node-mailjet';
import { Domain } from '../schemas/domain.schema';
import { DomainStatus } from './emails-provider.entities';

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
  }

  async getDomains(): Promise<Domain[]> {
    return this.client
      .get('sender', { version: 'v3' })
      .request()
      .then(async (response: LibraryResponse<Sender.GetSenderResponse>) => {
        const domains: Domain[] = [];

        for (const senderDomain of response.body['Data']) {
          const dns: DNS.DNS = await this.client
            .get('dns', { version: 'v3' })
            .id(senderDomain.DNSID)
            .request()
            .then(
              (response: LibraryResponse<DNS.GetDNSResponse>) =>
                response.body['Data'][0],
            );

          // DNS.DKIMConfigurationCheckStatus.OK undefined
          const dkimOk = dns.DKIMStatus === 'OK';
          // DNS.SPFConfigurationCheckStatus.OK undefined
          const spfOk = dns.SPFStatus === 'OK';

          const domain: Domain = {
            domain: dns.Domain,
            dkim: dkimOk,
            dkimRecordName: dns.DKIMRecordName,
            dkimRecordValue: dns.DKIMRecordValue,
            spf: spfOk,
            spfRecordName: '',
            spfRecordValue: dns.SPFRecordValue,
            ownership: dkimOk || spfOk,
            ownershipRecordName: dns.OwnerShipTokenRecordName,
            ownershipRecordValue: dns.OwnerShipToken,

            status:
              dkimOk && spfOk ? DomainStatus.Verified : DomainStatus.Pending,
          };

          domains.push(domain);
        }

        return domains;
      });
  }

  async addDomain(domain: string): Promise<void> {
    return this.client.post('sender', { version: 'v3' }).request({
      Email: `*@${domain}`,
    });
  }
}
