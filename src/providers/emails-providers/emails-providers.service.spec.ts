import { Test, TestingModule } from '@nestjs/testing';
import { EmailsProvidersService } from './emails-providers.service';

describe('EmailsProvidersService', () => {
  let service: EmailsProvidersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailsProvidersService],
    }).compile();

    service = module.get<EmailsProvidersService>(EmailsProvidersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
