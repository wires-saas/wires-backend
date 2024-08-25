import { Test, TestingModule } from '@nestjs/testing';
import { FeedRunsController } from './feed-runs.controller';
import { FeedRunsService } from './feed-runs.service';

describe('RunsController', () => {
  let controller: FeedRunsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedRunsController],
      providers: [FeedRunsService],
    }).compile();

    controller = module.get<FeedRunsController>(FeedRunsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
