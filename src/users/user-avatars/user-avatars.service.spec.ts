import { TestingModule } from '@nestjs/testing';
import { UserAvatarsService } from './user-avatars.service';
import { TestUtils } from '../../shared/utils/test.utils';

describe('UserAvatarsService', () => {
  let service: UserAvatarsService;

  beforeEach(async () => {
    const module: TestingModule = await TestUtils.createTestingModule({
      providers: [UserAvatarsService],
      controllers: [],
    });

    service = module.get<UserAvatarsService>(UserAvatarsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
