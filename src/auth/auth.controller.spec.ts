import { TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';

import { AuthService } from './auth.service';
import { TestUtils } from '../shared/utils/test.utils';

const mockAuthService = {
  signIn: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: typeof mockAuthService;

  beforeEach(async () => {
    const module: TestingModule = await TestUtils.createTestingModule({
      providers: [{ provide: AuthService, useValue: mockAuthService }],
      controllers: [AuthController],
    });

    controller = module.get<AuthController>(AuthController);
    service = module.get<typeof mockAuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
