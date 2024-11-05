import { Module } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';
import { ContactsProvidersModule } from '../providers/contacts-providers/contacts-providers.module';
import { SecurityModule } from '../services/security/security.module';
import { UsersModule } from '../users/users.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ContactListsController } from './contact-lists/contact-lists.controller';
import { ContactListsService } from './contact-lists/contact-lists.service';

@Module({
  imports: [
    CacheModule.register({
      ttl: 0,
    }),
    ContactsProvidersModule,
    SecurityModule,
    UsersModule,
    OrganizationsModule,
  ],
  controllers: [ContactsController, ContactListsController],
  providers: [ContactsService, ContactListsService],
})
export class ContactsModule {}
