import { TestingModule } from '@nestjs/testing';
import { FeedRunsController } from './feed-runs.controller';
import { TestUtils } from '../../shared/utils/test.utils';

describe('RunsController', () => {
  let controller: FeedRunsController;

  beforeEach(async () => {
    const module: TestingModule =
      await TestUtils.createTestingModuleForContents({
        controllers: [FeedRunsController],
        providers: [],
      });

    controller = module.get<FeedRunsController>(FeedRunsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
