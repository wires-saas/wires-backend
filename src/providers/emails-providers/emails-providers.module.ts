import { Module } from '@nestjs/common';
import { EmailsProvidersController } from './emails-providers.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Provider, ProviderSchema } from '../schemas/provider.schema';
import {
  EmailsProvider,
  EmailsProviderSchema,
} from './schemas/emails-provider.schema';
import { SecurityModule } from '../../services/security/security.module';
import { UsersModule } from '../../users/users.module';
import { OrganizationsModule } from '../../organizations/organizations.module';
import { EmailsProviderFactory } from './entities/emails-provider.factory';
import { CacheModule } from '@nestjs/cache-manager';
import { EmailsProvidersService } from './emails-providers.service';

@Module({
  imports: [
    CacheModule.register({
      ttl: 0,
    }),
    MongooseModule.forFeature([
      {
        name: Provider.name,
        schema: ProviderSchema,
        discriminators: [
          { name: EmailsProvider.name, schema: EmailsProviderSchema },
        ],
      },
    ]),
    SecurityModule,
    UsersModule,
    OrganizationsModule,
  ],
  controllers: [EmailsProvidersController],
  providers: [EmailsProvidersService, EmailsProviderFactory],
})
export class EmailsProvidersModule {}
