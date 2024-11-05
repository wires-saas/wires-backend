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
import { ContactsProvidersService } from './contacts-providers.service';
import { CreateContactsProviderDto } from './dto/create-contacts-provider.dto';
import { UpdateContactsProviderDto } from './dto/update-contacts-provider.dto';
import { ContactsProvider } from './schemas/contacts-provider.schema';
import { OrganizationGuard } from '../../auth/organization.guard';
import { ContactsProviderFactory } from './entities/contacts-provider.factory';
import {
  CACHE_MANAGER,
  CacheInterceptor,
  CacheTTL,
} from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Controller('organizations/:organizationId/providers/contacts')
@UseGuards(OrganizationGuard)
export class ContactsProvidersController {
  private logger: Logger = new Logger(ContactsProvidersController.name);

  constructor(
    private readonly contactsProvidersService: ContactsProvidersService,
    private readonly contactsProviderFactory: ContactsProviderFactory,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private async clearCache(organizationId: string, providerId: string) {
    const keys = await this.cacheManager.store.keys(
      `/v1/organizations/${organizationId}/providers/contacts/${providerId}*`,
    );

    for (const key of keys) {
      this.logger.debug('Deleting cache key: ' + key);
      await this.cacheManager.del(key);
    }
  }

  @Post()
  async create(
    @Param('organizationId') organizationId: string,
    @Body() createContactsProviderDto: CreateContactsProviderDto,
  ): Promise<ContactsProvider> {
    if (createContactsProviderDto.organization !== organizationId) {
      throw new BadRequestException(
        'Organization ID does not match provider organization ID',
      );
    }

    const providers =
      await this.contactsProvidersService.findAll(organizationId);

    if (providers.length === 0) {
      createContactsProviderDto.isDefault = true;
    }

    return this.contactsProvidersService.create(
      organizationId,
      createContactsProviderDto,
    );
  }

  @Get()
  findAll(
    @Param('organizationId') organizationId: string,
  ): Promise<ContactsProvider[]> {
    return this.contactsProvidersService.findAll(organizationId);
  }

  @Get(':providerId')
  async findOne(
    @Param('organizationId') organizationId: string,
    @Param('providerId') providerId: string,
  ): Promise<ContactsProvider> {
    return this.contactsProvidersService.findOne(organizationId, providerId);
  }

  // TODO move this in contacts module

  @Get(':providerId/total')
  @CacheTTL(60000)
  @UseInterceptors(CacheInterceptor)
  async findTotalContacts(
    @Param('organizationId') organizationId: string,
    @Param('providerId') providerId: string,
  ): Promise<number> {
    this.logger.log('Finding total contacts');
    const providerDocument = await this.contactsProvidersService.findOne(
      organizationId,
      providerId,
    );

    const provider = this.contactsProviderFactory.create(providerDocument);

    return await provider.getContactsCount();
  }

  @Get(':providerId/schema')
  @CacheTTL(60000)
  @UseInterceptors(CacheInterceptor)
  async findContactSchema(
    @Param('organizationId') organizationId: string,
    @Param('providerId') providerId: string,
  ): Promise<number> {
    this.logger.log('Finding contact schema');
    const providerDocument = await this.contactsProvidersService.findOne(
      organizationId,
      providerId,
    );

    const provider = this.contactsProviderFactory.create(providerDocument);

    return await provider.getContactSchema();
  }

  @Patch(':providerId')
  async update(
    @Param('organizationId') organizationId: string,
    @Param('providerId') providerId: string,
    @Body() updateContactsProviderDto: UpdateContactsProviderDto,
  ): Promise<ContactsProvider> {
    const needToSetDefault = updateContactsProviderDto.isDefault;

    let previousDefaultProvider: ContactsProvider;
    if (needToSetDefault) {
      previousDefaultProvider =
        await this.contactsProvidersService.findDefault(organizationId);
    }

    const update = await this.contactsProvidersService.update(
      organizationId,
      providerId,
      updateContactsProviderDto,
    );

    if (
      needToSetDefault &&
      previousDefaultProvider &&
      previousDefaultProvider._id.provider !== providerId
    ) {
      await this.contactsProvidersService.update(
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
    const deletion = await this.contactsProvidersService.remove(
      organizationId,
      providerId,
    );

    await this.clearCache(organizationId, providerId);

    return deletion;
  }
}
