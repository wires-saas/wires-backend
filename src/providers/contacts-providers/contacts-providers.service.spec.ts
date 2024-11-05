import { TestingModule } from '@nestjs/testing';
import { ContactsProvidersService } from './contacts-providers.service';
import { getModelToken } from '@nestjs/mongoose';
import { ContactsProvider } from './schemas/contacts-provider.schema';
import { TestUtils } from '../../shared/utils/test.utils';

const mockContactsModel = {
  save: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  insertMany: jest.fn(),
  deleteMany: jest.fn(),
  deleteOne: jest.fn(),
};

describe('ContactsProvidersService', () => {
  let service: ContactsProvidersService;

  beforeEach(async () => {
    const module: TestingModule = await TestUtils.createTestingModule({
      providers: [
        ContactsProvidersService,
        {
          provide: getModelToken(ContactsProvider.name),
          useValue: mockContactsModel,
        },
      ],
    });

    service = module.get<ContactsProvidersService>(ContactsProvidersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
