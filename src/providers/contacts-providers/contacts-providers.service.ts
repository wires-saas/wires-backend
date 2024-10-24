import { Injectable, Logger } from '@nestjs/common';
import { CreateContactsProviderDto } from './dto/create-contacts-provider.dto';
import { UpdateContactsProviderDto } from './dto/update-contacts-provider.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContactsProvider } from './schemas/contacts-provider.schema';

@Injectable()
export class ContactsProvidersService {
  private logger: Logger = new Logger(ContactsProvidersService.name);

  constructor(
    @InjectModel(ContactsProvider.name)
    private contactsProviderModel: Model<ContactsProvider>,
  ) {}

  create(createContactsProviderDto: CreateContactsProviderDto) {
    return this.contactsProviderModel.create(createContactsProviderDto);
  }

  async findAll(): Promise<ContactsProvider[]> {
    const providers = await this.contactsProviderModel.find();
    this.logger.log(providers);

    return providers;
  }

  findOne(id: number) {
    return `This action returns a #${id} contactsProvider`;
  }

  update(id: number, updateContactsProviderDto: UpdateContactsProviderDto) {
    return `This action updates a #${id} contactsProvider`;
  }

  remove(id: number) {
    return `This action removes a #${id} contactsProvider`;
  }
}
