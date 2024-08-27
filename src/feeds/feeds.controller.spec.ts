import { TestingModule } from '@nestjs/testing';
import { FeedsController } from './feeds.controller';
import { TestUtils } from '../shared/utils/test.utils';

describe('FeedsController', () => {
  let controller: FeedsController;

  beforeEach(async () => {
    const module: TestingModule =
      await TestUtils.createTestingModuleForContents({
        controllers: [FeedsController],
        providers: [],
      });

    controller = module.get<FeedsController>(FeedsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
