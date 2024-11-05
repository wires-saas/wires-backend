import { Controller, Inject, UseGuards } from '@nestjs/common';
import { OrganizationGuard } from '../../auth/organization.guard';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ContactListsService } from './contact-lists.service';

@Controller('organizations/:organizationId/contact-lists')
@UseGuards(OrganizationGuard)
export class ContactListsController {
  constructor(
    private readonly contactListsService: ContactListsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
}
