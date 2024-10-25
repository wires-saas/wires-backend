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
} from '@nestjs/common';
import { ContactsProvidersService } from './contacts-providers.service';
import { CreateContactsProviderDto } from './dto/create-contacts-provider.dto';
import { UpdateContactsProviderDto } from './dto/update-contacts-provider.dto';
import { ContactsProvider } from './schemas/contacts-provider.schema';
import { OrganizationGuard } from '../../auth/organization.guard';

@Controller('organizations/:organizationId/providers/contacts')
@UseGuards(OrganizationGuard)
export class ContactsProvidersController {
  private logger: Logger = new Logger(ContactsProvidersController.name);

  constructor(
    private readonly contactsProvidersService: ContactsProvidersService,
  ) {}

  @Post()
  create(@Body() createContactsProviderDto: CreateContactsProviderDto) {
    return this.contactsProvidersService.create(createContactsProviderDto);
  }

  @Get()
  findAll(): Promise<ContactsProvider[]> {
    return this.contactsProvidersService.findAll();
  }

  @Get(':providerId')
  findOne(
    @Param('organizationId') organizationId: string,
    @Param('providerId') providerId: string,
  ): Promise<ContactsProvider> {
    this.logger.log('organizationId', organizationId);
    return this.contactsProvidersService.findOne(organizationId, providerId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateContactsProviderDto: UpdateContactsProviderDto,
  ) {
    return this.contactsProvidersService.update(+id, updateContactsProviderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contactsProvidersService.remove(+id);
  }
}
