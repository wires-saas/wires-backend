import { TestingModule } from '@nestjs/testing';
import { EmailsProvidersService } from './emails-providers.service';
import { TestUtils } from '../../shared/utils/test.utils';
import { EmailsProvider } from './schemas/emails-provider.schema';
import { getModelToken } from '@nestjs/mongoose';

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

describe('EmailsProvidersService', () => {
  let service: EmailsProvidersService;

  beforeEach(async () => {
    const module: TestingModule = await TestUtils.createTestingModule({
      providers: [
        EmailsProvidersService,
        {
          provide: getModelToken(EmailsProvider.name),
          useValue: mockContactsModel,
        },
      ],
    });

    service = module.get<EmailsProvidersService>(EmailsProvidersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
