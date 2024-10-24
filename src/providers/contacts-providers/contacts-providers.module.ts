import { Module } from '@nestjs/common';
import { ContactsProvidersService } from './contacts-providers.service';
import { ContactsProvidersController } from './contacts-providers.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Provider, ProviderSchema } from '../schemas/provider.schema';
import {
  ContactsProvider,
  ContactsProviderSchema,
} from './schemas/contacts-provider.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Provider.name,
        schema: ProviderSchema,
        discriminators: [
          { name: ContactsProvider.name, schema: ContactsProviderSchema },
        ],
      },
    ]),
  ],
  controllers: [ContactsProvidersController],
  providers: [ContactsProvidersService],
})
export class ContactsProvidersModule {}
