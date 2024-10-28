import { Test, TestingModule } from '@nestjs/testing';
import { EmailsProvidersController } from './emails-providers.controller';
import { EmailsProvidersService } from './emails-providers.service';

describe('EmailsProvidersController', () => {
  let controller: EmailsProvidersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailsProvidersController],
      providers: [EmailsProvidersService],
    }).compile();

    controller = module.get<EmailsProvidersController>(
      EmailsProvidersController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
