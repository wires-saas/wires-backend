import { TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { TestUtils } from '../../shared/utils/test.utils';

describe('RolesController', () => {
  let controller: RolesController;

  beforeEach(async () => {
    const module: TestingModule = await TestUtils.createTestingModule({
      controllers: [RolesController],
      providers: [],
    });

    controller = module.get<RolesController>(RolesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
