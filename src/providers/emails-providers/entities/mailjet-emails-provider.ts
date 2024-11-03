import { EmailsProvider } from '../schemas/emails-provider.schema';

import { Client, DNS, LibraryResponse, Sender } from 'node-mailjet';
import { Domain } from '../schemas/domain.schema';
import { DomainStatus } from './emails-provider.entities';

// DMARC
// https://documentation.mailjet.com/hc/en-us/articles/20531905163419-Understanding-DMARC

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

          // Sender.SenderStatus.Active undefined
          const ownershipOk = senderDomain.Status === 'Active';

          const domain: Domain = {
            domain: dns.Domain,
            dkim: dkimOk,
            dkimRecordName: dns.DKIMRecordName,
            dkimRecordValue: dns.DKIMRecordValue,
            spf: spfOk,
            spfRecordName: dns.Domain,
            spfRecordValue: dns.SPFRecordValue,
            ownership: ownershipOk,
            ownershipRecordName: dns.OwnerShipTokenRecordName,
            ownershipRecordValue: dns.OwnerShipToken,

            status:
              dkimOk && spfOk && ownershipOk
                ? DomainStatus.Verified
                : DomainStatus.Pending,
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

  async removeDomain(domain: string): Promise<void> {
    return this.client
      .delete('sender', { version: 'v3' })
      .id(`*@${domain}`)
      .request();
  }

  // Perform DNS checks and alter domain status
  async checkDomain(domain: Domain): Promise<void> {
    if (!domain.ownership) {
      // Check ownership
      const ownershipCheck: boolean = await this.client
        .post('sender', { version: 'v3' })
        .id(`*@${domain.domain}`)
        .action('validate')
        .request()
        .then(
          (response: LibraryResponse<Sender.PostSenderValidateResponse>) => {
            return response.body['ValidationMethod'] !== '';
          },
        );

      domain.ownership = domain.ownership || ownershipCheck;
    }

    // Check DKIM and SPF
    await this.client
      .post('dns', { version: 'v3' })
      .id(domain.domain)
      .action('check')
      .request()
      .then((response: LibraryResponse<DNS.GetDNSResponse>) => {
        const dns: DNS.DNS = response.body['Data'][0];

        domain.dkim = dns.DKIMStatus === 'OK';
        domain.spf = dns.SPFStatus === 'OK';
      });

    // Finally update domain status
    domain.status =
      domain.dkim && domain.spf && domain.ownership
        ? DomainStatus.Verified
        : DomainStatus.Pending;
  }
}
