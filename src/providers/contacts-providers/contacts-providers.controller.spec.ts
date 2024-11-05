import { TestingModule } from '@nestjs/testing';
import { ContactsProvidersController } from './contacts-providers.controller';
import { ContactsProvidersService } from './contacts-providers.service';
import { TestUtils } from '../../shared/utils/test.utils';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ContactsProviderFactory } from './entities/contacts-provider.factory';

const mockContactsProvidersService = {
  findDefault: jest.fn(),
};

const mockContactsProviderFactory = {
  create: jest.fn(),
};

describe('ContactsProvidersController', () => {
  let controller: ContactsProvidersController;

  beforeEach(async () => {
    const module: TestingModule = await TestUtils.createTestingModule({
      controllers: [ContactsProvidersController],
      providers: [
        {
          provide: ContactsProvidersService,
          useValue: mockContactsProvidersService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: {},
        },
        {
          provide: ContactsProviderFactory,
          useValue: mockContactsProviderFactory,
        },
      ],
    });

    controller = module.get<ContactsProvidersController>(
      ContactsProvidersController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
