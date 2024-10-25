import { Module } from '@nestjs/common';
import { ContactsProvidersService } from './contacts-providers.service';
import { ContactsProvidersController } from './contacts-providers.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Provider, ProviderSchema } from '../schemas/provider.schema';
import {
  ContactsProvider,
  ContactsProviderSchema,
} from './schemas/contacts-provider.schema';
import { SecurityModule } from '../../services/security/security.module';
import { UsersModule } from '../../users/users.module';
import { OrganizationsModule } from '../../organizations/organizations.module';

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
    SecurityModule,
    UsersModule,
    OrganizationsModule,
  ],
  controllers: [ContactsProvidersController],
  providers: [ContactsProvidersService],
})
export class ContactsProvidersModule {}
