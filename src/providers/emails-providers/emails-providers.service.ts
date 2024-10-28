import { Injectable, Logger } from '@nestjs/common';
import { CreateEmailsProviderDto } from './dto/create-emails-provider.dto';
import { UpdateEmailsProviderDto } from './dto/update-emails-provider.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailsProvider } from './schemas/emails-provider.schema';
import { EncryptService } from '../../services/security/encrypt.service';
import { AuthenticationType } from '../../shared/schemas/authentication.schema';
import { randomId } from '../../shared/utils/db.utils';
import { ProviderType } from '../entities/provider.entities';

@Injectable()
export class EmailsProvidersService {
  private logger: Logger = new Logger(EmailsProvidersService.name);

  constructor(
    @InjectModel(EmailsProvider.name)
    private emailsProviderModel: Model<EmailsProvider>,
    private encryptService: EncryptService,
  ) {}

  create(
    organizationId: string,
    createEmailsProviderDto: CreateEmailsProviderDto,
  ): Promise<EmailsProvider> {
    const authentication = createEmailsProviderDto.secretKey
      ? {
          type: AuthenticationType.API_KEY_SECRET,
          apiKey: this.encryptService.encrypt(createEmailsProviderDto.apiKey),
          secretKey: this.encryptService.encrypt(
            createEmailsProviderDto.secretKey,
          ),
        }
      : {
          type: AuthenticationType.API_KEY,
          apiKey: this.encryptService.encrypt(createEmailsProviderDto.apiKey),
        };

    return new this.emailsProviderModel(
      new EmailsProvider({
        _id: {
          organization: organizationId,
          provider: randomId(),
        },
        type: ProviderType.Emails,
        implementation: createEmailsProviderDto.type,

        displayName: createEmailsProviderDto.displayName,
        description: createEmailsProviderDto.description,

        isDefault: createEmailsProviderDto.isDefault,
        isVerified: false,

        authentication,
      }),
    ).save();
  }

  async findAll(organizationId: string): Promise<EmailsProvider[]> {
    const providers: EmailsProvider[] = await this.emailsProviderModel.find({
      '_id.organization': organizationId,
    });

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

  async findDefault(
    organizationId: string,
  ): Promise<EmailsProvider | undefined> {
    return this.emailsProviderModel
      .findOne({
        '_id.organization': organizationId,
        isDefault: true,
      })
      .exec()
      .then((provider) => {
        if (!provider) {
          return undefined;
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

  async findOne(
    organizationId: string,
    providerId: string,
  ): Promise<EmailsProvider> {
    return this.emailsProviderModel
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
    updateContactsProviderDto: UpdateEmailsProviderDto,
  ): Promise<EmailsProvider> {
    return this.emailsProviderModel
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
    return this.emailsProviderModel
      .deleteOne({
        '_id.organization': organizationId,
        '_id.provider': providerId,
      })
      .exec();
  }
}
