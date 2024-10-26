import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ContactsProvidersService } from './contacts-providers.service';
import { CreateContactsProviderDto } from './dto/create-contacts-provider.dto';
import { UpdateContactsProviderDto } from './dto/update-contacts-provider.dto';
import { ContactsProvider } from './schemas/contacts-provider.schema';
import { OrganizationGuard } from '../../auth/organization.guard';
import { MailjetContactsProvider } from './entities/mailjet-contacts-provider';
import { ContactsProviderFactory } from './entities/contacts-provider.factory';

@Controller('organizations/:organizationId/providers/contacts')
@UseGuards(OrganizationGuard)
export class ContactsProvidersController {
  private logger: Logger = new Logger(ContactsProvidersController.name);

  constructor(
    private readonly contactsProvidersService: ContactsProvidersService,
    private readonly contactsProviderFactory: ContactsProviderFactory,
  ) {}

  @Post()
  create(
    @Param('organizationId') organizationId: string,
    @Body() createContactsProviderDto: CreateContactsProviderDto,
  ) {
    if (createContactsProviderDto.organization !== organizationId) {
      throw new BadRequestException(
        'Organization ID does not match provider organization ID',
      );
    }
    return this.contactsProvidersService.create(
      organizationId,
      createContactsProviderDto,
    );
  }

  @Get()
  findAll(): Promise<ContactsProvider[]> {
    return this.contactsProvidersService.findAll();
  }

  @Get(':providerId')
  async findOne(
    @Param('organizationId') organizationId: string,
    @Param('providerId') providerId: string,
  ): Promise<ContactsProvider> {
    const providerDocument = (await this.contactsProvidersService.findOne(
      organizationId,
      providerId,
    )) as MailjetContactsProvider;

    const provider = this.contactsProviderFactory.create(providerDocument);

    const totalContacts = await provider.getContactsCount();
    this.logger.debug(totalContacts);
    this.logger.log('Seed: ', (provider as any).seed);

    return providerDocument;
  }

  @Patch(':providerId')
  async update(
    @Param('organizationId') organizationId: string,
    @Param('providerId') providerId: string,
    @Body() updateContactsProviderDto: UpdateContactsProviderDto,
  ): Promise<ContactsProvider> {
    return this.contactsProvidersService.update(
      organizationId,
      providerId,
      updateContactsProviderDto,
    );
  }

  @Delete(':providerId')
  async remove(
    @Param('organizationId') organizationId: string,
    @Param('providerId') providerId: string,
  ) {
    return this.contactsProvidersService.remove(organizationId, providerId);
  }
}
