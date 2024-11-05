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
  Put,
  NotFoundException,
  Request,
  UnauthorizedException,
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
import { UpdateSendersDto } from './dto/update-senders.dto';
import { AuthenticatedRequest } from '../../shared/types/authentication.types';
import { Action } from '../../rbac/permissions/entities/action.entity';
import { ScopedSubject } from '../../rbac/casl/casl.utils';

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
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Body() createEmailsProviderDto: CreateEmailsProviderDto,
  ): Promise<EmailsProvider> {
    if (createEmailsProviderDto.organization !== organizationId) {
      throw new BadRequestException(
        'Organization ID does not match provider organization ID',
      );
    }

    if (
      req.ability.cannot(
        Action.Create,
        ScopedSubject(EmailsProvider, organizationId),
      )
    ) {
      throw new UnauthorizedException('Cannot create emails provider');
    }

    this.logger.log(
      'Creating emails provider for organization ' + organizationId,
    );

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
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
  ): Promise<EmailsProvider[]> {
    if (
      req.ability.cannot(
        Action.Read,
        ScopedSubject(EmailsProvider, organizationId),
      )
    ) {
      throw new UnauthorizedException('Cannot read emails providers');
    }

    return this.emailsProvidersService.findAll(organizationId);
  }

  @Get(':providerId')
  @CacheTTL(300000)
  @UseInterceptors(CacheInterceptor)
  async findOne(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('providerId') providerId: string,
  ): Promise<EmailsProvider> {
    if (
      req.ability.cannot(
        Action.Read,
        ScopedSubject(EmailsProvider, organizationId),
      )
    ) {
      throw new UnauthorizedException('Cannot read emails provider');
    }

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
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('providerId') providerId: string,
    @Body() updateEmailsProviderDto: UpdateEmailsProviderDto,
  ): Promise<EmailsProvider> {
    if (
      req.ability.cannot(
        Action.Update,
        ScopedSubject(EmailsProvider, organizationId),
      )
    ) {
      throw new UnauthorizedException('Cannot update emails provider');
    }

    this.logger.log(
      'Updating emails provider of organization ' + organizationId,
    );

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
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('providerId') providerId: string,
  ) {
    if (
      req.ability.cannot(
        Action.Delete,
        ScopedSubject(EmailsProvider, organizationId),
      )
    ) {
      throw new UnauthorizedException('Cannot delete emails provider');
    }

    this.logger.log(
      'Removing emails provider of organization ' + organizationId,
    );

    const deletion = await this.emailsProvidersService.remove(
      organizationId,
      providerId,
    );

    await this.clearCache(organizationId, providerId);

    return deletion;
  }

  // Senders

  @Put(':providerId/senders')
  async updateSenders(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('providerId') providerId: string,
    @Body('senders') senders: UpdateSendersDto,
  ): Promise<EmailsProvider> {
    if (
      req.ability.cannot(
        Action.Update,
        ScopedSubject(EmailsProvider, organizationId),
      )
    ) {
      throw new UnauthorizedException(
        'Cannot update senders of emails provider',
      );
    }

    this.logger.log(
      `Updating ${senders.length} senders for provider ${providerId}`,
    );

    const providerDocument = await this.emailsProvidersService.findOne(
      organizationId,
      providerId,
    );

    if (!providerDocument) {
      throw new NotFoundException('Provider not found');
    }

    await this.clearCache(organizationId, providerId);

    return this.emailsProvidersService.updateSenders(
      organizationId,
      providerId,
      senders,
    );
  }

  // Domains

  @Post(':providerId/domains')
  async createDomain(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('providerId') providerId: string,
    @Body('domain') domain: string,
  ): Promise<void> {
    if (
      req.ability.cannot(
        Action.Update,
        ScopedSubject(EmailsProvider, organizationId),
      )
    ) {
      throw new UnauthorizedException(
        'Cannot create domain for emails provider',
      );
    }

    this.logger.log(`Creating domain ${domain} for provider ${providerId}`);

    const providerDocument = await this.emailsProvidersService.findOne(
      organizationId,
      providerId,
    );

    const provider = this.emailsProviderFactory.create(providerDocument);
    await provider.addDomain(domain);

    await this.clearCache(organizationId, providerId);
  }

  @Delete(':providerId/domains/:domain')
  async deleteDomain(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('providerId') providerId: string,
    @Param('domain') domain: string,
  ): Promise<void> {
    if (
      req.ability.cannot(
        Action.Update,
        ScopedSubject(EmailsProvider, organizationId),
      )
    ) {
      throw new UnauthorizedException(
        'Cannot delete domain of emails provider',
      );
    }

    this.logger.log(`Deleting domain ${domain} of provider ${providerId}`);

    const providerDocument = await this.emailsProvidersService.findOne(
      organizationId,
      providerId,
    );

    const provider = this.emailsProviderFactory.create(providerDocument);
    await provider.removeDomain(domain);

    await this.clearCache(organizationId, providerId);
  }

  @Post(':providerId/domains/:domain/dns')
  async checkDomain(
    @Request() req: AuthenticatedRequest,
    @Param('organizationId') organizationId: string,
    @Param('providerId') providerId: string,
    @Param('domain') domain: string,
  ): Promise<Domain> {
    if (
      req.ability.cannot(
        Action.Update,
        ScopedSubject(EmailsProvider, organizationId),
      )
    ) {
      throw new UnauthorizedException('Cannot check domain of emails provider');
    }

    this.logger.log(`Checking domain ${domain} for provider ${providerId}`);

    const providerDocument = await this.emailsProvidersService.findOne(
      organizationId,
      providerId,
    );

    const provider = this.emailsProviderFactory.create(providerDocument);
    providerDocument.domains = await provider.getDomains();

    const matchingDomain = providerDocument.domains.find(
      (d: Domain) => d.domain === domain,
    );
    if (!matchingDomain) {
      throw new BadRequestException('Domain not found, must be added first');
    }

    await provider.checkDomain(matchingDomain);

    await this.clearCache(organizationId, providerId);

    return matchingDomain;
  }
}
