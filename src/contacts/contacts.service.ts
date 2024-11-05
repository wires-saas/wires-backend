import { Injectable } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ContactsProvidersService } from '../providers/contacts-providers/contacts-providers.service';
import { ContactsProviderFactory } from '../providers/contacts-providers/entities/contacts-provider.factory';

@Injectable()
export class ContactsService {
  constructor(
    private contactsProvidersService: ContactsProvidersService,
    private contactsProviderFactory: ContactsProviderFactory,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(createContactDto: CreateContactDto) {
    return 'This action adds a new contact';
  }

  async findAll(organizationId: string) {
    const provider =
      await this.contactsProvidersService.findDefault(organizationId);

    const contactsProvider = this.contactsProviderFactory.create(provider);

    return contactsProvider.getContacts();
  }

  findOne(id: number) {
    return `This action returns a #${id} contact`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, updateContactDto: UpdateContactDto) {
    return `This action updates a #${id} contact`;
  }

  remove(id: number) {
    return `This action removes a #${id} contact`;
  }
}
