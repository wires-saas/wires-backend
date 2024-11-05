import { TestingModule } from '@nestjs/testing';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { TestUtils } from '../shared/utils/test.utils';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

const mockContactsService = {
  findAll: jest.fn(),
};

describe('ContactsController', () => {
  let controller: ContactsController;

  beforeEach(async () => {
    const module: TestingModule = await TestUtils.createTestingModule({
      controllers: [ContactsController],
      providers: [
        {
          provide: ContactsService,
          useValue: mockContactsService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: {},
        },
      ],
    });

    controller = module.get<ContactsController>(ContactsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
