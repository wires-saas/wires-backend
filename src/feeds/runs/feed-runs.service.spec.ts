import { Test, TestingModule } from '@nestjs/testing';
import { FeedRunsService } from './feed-runs.service';

describe('RunsService', () => {
  let service: FeedRunsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeedRunsService],
    }).compile();

    service = module.get<FeedRunsService>(FeedRunsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
