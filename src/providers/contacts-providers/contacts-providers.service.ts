import { Injectable, Logger } from '@nestjs/common';
import { CreateContactsProviderDto } from './dto/create-contacts-provider.dto';
import { UpdateContactsProviderDto } from './dto/update-contacts-provider.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ContactsProvider } from './schemas/contacts-provider.schema';
import { EncryptService } from '../../services/security/encrypt.service';
import { ContactsProviderFactory } from './entities/contacts-provider.factory';

@Injectable()
export class ContactsProvidersService {
  private logger: Logger = new Logger(ContactsProvidersService.name);

  constructor(
    @InjectModel(ContactsProvider.name)
    private contactsProviderModel: Model<ContactsProvider>,
    private encryptService: EncryptService,
  ) {}

  create(createContactsProviderDto: CreateContactsProviderDto) {
    return this.contactsProviderModel.create(createContactsProviderDto);
  }

  async findAll(): Promise<ContactsProvider[]> {
    const providers: ContactsProvider[] =
      await this.contactsProviderModel.find();
    this.logger.log(providers);

    providers.forEach((provider) => {
      this.logger.log(
        this.encryptService.decrypt(provider.authentication.apiKey),
      );
      this.logger.log(
        this.encryptService.decrypt(provider.authentication.secretKey),
      );
    });

    return providers;
  }

  async findOne(
    organizationId: string,
    providerId: string,
  ): Promise<ContactsProvider> {
    return this.contactsProviderModel
      .findOne({
        '_id.organization': organizationId,
        '_id.provider': new Types.ObjectId(providerId),
      })
      .exec();
  }

  update(id: number, updateContactsProviderDto: UpdateContactsProviderDto) {
    return `This action updates a #${id} contactsProvider`;
  }

  remove(id: number) {
    return `This action removes a #${id} contactsProvider`;
  }
}
