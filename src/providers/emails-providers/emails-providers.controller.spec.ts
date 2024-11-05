import { TestingModule } from '@nestjs/testing';
import { EmailsProvidersController } from './emails-providers.controller';
import { EmailsProvidersService } from './emails-providers.service';
import { TestUtils } from '../../shared/utils/test.utils';
import { EmailsProviderFactory } from './entities/emails-provider.factory';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

const mockEmailsProvidersService = {
  findDefault: jest.fn(),
};

const mockEmailsProviderFactory = {
  create: jest.fn(),
};

describe('EmailsProvidersController', () => {
  let controller: EmailsProvidersController;

  beforeEach(async () => {
    const module: TestingModule = await TestUtils.createTestingModule({
      controllers: [EmailsProvidersController],
      providers: [
        {
          provide: EmailsProvidersService,
          useValue: mockEmailsProvidersService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: {},
        },
        {
          provide: EmailsProviderFactory,
          useValue: mockEmailsProviderFactory,
        },
      ],
    });

    controller = module.get<EmailsProvidersController>(
      EmailsProvidersController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
