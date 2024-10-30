import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  Logger,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { CreateEmailsProviderDto } from './dto/create-emails-provider.dto';
import { UpdateEmailsProviderDto } from './dto/update-emails-provider.dto';
import { OrganizationGuard } from '../../auth/organization.guard';
import { EmailsProviderFactory } from './entities/emails-provider.factory';
import {
  CACHE_MANAGER,
  CacheInterceptor,
  CacheTTL,
} from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { EmailsProvider } from './schemas/emails-provider.schema';
import { EmailsProvidersService } from './emails-providers.service';
import { Domain } from './schemas/domain.schema';

@Controller('organizations/:organizationId/providers/emails')
@UseGuards(OrganizationGuard)
export class EmailsProvidersController {
  private logger: Logger = new Logger(EmailsProvidersController.name);

  constructor(
    private readonly emailsProvidersService: EmailsProvidersService,
    private readonly emailsProviderFactory: EmailsProviderFactory,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private async clearCache(organizationId: string, providerId: string) {
    const keys = await this.cacheManager.store.keys(
      `/v1/organizations/${organizationId}/providers/emails/${providerId}*`,
    );

    for (const key of keys) {
      this.logger.debug('Deleting cache key: ' + key);
      await this.cacheManager.del(key);
    }
  }

  @Post()
  async create(
    @Param('organizationId') organizationId: string,
    @Body() createEmailsProviderDto: CreateEmailsProviderDto,
  ): Promise<EmailsProvider> {
    if (createEmailsProviderDto.organization !== organizationId) {
      throw new BadRequestException(
        'Organization ID does not match provider organization ID',
      );
    }

    const providers = await this.emailsProvidersService.findAll(organizationId);

    if (providers.length === 0) {
      createEmailsProviderDto.isDefault = true;
    }

    return this.emailsProvidersService.create(
      organizationId,
      createEmailsProviderDto,
    );
  }

  @Get()
  findAll(
    @Param('organizationId') organizationId: string,
  ): Promise<EmailsProvider[]> {
    return this.emailsProvidersService.findAll(organizationId);
  }

  @Get(':providerId')
  @CacheTTL(300000)
  @UseInterceptors(CacheInterceptor)
  async findOne(
    @Param('organizationId') organizationId: string,
    @Param('providerId') providerId: string,
  ): Promise<EmailsProvider> {
    const providerDocument = await this.emailsProvidersService.findOne(
      organizationId,
      providerId,
    );

    const provider = this.emailsProviderFactory.create(providerDocument);

    providerDocument.domains = await provider.getDomains();

    return providerDocument;
  }

  @Patch(':providerId')
  async update(
    @Param('organizationId') organizationId: string,
    @Param('providerId') providerId: string,
    @Body() updateEmailsProviderDto: UpdateEmailsProviderDto,
  ): Promise<EmailsProvider> {
    const needToSetDefault = updateEmailsProviderDto.isDefault;

    let previousDefaultProvider: EmailsProvider;
    if (needToSetDefault) {
      previousDefaultProvider =
        await this.emailsProvidersService.findDefault(organizationId);
    }

    const update = await this.emailsProvidersService.update(
      organizationId,
      providerId,
      updateEmailsProviderDto,
    );

    if (
      needToSetDefault &&
      previousDefaultProvider &&
      previousDefaultProvider._id.provider !== providerId
    ) {
      await this.emailsProvidersService.update(
        organizationId,
        previousDefaultProvider._id.provider,
        { isDefault: false },
      );
    }

    await this.clearCache(organizationId, providerId);

    return update;
  }

  @Delete(':providerId')
  async remove(
    @Param('organizationId') organizationId: string,
    @Param('providerId') providerId: string,
  ) {
    const deletion = await this.emailsProvidersService.remove(
      organizationId,
      providerId,
    );

    await this.clearCache(organizationId, providerId);

    return deletion;
  }

  // Domains

  @Post(':providerId/domains')
  async createDomain(
    @Param('organizationId') organizationId: string,
    @Param('providerId') providerId: string,
    @Body('domain') domain: string,
  ): Promise<void> {
    this.logger.log(`Creating domain ${domain} for provider ${providerId}`);

    const providerDocument = await this.emailsProvidersService.findOne(
      organizationId,
      providerId,
    );

    const provider = this.emailsProviderFactory.create(providerDocument);
    await provider.addDomain(domain);

    await this.clearCache(organizationId, providerId);
  }
}
