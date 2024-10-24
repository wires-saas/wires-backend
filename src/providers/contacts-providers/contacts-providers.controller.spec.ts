import { Test, TestingModule } from '@nestjs/testing';
import { ContactsProvidersController } from './contacts-providers.controller';
import { ContactsProvidersService } from './contacts-providers.service';

describe('ContactsProvidersController', () => {
  let controller: ContactsProvidersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactsProvidersController],
      providers: [ContactsProvidersService],
    }).compile();

    controller = module.get<ContactsProvidersController>(ContactsProvidersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
