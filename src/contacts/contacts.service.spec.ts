import { TestingModule } from '@nestjs/testing';
import { ContactsService } from './contacts.service';
import { TestUtils } from '../shared/utils/test.utils';
import { ContactsProvidersService } from '../providers/contacts-providers/contacts-providers.service';
import { ContactsProviderFactory } from '../providers/contacts-providers/entities/contacts-provider.factory';

const mockContactsProvidersService = {
  findDefault: jest.fn(),
};

const mockContactsProviderFactory = {
  create: jest.fn(),
};

describe('ContactsService', () => {
  let service: ContactsService;

  beforeEach(async () => {
    const module: TestingModule = await TestUtils.createTestingModule({
      providers: [
        ContactsService,
        {
          provide: ContactsProvidersService,
          useValue: mockContactsProvidersService,
        },
        {
          provide: ContactsProviderFactory,
          useValue: mockContactsProviderFactory,
        },
      ],
    });

    service = module.get<ContactsService>(ContactsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
