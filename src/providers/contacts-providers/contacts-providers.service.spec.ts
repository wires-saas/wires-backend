import { Test, TestingModule } from '@nestjs/testing';
import { ContactsProvidersService } from './contacts-providers.service';

describe('ContactsProvidersService', () => {
  let service: ContactsProvidersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContactsProvidersService],
    }).compile();

    service = module.get<ContactsProvidersService>(ContactsProvidersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
