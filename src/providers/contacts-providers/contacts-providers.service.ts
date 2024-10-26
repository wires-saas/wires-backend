import { Injectable, Logger } from '@nestjs/common';
import { CreateContactsProviderDto } from './dto/create-contacts-provider.dto';
import { UpdateContactsProviderDto } from './dto/update-contacts-provider.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContactsProvider } from './schemas/contacts-provider.schema';
import { EncryptService } from '../../services/security/encrypt.service';
import { AuthenticationType } from '../../shared/schemas/authentication.schema';
import { randomId } from '../../shared/utils/db.utils';
import { ProviderType } from '../entities/provider.entities';

@Injectable()
export class ContactsProvidersService {
  private logger: Logger = new Logger(ContactsProvidersService.name);

  constructor(
    @InjectModel(ContactsProvider.name)
    private contactsProviderModel: Model<ContactsProvider>,
    private encryptService: EncryptService,
  ) {}

  create(
    organizationId: string,
    createContactsProviderDto: CreateContactsProviderDto,
  ): Promise<ContactsProvider> {
    const authentication = createContactsProviderDto.secretKey
      ? {
          type: AuthenticationType.API_KEY_SECRET,
          apiKey: this.encryptService.encrypt(createContactsProviderDto.apiKey),
          secretKey: this.encryptService.encrypt(
            createContactsProviderDto.secretKey,
          ),
        }
      : {
          type: AuthenticationType.API_KEY,
          apiKey: this.encryptService.encrypt(createContactsProviderDto.apiKey),
        };

    return new this.contactsProviderModel(
      new ContactsProvider({
        _id: {
          organization: organizationId,
          provider: randomId(),
        },
        type: ProviderType.Contacts,
        implementation: createContactsProviderDto.type,

        displayName: createContactsProviderDto.displayName,
        description: createContactsProviderDto.description,

        authentication,
      }),
    ).save();
  }

  async findAll(): Promise<ContactsProvider[]> {
    const providers: ContactsProvider[] =
      await this.contactsProviderModel.find();

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
        '_id.provider': providerId,
      })
      .exec()
      .then((provider) => {
        if (!provider) {
          throw new Error('Provider not found');
        }

        if (provider.authentication.apiKey) {
          provider.authentication.apiKey = this.encryptService.decrypt(
            provider.authentication.apiKey,
          );
        }

        if (provider.authentication.secretKey) {
          provider.authentication.secretKey = this.encryptService.decrypt(
            provider.authentication.secretKey,
          );
        }

        return provider;
      });
  }

  update(
    organizationId: string,
    providerId: string,
    updateContactsProviderDto: UpdateContactsProviderDto,
  ): Promise<ContactsProvider> {
    return this.contactsProviderModel
      .findOneAndUpdate(
        {
          '_id.organization': organizationId,
          '_id.provider': providerId,
        },
        {
          $set: updateContactsProviderDto,
        },
        {
          new: true,
        },
      )
      .exec();
  }

  remove(organizationId: string, providerId: string) {
    return this.contactsProviderModel
      .deleteOne({
        '_id.organization': organizationId,
        '_id.provider': providerId,
      })
      .exec();
  }
}
