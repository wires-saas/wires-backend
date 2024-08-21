import { TestingModule } from '@nestjs/testing';
import { UserAvatarsController } from './user-avatars.controller';
import { UserAvatarsService } from './user-avatars.service';
import { TestUtils } from '../../shared/utils/test.utils';

describe('UserAvatarsController', () => {
  let controller: UserAvatarsController;

  beforeEach(async () => {
    const module: TestingModule = await TestUtils.createTestingModule({
      controllers: [UserAvatarsController],
      providers: [UserAvatarsService],
    });

    controller = module.get<UserAvatarsController>(UserAvatarsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
