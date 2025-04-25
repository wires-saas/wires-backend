import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Inject,
  UseInterceptors,
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { OrganizationGuard } from '../auth/organization.guard';
import {
  CACHE_MANAGER,
  CacheInterceptor,
  CacheTTL,
} from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Contacts')
@Controller('organizations/:organizationId/contacts')
@UseGuards(OrganizationGuard)
export class ContactsController {
  constructor(
    private readonly contactsService: ContactsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create new contact' })
  create(@Body() createContactDto: CreateContactDto) {
    return this.contactsService.create(createContactDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all contacts' })
  @CacheTTL(30000)
  @UseInterceptors(CacheInterceptor)
  async findAll(@Param('organizationId') organizationId: string) {
    return this.contactsService.findAll(organizationId);
  }

  @Get(':contactId')
  @ApiOperation({ summary: 'Get contact by ID' })
  findOne(@Param('contactId') contactId: string) {
    return this.contactsService.findOne(+contactId);
  }

  @Patch(':contactId')
  @ApiOperation({ summary: 'Update contact' })
  update(
    @Param('contactId') contactId: string,
    @Body() updateContactDto: UpdateContactDto,
  ) {
    return this.contactsService.update(+contactId, updateContactDto);
  }

  @Delete(':contactId')
  @ApiOperation({ summary: 'Delete contact' })
  remove(@Param('contactId') contactId: string) {
    return this.contactsService.remove(+contactId);
  }
}
