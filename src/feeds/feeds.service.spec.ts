import { TestingModule } from '@nestjs/testing';
import { FeedsService } from './feeds.service';
import { TestUtils } from '../shared/utils/test.utils';
import { MongooseModule } from '@nestjs/mongoose';
import { Feed, FeedSchema } from './schemas/feed.schema';

describe('FeedsService', () => {
  let service: FeedsService;

  beforeEach(async () => {
    const module: TestingModule = await TestUtils.createTestingModule({
      imports: [
        MongooseModule.forFeature([{ name: Feed.name, schema: FeedSchema }]),
      ],
      providers: [FeedsService],
      controllers: [],
    });

    service = module.get<FeedsService>(FeedsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
