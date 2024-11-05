import { TestingModule } from '@nestjs/testing';
import { ContactListsController } from './contact-lists.controller';
import { TestUtils } from '../../shared/utils/test.utils';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ContactListsService } from './contact-lists.service';

const mockContactListsService = {
  findAll: jest.fn(),
};

describe('ContactListsController', () => {
  let controller: ContactListsController;

  beforeEach(async () => {
    const module: TestingModule = await TestUtils.createTestingModule({
      controllers: [ContactListsController],
      providers: [
        {
          provide: ContactListsService,
          useValue: mockContactListsService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: {},
        },
      ],
    });

    controller = module.get<ContactListsController>(ContactListsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
