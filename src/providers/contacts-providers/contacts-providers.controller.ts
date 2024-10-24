import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ContactsProvidersService } from './contacts-providers.service';
import { CreateContactsProviderDto } from './dto/create-contacts-provider.dto';
import { UpdateContactsProviderDto } from './dto/update-contacts-provider.dto';
import { ContactsProvider } from './schemas/contacts-provider.schema';

@Controller('providers/contacts')
export class ContactsProvidersController {
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contactsProvidersService.findOne(+id);
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
