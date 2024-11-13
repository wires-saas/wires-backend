import { TestingModule } from '@nestjs/testing';
import { UserRolesController } from './user-roles.controller';
import { TestUtils } from '../../shared/utils/test.utils';

describe('UserRolesController', () => {
  let controller: UserRolesController;

  beforeEach(async () => {
    const module: TestingModule = await TestUtils.createTestingModule({
      controllers: [UserRolesController],
      providers: [],
    });

    controller = module.get<UserRolesController>(UserRolesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
