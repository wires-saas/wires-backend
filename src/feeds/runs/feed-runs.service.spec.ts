import { Test, TestingModule } from '@nestjs/testing';
import { FeedRunsService } from './feed-runs.service';
import { TestUtils } from '../../shared/utils/test.utils';

describe('RunsService', () => {
  let service: FeedRunsService;

  beforeEach(async () => {
    const module: TestingModule =
      await TestUtils.createTestingModuleForContents({
        providers: [FeedRunsService],
      });

    service = module.get<FeedRunsService>(FeedRunsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
