import { TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { TestUtils } from '../shared/utils/test.utils';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await TestUtils.createTestingModule({
      providers: [AuthService],
      controllers: [],
    });

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
